const express = require("express");
const router = express.Router();
const { yahooBreakingNews } = require("../controllers/StockMood");

router.route("/yahoo/breakingnews").get(yahooBreakingNews);

module.exports = router;
