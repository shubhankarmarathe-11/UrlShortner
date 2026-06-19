import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { RetriveRoute } from "./RetriveRoute.ts";
import { ConnectMogo } from "./config/mongoconfig.ts";

dotenv.config();

const app = express();
const port = parseInt(process.env.PORT) || 3003;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const isProduction = process.env.NODE_ENV === "production";

await ConnectMogo();

app.use(
  cors({
    origin: isProduction ? "*" : "http://localhost:5173/",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: isProduction ? ["Content-Type", "Authorization"] : "*",
    credentials: isProduction ? true : false,
  }),
);

app.use("/api", RetriveRoute);

app.listen(port, "0.0.0.0", () => {
  console.log(`auth service is running on the http://localhost:${port}`);
});
