const express = require("express");
const dotenv = require("dotenv");

// Routes

// Loading environment variables
dotenv.config({ path: "./config/config.env" });

// Creating server
const app = express();

// Mount routers

// Set default ports
const PORT = process.env.PORT || 5000;

// Starting server
app.listen(
  PORT,
  console.log(`Server (${process.env.NODE_ENV}) running on port ${PORT}`)
);
