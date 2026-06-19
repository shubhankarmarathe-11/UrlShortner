import express from "express";
import { VerifyAccessToken } from "./Short.middleware.ts";
import {
  CreateEntry,
  GetALLLinks,
  RedirectController,
} from "./Short.controller.ts";

const SortingRoute = express.Router();

SortingRoute.post("/api/short/link", VerifyAccessToken, CreateEntry);

SortingRoute.get("/api/short/links", VerifyAccessToken, GetALLLinks);

SortingRoute.get("/:id/:sulg", RedirectController);

export { SortingRoute };
