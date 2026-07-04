import express from "express";
import {
  VerifyEmailController,
  SendCustomEmailController,
  SendWelcomeEmailComtroller,
} from "./email.controller.js";
import { VerifyEmailForOTP } from "./emailMiddleware.js";

const EmailServiceRoute = express.Router();

EmailServiceRoute.post("/welcome-email", SendWelcomeEmailComtroller);

EmailServiceRoute.post(
  "/verify-email",
  VerifyEmailForOTP,
  VerifyEmailController,
); // sends the otp to user

EmailServiceRoute.post("/send-custom-email", SendCustomEmailController);

export { EmailServiceRoute };
