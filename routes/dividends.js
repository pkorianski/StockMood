const express = require("express");
const router = express.Router();
const { getDividends } = require("../controllers/Dividends");

router.route("/").get(getDividends);

module.exports = router;
