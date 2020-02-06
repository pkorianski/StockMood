const express = require("express");
const dotenv = require("dotenv");

// Routes
const dividends = require("./routes/dividends");
const nasdaq = require("./routes/nasdaq");

// Loading environment variables
dotenv.config({ path: "./config/config.env" });

// Creating server
const app = express();

// Mount routers
app.use(express.json({ extended: false }));
app.use("/api/v1/dividends", dividends);
app.use("/api/v1/nasdaq", nasdaq);

// Set default ports
const PORT = process.env.PORT || 5000;

// Starting server
app.listen(
  PORT,
  console.log(`Server (${process.env.NODE_ENV}) running on port ${PORT}`)
);
