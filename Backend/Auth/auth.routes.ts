import express from "express";
import { SignupMiddleware, VerifyAccessToken } from "./auth.middleware.ts";
import {
  SignupController,
  LoginController,
  LogoutController,
  VerifyOtpController,
  ChangePasswordController,
} from "./auth.controller.ts";

const AuthServiceRoute = express.Router();

AuthServiceRoute.post("/auth/signup", SignupMiddleware, SignupController);

AuthServiceRoute.post("/auth/verifyotp", VerifyOtpController);

AuthServiceRoute.post("/auth/login", LoginController);

AuthServiceRoute.post("/auth/logout", LogoutController);

AuthServiceRoute.post("/auth/google-auth", VerifyAccessToken);

AuthServiceRoute.post("/auth/forgot-password", ChangePasswordController);

AuthServiceRoute.post(
  "/auth/changepassword",
  VerifyAccessToken,
  ChangePasswordController,
);

AuthServiceRoute.delete("/auth/account", VerifyAccessToken);

AuthServiceRoute.get("/auth/isloggedin", VerifyAccessToken, (req, res) => {
  return res.status(200).send("logged in");
});

export { AuthServiceRoute };
