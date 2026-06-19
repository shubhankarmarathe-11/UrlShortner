import type { Request, Response } from "express";
import { SendMessage } from "./email.services.ts";
import { RedisCli } from "./config/redis.ts";

async function VerifyEmailController(req: Request, res: Response) {
  try {
    const { email, type, data } = req.body;

    let { status, message } = await SendMessage(email, type, data);

    if (status == false) return res.status(400).send("please resend the email");

    if (status == true) {
      return res.status(201).send("email sent please check your spam also");
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send("server error please try again");
  }
}

async function SendCustomEmailController(req: Request, res: Response) {
  try {
    const { email, type, data } = req.body;
    let { status, message } = await SendMessage(email, type, data);

    if (status == true) {
      return res.status(201).send("email sent please check your spam also");
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send("server error please try again");
  }
}

async function SendWelcomeEmailComtroller(req: Request, res: Response) {
  try {
    const { email, type, data } = req.body;
    let { status, message } = await SendMessage(email, type, data);

    if (status == true) {
      return res.status(201).send("email sent please check your spam also");
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send("server error please try again");
  }
}

export {
  VerifyEmailController,
  SendCustomEmailController,
  SendWelcomeEmailComtroller,
};
