import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import serverless from "serverless-http"; 

import connectDB from "./config/mongodb.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";

const app = express();
connectDB();

const allowedOrigins = [
  process.env.FRONTEND_URL || "https://full-stack-authentication.vercel.app",
];

app.use(express.json());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("API Working");
});

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

export default app;
export const handler = serverless(app);
