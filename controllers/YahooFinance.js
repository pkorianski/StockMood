const puppeteer = require("puppeteer");
const fetch = require("node-fetch");

exports.getYahooFinance = async (req, res, next) => {
  let recommended_symbols = await fetch(
    `https://query2.finance.yahoo.com/v6/finance/recommendationsbysymbol/${req.body.stock_symbol}?`,
    {
      method: "GET"
    }
  );

  let esg_performance = await fetch(
    `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${req.body.stock_symbol}?formatted=true&crumb=2P22OZ1C2g5&lang=en-US&region=US&modules=esgScores&corsDomain=finance.yahoo.com`,
    {
      method: "GET"
    }
  );

  recommended_symbols = await recommended_symbols.json();
  esg_performance = await esg_performance.json();

  // Building response
  let result = {
    // Data to scrape
    recommended_symbols: await recommended_symbols.finance.result,
    total_esg_risk_score: await esg_performance.quoteSummary.result[0].esgScores
      .totalEsg.fmt,
    esg_performance: await esg_performance.quoteSummary.result[0].esgScores
      .esgPerformance,
    related_controversy: await esg_performance.quoteSummary.result[0].esgScores
      .relatedControversy
  };

  res.status(200).json({ success: true, data: result });
};
