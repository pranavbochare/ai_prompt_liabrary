import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import promptRoutes from "./routes/prompts.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

const MONGO_URI = process.env.MONGO_URI;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "*";

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    dbState: mongoose.connection.readyState,
  });
});

app.use("/api/prompts", promptRoutes);

app.use(notFound);
app.use(errorHandler);

let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  await mongoose.connect(MONGO_URI, {
    serverApi: {
      version: "1",
      strict: true,
      deprecationErrors: true,
    },
  });

  isConnected = true;
  console.log("Connected to MongoDB Atlas");
}

export default async function handler(req, res) {
  await connectDB();
  return app(req, res);
}
