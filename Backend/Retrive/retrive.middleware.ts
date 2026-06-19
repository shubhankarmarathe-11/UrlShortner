import type { Request, Response, NextFunction } from "express";
import { RedisCli } from "./config/redis.ts";
import { VerifyToken, SignAccessToken } from "./utils/GenerateToken.ts";

export async function VerifyAccessToken(
  req: Request,
  res: Response,
  Next: NextFunction,
) {
  try {
    let refreshtoken = req.cookies["refreshToken"];
    let accesstoken = req.cookies["accessToken"];

    if (!refreshtoken) {
      await res.clearCookie("refreshToken");
      await res.clearCookie("accessToken");

      return res.status(401).send("token expired");
    }

    let ttl = await RedisCli.ttl(`${refreshtoken}`);

    if (ttl <= 10) {
      res.clearCookie("refreshToken");
      res.clearCookie("accessToken");

      return res.status(401).send("token expired");
    }
    let verifyRefresh = await VerifyToken(String(refreshtoken));

    if (
      verifyRefresh.payload == undefined ||
      verifyRefresh.payload.type != "refresh"
    ) {
      await res.clearCookie("refreshToken");
      await res.clearCookie("accessToken");

      return res.status(401).send("token expired");
    }

    let ttl2 = await RedisCli.ttl(`${accesstoken}`);

    if (!accesstoken || ttl2 <= 10) {
      let SignAccess = await SignAccessToken({
        userId: String(verifyRefresh.payload.userId),
        sessionId: String(verifyRefresh.payload.sessionId),
      });

      if (SignAccess.Signaccess == undefined)
        return res.status(500).send("server error please try again");

      await RedisCli.set(
        `${SignAccess.Signaccess}`,
        `${verifyRefresh.payload.userId}`,
        "EX",
        900,
      );

      req.userId = await RedisCli.get(String(refreshtoken));
    }

    Next();
  } catch (error) {
    console.error(error);
    return res.status(500).send("server error please try again");
  }
}
