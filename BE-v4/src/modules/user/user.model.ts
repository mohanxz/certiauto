import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { IUser } from "./user.types";
import dbCollections from "../../config/db.collection";

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

//  HASH PASSWORD ONLY ONCE
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next(); // 🔥 VERY IMPORTANT
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model<IUser>(dbCollections.USER_COLLECTION, userSchema);

export default User;
