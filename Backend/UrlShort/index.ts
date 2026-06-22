import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { ConnectMogo } from "./config/mongoconfig.ts";
import { SortingRoute } from "./SortingRoute.ts";

dotenv.config();

const app = express();
const port = parseInt(process.env.PORT) || 3004;
const isProduction = process.env.NODE_ENV === "production";

app.use(
  cors({
    origin: isProduction
      ? "https://minibaasproject.shubhankarmarathe.online"
      : "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    // allowedHeaders: "*",
    credentials: isProduction ? true : true,
  }),
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

await ConnectMogo();

app.use(SortingRoute);

app.listen(port, "0.0.0.0", () => {
  console.log(`booking service is running on the http://localhost:${port}`);
});
