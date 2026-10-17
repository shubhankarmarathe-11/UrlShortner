import express from "express";
import {
  RedirectMiddleware,
  CreateNewEntryMiddleware,
} from "./Short.middleware.js";
import {
  CreateEntry,
  GetLinksController,
  RedirectController,
  FetchAnalyticsController,
  DeleteLinkController,
} from "./Short.controller.js";

import type { NextFunction, Request, Response } from "express";

const VerifyInternalToken = (
  req: Request,
  res: Response,
  Next: NextFunction,
) => {
  const backendToken = req.headers["x-internal-secret"];
  const actualToken = process.env.INTERNAL_TOKEN;

  if (!backendToken || String(backendToken) !== String(actualToken)) {
    return res.status(403).json({ error: "Access forbidden: Invalid token" });
  }
  Next();
};

const SortingRoute = express.Router();

SortingRoute.post(
  "/api/short/link",
  VerifyInternalToken,
  CreateNewEntryMiddleware,
  CreateEntry,
);

SortingRoute.get(
  "/api/short/link/user/:userId",
  VerifyInternalToken,
  GetLinksController,
);

SortingRoute.get(
  "/api/short/link/:analytics_id",
  VerifyInternalToken,
  FetchAnalyticsController,
);

SortingRoute.get(
  "/api/redirect/:userid/:slug",
  RedirectMiddleware,
  RedirectController,
);

SortingRoute.delete(
  "/api/short/link/:link_id",
  VerifyInternalToken,
  DeleteLinkController,
);

export { SortingRoute };
