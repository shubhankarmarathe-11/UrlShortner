import { RedisCli } from "./config/redis.ts";
import { AUTH_REGEX } from "./utils/FormatCheckers.ts";
import type { Request, Response } from "express";
import {
  RegisterUser,
  LoginUser,
  updatePassword,
  DeleteAccount,
  LoginWithGoogle,
  SignUpWithGoogle,
} from "./auth.services.ts";
import axios from "axios";

export async function GoogleSignup(req: Request, res: Response) {
  try {
    let { email, name, picture, sub } = req.payload;
  } catch (error) {
    console.error(error);
    return res.status(500).send("server error please try again");
  }
}

export async function GoogleLogin(req: Request, res: Response) {
  try {
    let { email } = req.payload;
    const isProduction = process.env.NODE_ENV === "production";

    const Login = await LoginWithGoogle({ email: email });

    if (Login.status == false)
      return res.status(500).send("server error please try again");

    if (Login.message == "user not found")
      return res.status(401).send("user not found");

    if (Login.status == true && Login.token == undefined)
      return res.status(500).send("server error please try again");

    let rt = await Login.token?.Signrefresh;
    let at = await Login.token?.Signaccess;

    res.cookie("refreshToken", rt, {
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: isProduction ? true : false,
      sameSite: isProduction ? "none" : "lax",
    });
    res.cookie("accessToken", at, {
      path: "/",
      maxAge: 15 * 60 * 1000,
      httpOnly: true,
      secure: isProduction ? true : false,
      sameSite: isProduction ? "none" : "lax",
    });

    return res.status(201).send("Login Successful");
  } catch (error) {
    console.error(error);
    return res.status(500).send("server error please try again");
  }
}

export async function SignupController(req: Request, res: Response) {
  try {
    let { email, username, password } = req.body;

    const isProduction = process.env.NODE_ENV === "production";

    const Register = await RegisterUser({
      email: email,
      username: username,
      password: password,
    });

    if (Register.message == "user exist already") {
      await RedisCli.del(`${String(req.ip)}Signup`);
      return res.status(401).send("please use different email");
    }

    if (Register.status == false) {
      await RedisCli.del(`${String(req.ip)}Signup`);
      return res.status(500).send("server error please try again");
    }

    if (
      Register.token == undefined &&
      Register.status == true &&
      Register.register == true
    ) {
      await RedisCli.del(`${String(req.ip)}Signup`);
      return res.status(302).send(`${Register.message}`);
    }

    let rt = await Register.token?.Signrefresh;

    let at = await Register.token?.Signaccess;

    res.cookie("refreshToken", rt, {
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: isProduction ? true : false,
      sameSite: isProduction ? "none" : "lax",
    });
    res.cookie("accessToken", at, {
      path: "/",
      maxAge: 15 * 60 * 1000,
      httpOnly: true,
      secure: isProduction ? true : false,
      sameSite: isProduction ? "none" : "lax",
    });

    await RedisCli.del(`${String(req.ip)}Signup`);
    return res.status(201).send(`${Register.message}`);
  } catch (error) {
    console.error(error);
    return res.status(500).send("server error please try again");
  }
}

export async function VerifyOtpController(req: Request, res: Response) {
  try {
    let { email, otp } = req.body;

    if (!AUTH_REGEX.otp.test(otp))
      return res.status(401).send("please enter valid otp");

    const createdOtp = await RedisCli.get(`${email}otp`);

    if (createdOtp == null) return res.status(400).send("otp expired");

    if (otp != createdOtp) return res.status(401).send("invalid otp");

    return res.status(201).send("correct otp");
  } catch (error) {
    console.error(error);
    return res.status(500).send("server error please try again");
  }
}

export async function LoginController(req: Request, res: Response) {
  try {
    let { email, password } = req.body;
    const isProduction = process.env.NODE_ENV === "production";

    if (!AUTH_REGEX.email.test(email))
      return res.status(401).send("please enter valid email");

    if (!AUTH_REGEX.password.test(password))
      return res.status(401).send("please enter password in valid format");

    const Login = await LoginUser({ email: email, password: password });

    if (Login.status == false)
      return res.status(500).send("server error please try again");

    if (Login.message == "user not found")
      return res.status(401).send("user not found");

    if (Login.message == "incorrect password")
      return res.status(401).send("please enter correct password");

    if (Login.status == true && Login.token == undefined)
      return res.status(500).send("server error please try again");

    let rt = await Login.token?.Signrefresh;
    let at = await Login.token?.Signaccess;

    res.cookie("refreshToken", rt, {
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: isProduction ? true : false,
      sameSite: isProduction ? "none" : "lax",
    });
    res.cookie("accessToken", at, {
      path: "/",
      maxAge: 15 * 60 * 1000,
      httpOnly: true,
      secure: isProduction ? true : false,
      sameSite: isProduction ? "none" : "lax",
    });

    return res.status(201).send("Login Successful");
  } catch (error) {
    console.error(error);
    return res.status(500).send("server error please try again");
  }
}

export async function LogoutController(req: Request, res: Response) {
  try {
    let refreshtoken = req.cookies["refreshToken"];
    let accesstoken = req.cookies["accessToken"];

    await res.clearCookie("refreshToken");
    await res.clearCookie("accessToken");

    await RedisCli.del(refreshtoken);
    await RedisCli.del(accesstoken);

    return res.status(200).send("logout successful");
  } catch (error) {
    console.error(error);
    return res.status(500).send("server error please try again");
  }
}

export async function ChangePasswordController(req: Request, res: Response) {
  try {
    let { newPassword, email } = req.body;

    if (!email) {
      const Update = await updatePassword({
        newPassword: String(newPassword),
        _id: String(req.userId),
        email: "",
      });

      if (Update.message == "please try again")
        return res.status(500).send("server error please try again");

      if (Update.message == "user not found")
        return res.status(401).send("user not found");
    }

    const Update = await updatePassword({
      newPassword: String(newPassword),
      email: String(email),
      _id: "",
    });

    if (Update.message == "please try again")
      return res.status(500).send("server error please try again");

    if (Update.message == "user not found")
      return res.status(401).send("user not found");

    return res.status(201).send("user updated");
  } catch (error) {
    console.error(error);
    return res.status(500).send("server error please try again");
  }
}

export async function deleteAccount(req: Request, res: Response) {
  try {
    let refreshtoken = req.cookies["refreshToken"];
    let accesstoken = req.cookies["accessToken"];

    const Delete = await DeleteAccount({ userId: String(req.userId) });

    if (Delete.message == "please try again")
      return res.status(500).send("server error please try again");

    await res.clearCookie("refreshToken");
    await res.clearCookie("accessToken");

    await RedisCli.del(refreshtoken);
    await RedisCli.del(accesstoken);

    return res.status(200).send("user deleted");
  } catch (error) {
    console.error(error);
    return res.status(500).send("server error please try again");
  }
}
