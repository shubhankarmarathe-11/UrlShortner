import { Db, MongoClient } from "mongodb";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const clientOptions = {
  serverApi: { version: "1", strict: true, deprecationErrors: true },
};

export async function ConnectMogo() {
  await mongoose.connect(`${process.env.MONGOOSEURI}`, clientOptions);
  await mongoose.connection.db?.admin().command({ ping: 1 });
  console.log("Pinged your deployment. You successfully connected to MongoDB!");
}

export const client = new MongoClient(`${process.env.MONGODB_URI}`);
export let db: Db;
try {
  await client.connect();

  db = client.db(`${process.env.MONGO_DB_DBNAME}`);

  await db
    .collection("urlmodels")
    .createIndex({ expireAt: 1 }, { expireAfterSeconds: 0 });

  await db
    .collection("linkanalyticsmodels")
    .createIndex({ expireAt: 1 }, { expireAfterSeconds: 0 });
} catch (error) {
  console.error(error);
}
