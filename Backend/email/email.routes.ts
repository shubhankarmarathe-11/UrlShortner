import express from "express";
import {
  VerifyEmailController,
  SendCustomEmailController,
  SendWelcomeEmailComtroller,
} from "./email.controller.ts";
import { VerifyEmailForOTP } from "./emailMiddleware.ts";

const EmailServiceRoute = express.Router();

EmailServiceRoute.post("/welcome-email", SendWelcomeEmailComtroller);

EmailServiceRoute.post(
  "/verify-email",
  VerifyEmailForOTP,
  VerifyEmailController,
); // sends the otp to user

EmailServiceRoute.post("/send-custom-email", SendCustomEmailController);

export { EmailServiceRoute };
