const express = require("express");
const router = express.Router();
const {
  yahooBreakingNews,
  googleNews,
  bingNews,
  retrieveTweets
} = require("../controllers/StockMood");

router.route("/yahoo/breakingnews").get(yahooBreakingNews);
router.route("/google/news").get(googleNews);
router.route("/bing/news").get(bingNews);
router.route("/twitter/search").get(retrieveTweets);

module.exports = router;
