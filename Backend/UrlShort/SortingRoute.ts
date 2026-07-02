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
  FetchAnalyticsController,
  DeleteLinkController,
} from "./Short.controller.ts";

const SortingRoute = express.Router();

SortingRoute.post(
  "/api/short/link",
  VerifyAccessToken,
  CreateNewEntryMiddleware,
  CreateEntry,
);

SortingRoute.get("/api/short/link", VerifyAccessToken, GetLinksController);

SortingRoute.get(
  "/api/short/link/:analytics_id",
  VerifyAccessToken,
  FetchAnalyticsController,
);

SortingRoute.get(
  "/api/short/:userid/:slug",
  RedirectMiddleware,
  RedirectController,
);

SortingRoute.delete(
  "/api/short/link/:link_id",
  VerifyAccessToken,
  DeleteLinkController,
);
export { SortingRoute };
