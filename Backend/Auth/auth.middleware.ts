import { RedisCli } from "./config/redis.ts";
import { AUTH_REGEX } from "./utils/FormatCheckers.ts";
import type { Request, Response, NextFunction } from "express";
import { SignAccessToken, VerifyToken } from "./utils/GenerateToken.ts";

export async function SignupMiddleware(
  req: Request,
  res: Response,
  Next: NextFunction,
) {
  try {
    let { email, username, password } = req.body;
    if (!AUTH_REGEX.name.test(username))
      return res.status(401).send("only letters & 2-50 characters allowed.");
    if (!AUTH_REGEX.email.test(email))
      return res.status(401).send("please enter proper email");
    if (!AUTH_REGEX.password.test(password))
      return res
        .status(401)
        .send(
          "Password must contain min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char",
        );

    Next();
  } catch (error) {
    console.error(error);
    return res.status(500).send("server error please try again");
  }
}

export async function VerifyAccessToken(
  req: Request,
  res: Response,
  Next: NextFunction,
) {
  try {
    let refreshtoken = req.cookies["refreshToken"];
    let accesstoken = req.cookies["accessToken"];

    const isProduction = process.env.NODE_ENV === "production";

    if (!refreshtoken) {
      await res.clearCookie("refreshToken");
      await res.clearCookie("accessToken");

      return res.status(401).send("refresh token expired");
    }

    let ttl = await RedisCli.ttl(`${refreshtoken}`);

    if (ttl <= 10) {
      res.clearCookie("refreshToken");
      res.clearCookie("accessToken");

      return res.status(401).send("refresh token expired");
    }
    let verifyRefresh = await VerifyToken(String(refreshtoken));

    if (
      verifyRefresh.payload == undefined ||
      verifyRefresh.payload.type != "refresh"
    ) {
      await res.clearCookie("refreshToken");
      await res.clearCookie("accessToken");

      return res.status(401).send("refresh token expired");
    }

    let ttl2 = await RedisCli.ttl(`${accesstoken}`);

    if (!accesstoken || ttl2 <= 10) {
      let SignAccess = await SignAccessToken({
        userId: String(verifyRefresh.payload.userId),
        sessionId: String(verifyRefresh.payload.sessionId),
      });

      if (SignAccess.Signaccess == undefined)
        return res.status(500).send("server error please try again");

      let at = await SignAccess.Signaccess;

      res.cookie("accessToken", at, {
        path: "/",
        maxAge: 15 * 60 * 1000,
        httpOnly: true,
        secure: isProduction ? true : false,
        sameSite: isProduction ? "none" : "lax",
      });

      await RedisCli.set(
        `${await SignAccess.Signaccess}`,
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
