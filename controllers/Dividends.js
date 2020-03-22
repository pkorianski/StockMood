const puppeteer = require("puppeteer");
const fetch = require("node-fetch");
const { getDividendsData } = require("./WebServices");

// @desc Get dividends data
// @route GET /api/v1/dividends
// @access Public
exports.getDividends = async (req, res, next) => {
  const result = await getDividendsData(req.body.symbol);
  res.status(200).json({ success: true, data: result });
};
