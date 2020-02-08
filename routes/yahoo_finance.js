const express = require("express");
const router = express.Router();
const { getYahooFinance } = require("../controllers/YahooFinance");

router.route("/").get(getYahooFinance);

module.exports = router;
