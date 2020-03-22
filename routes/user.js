const express = require("express");
const router = express.Router();
const { getMyStocks, addMyStock } = require("../controllers/User");

router.route("/mystocks").get(getMyStocks);

router.route("/mystocks").post(addMyStock);

module.exports = router;
