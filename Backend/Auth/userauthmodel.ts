import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    Username: {
      type: String,
      required: true,
    },
    Email: {
      type: String,
      required: true,
      unique: true,
    },
    Password: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      required: true,
      default: "customer",
    },
    sub: {
      type: String,
      default: "",
    },
    picture: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

export const UserModel = mongoose.model("usermodel", UserSchema);
