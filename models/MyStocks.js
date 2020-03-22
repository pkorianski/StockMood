const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MyStocksSchema = new Schema({
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
  average_buy_price: {
    type: Number,
    required: true
  },
  number_of_shares: {
    type: Number,
    required: true
  },
  market_price: {
    type: Number,
    required: false
  },
  cost_basis: {
    type: Number,
    required: false
  },
  market_value: {
    type: Number,
    required: false
  },
  gain_loss: {
    type: Number,
    required: false
  },
  growth: {
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

module.exports = MyStocks = mongoose.model("myStocks", MyStocksSchema);
