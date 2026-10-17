import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { ConnectMogo } from "./config/mongoconfig.js";
import { SortingRoute } from "./SortingRoute.js";
import { ConnectMysql } from "./config/mysqlconfig.js";
import type { Request } from "express";
import { subscriber } from "./config/redis.js";
import { DeleteAccountData } from "./Sorting.services.js";

dotenv.config();

const app = express();
const port: number | string | undefined =
  parseInt(process.env.PORT ? process.env.PORT : "3000") || 3000;
const isProduction = process.env.NODE_ENV === "production";

const CorsSpecificOptions = (req: Request, callback: any) => {
  let corsOptions;
  if (req.path.startsWith("/api/redirect")) {
    corsOptions = { origin: false, methods: ["GET"] }; // Disable CORS for this path
  } else {
    corsOptions = {
      origin: "http://localhost:5173",
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      credentials: isProduction ? true : true,
    }; // Allow all or specific origin
  }
  callback(null, corsOptions);
};

app.use(cors(CorsSpecificOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

await ConnectMogo();
await ConnectMysql();

subscriber.subscribe("deleteRecord", (err, count) => {
  if (err) {
    console.error("Failed to subscribe:", err);
    return;
  }
  console.log(`Subscribed to ${count} channel(s).`);
});

subscriber.on("message", (channel, message) => {
  console.log(typeof message, message);

  let result = DeleteAccountData({ userId: String(message) });
});

app.use(SortingRoute);

app.listen(port, "0.0.0.0", () => {
  console.log(`booking service is running on the http://localhost:${port}`);
});
