const puppeteer = require("puppeteer");
const Twitter = require("twitter");
const axios = require("axios");
const { stockTwitterTweets } = require("./Twitter");
const { stockMoodDecision } = require("./StockMood");
const EventEmitter = require("events");

// Private Methods
const yahooTrendingStocks = async () => {
  let trending_stocks = await axios.get(
    `https://query1.finance.yahoo.com/v1/finance/trending/US?count=1`
  );

  return trending_stocks.data.finance.result[0].quotes.map(i => i.symbol);
};

const stockMarketData = async symbol => {
  let stockSearch = await axios.get(
    `https://www.dividend.com/search.json?q=%22${symbol}%22`
  );
  stockSearch = await stockSearch.data[0];

  let stockData = await axios.get(
    `https://www.dividend.com/api/dividend/stocks/${stockSearch.slug}/`
  );

  stockData = await stockData.data;

  let high_price_closeness = Math.abs(
    stockData.last_price - stockData.high_price_52_week
  );

  let low_price_closeness = Math.abs(
    stockData.last_price - stockData.low_price_52_week
  );

  let closeness_review =
    high_price_closeness > low_price_closeness ? "Low" : "High";

  return {
    symbol,
    company_name: stockData.stock_name,
    industry: stockData.industry.split("-").join(" "),
    sector: stockData.sector,
    latest_price: stockData.last_price,
    high: stockData.high_price,
    low: stockData.low_price,
    price_change_today: stockData.price_change_today,
    high_price_52_week: stockData.high_price_52_week,
    low_price_52_week: stockData.low_price_52_week,
    high_price_closeness,
    low_price_closeness,
    closeness_review,
    volume: stockData.volume,
    average_volume_20_day: stockData.average_volume_20_day,
    market_cap: stockData.market_cap,
    dividend_yield: stockData.latest_yield * 100,
    payout_frequency: stockData.closest_payment_frequency_text,
    pe_ratio: stockData.pe_ratio,
    dars_recommendation: stockData.dars_overall_notes
  };
};

const stockBingNews = async symbol => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  let links = [...Array(29).keys()];
  await page.goto(
    `https://www.bing.com/news/search?q=${symbol}+stock&FORM=HDRSC6`
  );
  const promises = links.map(async i => {
    try {
      let [el] = await page.$x(
        `//*[@id="algocore"]/div[${i + 1}]/div/div[2]/div[1]/div[1]/a`
      );
      let data = await el.getProperty("href");
      let dataTxt = await data.jsonValue();
      return dataTxt;
    } catch (error) {
      return null;
    }
  });

  const result = await Promise.all(promises);
  browser.close();
  return result.filter(i => i !== null);
};

const stockGoogleNews = async symbol => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  let links = [...Array(29).keys()];
  await page.goto(
    `https://www.google.com/search?biw=1440&bih=692&tbm=nws&sxsrf=ACYBGNRDLB4fwXDh__p_W3lMMZS0L_IaHw%3A1581190585536&ei=uQ0_XtKtIIGp_QayzJB4&q=${symbol}+stock&oq=${symbol}+stock&gs_l=psy-ab.3...30285.30747.0.30938.0.0.0.0.0.0.0.0..0.0....0...1c.1.64.psy-ab..0.0.0....0.J0VcWseMVpw`
  );

  // Page 2 link
  let [page2] = await page.$x(`//*[@id="xjs"]/div/table/tbody/tr/td[3]/a`);
  let page2Data = await page2.getProperty("href");
  let page2Link = await page2Data.jsonValue();

  const promises_p1 = links.map(async i => {
    try {
      let [el] = await page.$x(
        `//*[@id="rso"]/div[${i}]/g-card/div/div/div[2]/a`
      );
      let data = await el.getProperty("href");
      let dataTxt = await data.jsonValue();
      return dataTxt;
    } catch (error) {
      return null;
    }
  });

  const result = await Promise.all(promises_p1);

  // Get links for page 2
  await page.goto(page2Link);
  const promises_p2 = links.map(async i => {
    try {
      let [el] = await page.$x(
        `//*[@id="rso"]/div[${i}]/g-card/div/div/div[2]/a`
      );
      let data = await el.getProperty("href");
      let dataTxt = await data.jsonValue();
      return dataTxt;
    } catch (error) {
      return null;
    }
  });

  const result2 = await Promise.all(promises_p2);
  result.push(...result2);

  browser.close();
  return result.filter(i => i !== null);
};

// @desc Get Yahoo Finance Breaking News data
// @route GET /api/v1/finder/get_the_market
// @access Public
exports.getTheMarket = async (req, res, next) => {
  // Setup
  EventEmitter.defaultMaxListeners = 30;

  // Stock pool
  let stock_pool = [];

  // Yahoo Trending Stocks
  let yahoo_trending = await yahooTrendingStocks();
  stock_pool.push(...yahoo_trending);

  // Get Stock Pool Data (Async)
  const promises = stock_pool.map(async item => {
    const result = await stockMarketData(item);
    const bing_list = await stockBingNews(item);
    const google_list = await stockGoogleNews(item);
    const news_list = [...bing_list, ...google_list];
    const sm = await stockMoodDecision(news_list);
    const tweets = await stockTwitterTweets(item, result.company_name);

    return {
      ...result,
      stockMood: {
        score: sm.score,
        comparative: sm.comparative,
        decision: sm.decision
      },
      bing_links: bing_list,
      google_links: google_list,
      twitter: tweets
    };
  });
  const results = await Promise.all(promises);
  res.json(results);
};

// @desc Get Yahoo Finance Breaking News data
// @route GET /api/v1/finder/breaking_news
// @access Public
exports.yahooBreakingNews = async (req, res, next) => {
  let count = (await req.body.count) || 100;
  let breaking_news = await axios.get(
    `https://iquery.finance.yahoo.com/ws/activity-feed/v1/notifications?count=${count}`
  );

  breaking_news = breaking_news.data;

  let result = {
    links: breaking_news.finance.result[0].notificationsWithMeta.map(i => ({
      article_title: i.body,
      link: i.articleUrl
    }))
  };

  res.json(result);
};
