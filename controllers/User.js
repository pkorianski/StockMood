const MyStocks = require("../models/MyStocks");
const MyStocksHistory = require("../models/MyStockHistory");
const { getDividendsData } = require("./WebServices");

exports.getMyStocks = async (req, res, next) => {
  try {
    const myStocks = await MyStocks.find({});
    res.json(myStocks);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
};

exports.addMyStock = async (req, res, next) => {
  let { average_buy_price, number_of_shares, symbol } = req.body;

  // Check if stock exists
  let myStock = await MyStocks.findOne({ symbol });
  if (myStock) {
    return res.status(400).json({
      msg: "Stock already exists in MyStocks"
    });
  }

  if (number_of_shares < 1) {
    return res.status(400).json({
      msg: "number_of_shares is required to be > 0"
    });
  }

  // Get Dividends data
  const dividends = await getDividendsData(symbol);

  // Trivial calculations
  let market_price = dividends.price,
    cost_basis = number_of_shares * average_buy_price,
    market_value = number_of_shares * market_price,
    gain_loss = market_value - cost_basis,
    growth = cost_basis / gain_loss;

  myStock = new MyStocks({
    symbol,
    company_name: dividends.company_name,
    dividend_recommendation: dividends.dars_recommendation,
    dividend_yield: dividends.dividend_yield,
    annualized_payout: dividends.annualized_payout,
    payout_frequency: dividends.payout_frequency,
    average_buy_price,
    number_of_shares,
    market_price,
    cost_basis,
    market_value,
    gain_loss,
    growth,
    payout_ratio: dividends.payout_ratio,
    stock_news_mood: null,
    market_news_mood: null,
    social_mood: null
  });

  try {
    await myStock.save();
    res.json({
      status: "ok",
      myStock
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
};

// exports.updateMyStock = async (req, res, next) => {

//     let

// }
