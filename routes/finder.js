const express = require("express");
const router = express.Router();
const {
  getTheMarket,
  yahooBreakingNews
} = require("../controllers/StocksFinder");

router.route("/get_the_market").get(getTheMarket);
router.route("/breaking_news").get(yahooBreakingNews);

module.exports = router;
