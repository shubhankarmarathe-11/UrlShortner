import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { EmailServiceRoute } from "./email.routes.ts";

import { subscribe } from "./config/sub.ts";
import { publisher } from "./config/pub.ts";

dotenv.config();

const app = express();
const port = parseInt(process.env.PORT) || 3002;

const isProduction = process.env.NODE_ENV === "production";

app.use(
  cors({
    origin: isProduction ? "*" : "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: isProduction ? true : true,
  }),
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.status(200).send("working");
});

app.use("/api", EmailServiceRoute);

app.listen(port, "0.0.0.0", () => {
  console.log(`auth service is running on the http://localhost:${port}`);
});
