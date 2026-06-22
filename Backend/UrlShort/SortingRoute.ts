import express from "express";
import {
  VerifyAccessToken,
  RedirectMiddleware,
  CreateNewEntryMiddleware,
} from "./Short.middleware.ts";
import {
  CreateEntry,
  GetLinksController,
  RedirectController,
} from "./Short.controller.ts";

const SortingRoute = express.Router();

SortingRoute.post(
  "/api/short/link",
  VerifyAccessToken,
  CreateNewEntryMiddleware,
  CreateEntry,
);

SortingRoute.get("/api/short/link", VerifyAccessToken, GetLinksController);

SortingRoute.get("/:userid/:slug", RedirectMiddleware, RedirectController);

export { SortingRoute };
