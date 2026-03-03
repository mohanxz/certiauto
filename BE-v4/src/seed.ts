import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./modules/user/user.model";
import connectDB from "./config/db";

dotenv.config();

const run = async () => {
  try {
    await connectDB();

    const existingAdmin = await User.findOne({
      email: process.env.ADMIN_EMAIL,
    });

    if (existingAdmin) {
      console.log("Admin already exists.");
      process.exit(0);
    }

    const user = new User({
      name: process.env.ADMIN_NAME,
      age: Number(process.env.ADMIN_AGE),
      address: process.env.ADMIN_ADDRESS,
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
    });

    await user.save();

    console.log("Admin created successfully.");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

run();
