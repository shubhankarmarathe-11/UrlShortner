import { RedisCli } from "./config/redis.ts";
import { AUTH_REGEX } from "./utils/FormatCheckers.ts";
import type { Request, Response, NextFunction } from "express";
import { SignAccessToken, VerifyToken } from "./utils/GenerateToken.ts";
import { OAuth2Client } from "google-auth-library";
import { CacheUserInfo } from "./auth.services.ts";

export async function SignupMiddleware(
  req: Request,
  res: Response,
  Next: NextFunction,
) {
  try {
    let { email, username, password } = req.body;

    if ((await RedisCli.get(`${req.ip}Signup`)) != null)
      return res.status(401).send("in progress please wait");

    await RedisCli.set(`(${String(req.ip)}Signup`, "true");

    if (!AUTH_REGEX.name.test(username)) {
      await RedisCli.del(`${String(req.ip)}Signup`);
      return res.status(401).send("only letters & 2-50 characters allowed.");
    }
    if (!AUTH_REGEX.email.test(email)) {
      await RedisCli.del(`${String(req.ip)}Signup`);
      return res.status(401).send("please enter proper email");
    }
    if (!AUTH_REGEX.password.test(password)) {
      await RedisCli.del(`${String(req.ip)}Signup`);

      return res
        .status(401)
        .send(
          "Password must contain min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char",
        );
    }

    Next();
  } catch (error) {
    console.error(error);
    await RedisCli.del(`${String(req.ip)}Signup`);
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

    let FetchArray: any = await RedisCli.get("existusers");

    if (FetchArray == null) {
      const FetchByService = await CacheUserInfo();
      if (FetchByService.status == false) {
        await res.clearCookie("refreshToken");
        await res.clearCookie("accessToken");

        return res.status(401).send("refresh token expired");
      }
      FetchArray = await RedisCli.get("existusers");
    }

    if (JSON.parse(FetchArray).length == 0) {
      console.log("len");

      await res.clearCookie("refreshToken");
      await res.clearCookie("accessToken");

      return res.status(401).send("refresh token expired");
    }

    if (
      JSON.parse(FetchArray).some(
        (val: any) => val._id == String(verifyRefresh.payload.userId),
      ) == false
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
    req.userId = await RedisCli.get(String(refreshtoken));

    Next();
  } catch (error) {
    console.error(error);
    return res.status(500).send("server error please try again");
  }
}

export async function googleOAuthMiddleware(
  req: Request,
  res: Response,
  Next: NextFunction,
) {
  try {
    let { google_token } = req.body;

    try {
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

      let Token = await client.verifyIdToken({
        idToken: google_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      req.payload = await Token.getPayload();
      Next();
    } catch (error) {
      console.error(error);
      return res.status(401).send("google service is unavailable");
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send("server error please try again");
  }
}
