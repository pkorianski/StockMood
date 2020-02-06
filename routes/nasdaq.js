const express = require("express");
const router = express.Router();
const { getNasdaq } = require("../controllers/Nasdaq");

router.route("/").get(getNasdaq);

module.exports = router;
