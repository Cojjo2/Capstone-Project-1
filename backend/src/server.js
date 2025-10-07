// backend/src/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import dogRoutes from "./routes/dogRoutes.js";
import ingredientRoutes from "./routes/ingredientRoutes.js";
import brandRoutes from "./routes/brandRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import storeRoutes from "./routes/storeRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Allow tests to skip the DB connection (faster & avoids touching Atlas)
if (process.env.SKIP_DB !== "true") {
  connectDB();
}

// Simple root and health endpoints
app.get("/", (req, res) => res.json({ message: "Pup Pantry API running" }));
app.get("/api/health", (req, res) =>
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  })
);

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/dogs", dogRoutes);
app.use("/api/ingredients", ingredientRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/products", productRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/inventory", inventoryRoutes);

// Start server only outside of test environment
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;
