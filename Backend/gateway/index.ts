import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { fetch } from "bun";

dotenv.config();

const app = express();
const port = parseInt(process.env.PORT) || 3000;

const isProduction = process.env.NODE_ENV === "production";

app.use(
  cors({
    origin: isProduction ? "*" : "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: isProduction ? ["Content-Type", "Authorization"] : "*",
    credentials: isProduction ? true : true,
  }),
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.post("/api/short/link", async (req, res) => {
  const { url } = req.body;
  const response = await fetch("http://localhost:3001/api/auth/isloggedin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`auth service is running on the http://localhost:${port}`);
});
