import express from "express";
import { VerifyAccessToken } from "./retrive.middleware.ts";
import {
  FetchConnectedBookingController,
  bookingDetailsController,
  fetchusersController,
  userDetailsController,
} from "./retrive.controller.ts";

export const RetriveRoute = express.Router();

// for admin

RetriveRoute.get("/admin/users", VerifyAccessToken, fetchusersController);

RetriveRoute.get(
  "/admin/bookinghistory",
  VerifyAccessToken,
  bookingDetailsController,
);

// for customer

RetriveRoute.get("/user/userdetail", VerifyAccessToken, userDetailsController);

RetriveRoute.get(
  "/user/bookinghistory",
  VerifyAccessToken,
  FetchConnectedBookingController,
);
