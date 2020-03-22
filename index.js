const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Routes
const dividends = require("./routes/dividends");
const nasdaq = require("./routes/nasdaq");
const yahoo_finance = require("./routes/yahoo_finance");
const user = require("./routes/user");
const finder = require("./routes/finder");
// const stockmood = require("./routes/stockmood");

// Loading environment variables
dotenv.config({ path: "./config/config.env" });

// Creating server
const connectDB = require("./config/db");
const app = express();

// Connect DB
connectDB();

// Mount routers
app.use(express.json({ extended: false }));
app.use("/api/v1/dividends", dividends);
app.use("/api/v1/nasdaq", nasdaq);
app.use("/api/v1/yahoo_finance", yahoo_finance);
// app.use("/api/v1/stockmood", stockmood);
app.use("/api/v1/user", user);
app.use("/api/v1/finder", finder);

// Set default ports
const PORT = process.env.PORT || 5000;

// Starting server
app.listen(
  PORT,
  console.log(`Server (${process.env.NODE_ENV}) running on port ${PORT}`)
);
