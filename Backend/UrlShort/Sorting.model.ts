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
      expires: 10,
      required: true,
    },
  },
  { timestamps: true },
);

const LinkAnalyticsSchema = new mongoose.Schema(
  {
    LinkId: {
      type: Schema.Types.ObjectId,
      ref: "UrlModel",
    },

    Data: {
      type: [
        {
          userip: {
            type: String,
            required: true,
          },

          host: {
            type: String,
            required: true,
          },
          count: {
            type: Number,
            required: true,
            default: 0,
          },
          referal: {
            type: String,
            required: true,
          },
        },
      ],
      required: false,
    },
  },
  { timestamps: true },
);

export const UrlModel = mongoose.model("UrlModel", UrlSchema);
export const LinkAnalyticsModel = mongoose.model(
  "LinkAnalyticsModel",
  LinkAnalyticsSchema,
);
