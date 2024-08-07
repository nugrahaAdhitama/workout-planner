import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoute from "./routes/auth.js";
import userRoute from "./routes/users.js";

const app = express();
dotenv.config();

const PORT = process.env.PORT || 5000;

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log("Connected to MongoDB");
  } catch (error) {
    throw new Error(error);
  }
};

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

app.use(cookieParser());
app.use(express.json());
app.use(helmet());

app.use(morgan("common"));
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);

app.listen(PORT, () => {
  console.log("Server is running on port", PORT);
  connectDB();
});
