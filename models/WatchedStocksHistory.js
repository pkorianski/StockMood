const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const WatchedStocksSchema = new Schema({
  myStock: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "myStocks"
  },
  date: {
    type: Date,
    required: true
  },
  dividend_yield: {
    type: Number,
    required: false
  },
  price: {
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
    type: Number,
    required: false
  }
});

exports.module = MyStockHistorySchema = mongoose.model(
  "myStockHistory",
  MyStockHistorySchema
);
