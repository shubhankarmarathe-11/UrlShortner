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
          userip: {
            type: String,
            required: true,
          },
          host: {
            type: String,
            required: true,
          },
          referal: {
            type: String,
            required: true,
          },
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
