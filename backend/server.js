const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection options
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
};

// Database connection with retry logic
const connectWithRetry = () => {
  const mongoUri =
    process.env.MONGODB_URI || "mongodb://localhost:27017/pos_db";
  console.log("Environment variables loaded:", {
    MONGODB_URI: mongoUri,
    PORT: process.env.PORT,
  });
  console.log("Attempting MongoDB connection...");
  mongoose
    .connect(mongoUri, mongooseOptions)
    .then(() => {
      console.log("✅ MongoDB Connected Successfully!");
    })
    .catch((err) => {
      console.error("❌ MongoDB Connection Error:", err.message);
      console.log("Retrying connection in 5 seconds...");
      setTimeout(connectWithRetry, 5000);
    });
};

// Initial connection attempt
connectWithRetry();

// Connection status endpoint
app.get("/api/status", (req, res) => {
  const dbState = mongoose.connection.readyState;
  const status = {
    server: "running",
    database: dbState === 1 ? "connected" : "disconnected",
    timestamp: new Date(),
  };
  res.json(status);
});

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("./models/User");

// Auth routes
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashed });
    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || "devsecret",
      { expiresIn: "7d" }
    );
    return res.status(201).json({ token });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ message: "Signup failed" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || "devsecret",
      { expiresIn: "7d" }
    );
    return res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Login failed" });
  }
});

// Database connection state middleware
app.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      error: "Database connection is not ready",
    });
  }
  next();
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

// Receipts API
const Receipt = require("./models/Receipt");

app.post("/api/receipts", async (req, res) => {
  try {
    const { orderNumber, date, items, total } = req.body;
    if (!orderNumber || !date || !items || total == null) {
      return res.status(400).json({ message: "Missing receipt data" });
    }

    const receipt = new Receipt({
      orderNumber,
      date: new Date(date),
      items,
      total,
    });

    await receipt.save();
    return res.status(201).json({ message: "Receipt saved", receipt });
  } catch (err) {
    console.error("Error saving receipt:", err);
    return res.status(500).json({ message: "Failed to save receipt" });
  }
});
