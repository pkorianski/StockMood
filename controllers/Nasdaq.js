const puppeteer = require("puppeteer");
const fetch = require("node-fetch");

// @desc Get nasdaq data
// @route GET /api/v1/nasdaq
// @access Public
exports.getNasdaq = async (req, res, next) => {
  let stock_data = await fetch(
    `https://api.nasdaq.com/api/quote/${req.body.stock_symbol}/info?assetclass=stocks`,
    {
      method: "GET"
    }
  );

  let stock_dividends = await fetch(
    `https://api.nasdaq.com/api/quote/${req.body.stock_symbol}/dividends?assetclass=stocks`,
    {
      method: "GET"
    }
  );

  let company_profile = await fetch(
    `https://api.nasdaq.com/api/company/${req.body.stock_symbol}/company-profile`,
    {
      method: "GET"
    }
  );

  let earnings_fcst = await fetch(
    `https://api.nasdaq.com/api/analyst/${req.body.stock_symbol}/earnings-forecast`,
    {
      method: "GET"
    }
  );

  let stock_summary = await fetch(
    `https://api.nasdaq.com/api/quote/${req.body.stock_symbol}/summary?assetclass=stocks`,
    {
      method: "GET"
    }
  );

  let stock_events = await fetch(
    `https://api.nasdaq.com/api/calendar/upcoming-recent?symbol=${req.body.stock_symbol}&assetclass=stocks`,
    {
      method: "GET"
    }
  );

  stock_data = await stock_data.json();
  stock_dividends = await stock_dividends.json();
  company_profile = await company_profile.json();
  earnings_fcst = await earnings_fcst.json();
  stock_summary = await stock_summary.json();
  stock_events = await stock_events.json();

  // Scraping link
  let link = `https://www.nasdaq.com/market-activity/stocks/${req.body.stock_symbol}`;

  // Building response
  let result = {
    // Data to scrape
    sector: await company_profile.data.Sector.value,
    company_name: await company_profile.data.CompanyName.value,
    key_execs: await company_profile.data.KeyExecutives,
    region: await company_profile.data.Region.value,
    stock_type: await stock_data.data.stockType,
    close_stock_price: await stock_summary.data.summaryData.PreviousClose.value,
    pe_ratio: await stock_dividends.data.payoutRatio,
    forward_pe_ratio: await stock_summary.data.summaryData.ForwardPE1Yr.value,
    eps: await stock_summary.data.summaryData.EarningsPerShare.value,
    current_yield: await stock_dividends.data.yield,
    one_year_target: await stock_summary.data.summaryData.OneYrTarget,
    dividend_history: await stock_dividends.data.dividends.rows,
    earnings_forecast: {
      quarterlyForecast: await earnings_fcst.data.quarterlyForecast.rows,
      yearlyForecast: await earnings_fcst.data.yearlyForecast.rows
    },
    events: await stock_events.data.recentEvents.events
  };

  res.status(200).json({ success: true, data: result });
};
