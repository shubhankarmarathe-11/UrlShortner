import type { Request, Response, NextFunction } from "express";
import { MongoClient } from "mongodb";
import { RedisCli } from "./config/redis.ts";

export async function VerifyEmailForOTP(
  req: Request,
  res: Response,
  Next: NextFunction,
) {
  try {
    const { email } = req.body;

    const fetchRedis = await RedisCli.get(`inqueue${email}`);

    if (fetchRedis != null)
      return res
        .status(401)
        .send("please wait for 2-min before sending email again");

    const uri = process.env.MONGODB_URI;
    const client = new MongoClient(uri ? uri : "");
    try {
      await client.connect();
    } catch (error) {
      console.error(error);
      return res.status(500).send("server error please try again..");
    }

    const db = client.db(process.env.MONGO_DB_DBNAME);
    const collection = db.collection("usermodels");

    const fetchData = await collection.findOne({ Email: email });

    if (fetchData == null)
      return res.status(401).send("please enter register email ..");

    await RedisCli.set(`inqueue${email}`, "inqueue", "EX", 120);
    Next();
  } catch (error) {
    console.error(error);
    return res.status(500).send("server error please try again..");
  }
}
