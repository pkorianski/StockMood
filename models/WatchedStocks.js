const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const WatchedStocksSchema = new Schema({
  symbol: {
    type: String,
    required: true
  },
  company_name: {
    type: String,
    required: true
  },
  dividend_recommendation: {
    type: String,
    required: false
  },
  dividend_yield: {
    type: Number,
    required: false
  },
  annualized_payout: {
    type: Number,
    required: false
  },
  payout_frequency: {
    type: String,
    required: false
  },
  current_price: {
    type: Number,
    required: false
  },
  payout_ratio: {
    type: Number,
    required: false
  },
  stock_news_mood: {
    type: String,
    required: false
  },
  market_news_mood: {
    type: String,
    required: false
  },
  social_mood: {
    type: String,
    required: false
  }
});

module.exports = WatchedStocks = mongoose.model(
  "watchedStocks",
  WatchedStocksSchema
);
