import mongoose, { Schema } from "mongoose";

const UrlSchema = new mongoose.Schema(
  {
    LongUrl: {
      type: String,
      required: true,
    },

    Slug: {
      type: String,
      required: true,
      unique: true,
    },

    UserId: {
      type: Schema.Types.ObjectId,
      ref: "usermodel",
    },

    LinkAnalytics: [
      {
        type: Schema.Types.ObjectId,
        ref: "LinkAnalyticsModel",
      },
    ],

    expireAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

const LinkAnalyticsSchema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "usermodel",
    },

    LinkId: {
      type: Schema.Types.ObjectId,
      ref: "UrlModel",
    },

    Data: {
      type: [
        {
          userip: { type: String },
          clickedAt: { type: String },
          userAgent: { type: String },
          browser: { type: String },
          os: { type: String },
          deviceType: { type: String },
          referer: { type: String },
          utmSource: { type: String },
          utmMedium: { type: String },
          utmCampaign: { type: String },
          responseTimeMs: { type: Number },
        },
      ],
      required: false,
    },

    ClickedCount: {
      type: Number,
      required: true,
      default: 0,
    },

    expireAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

export const UrlModel = mongoose.model("UrlModel", UrlSchema);
export const LinkAnalyticsModel = mongoose.model(
  "LinkAnalyticsModel",
  LinkAnalyticsSchema,
);
