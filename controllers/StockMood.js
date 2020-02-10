const puppeteer = require("puppeteer");
const fetch = require("node-fetch");
const Sentiment = require("sentiment");
const Twitter = require("twitter");

// @desc Get Yahoo Finance Breaking News data
// @route GET /api/v1/stockmood/yahoo/breakingnews
// @access Public
exports.yahooBreakingNews = async (req, res, next) => {
  let count = (await req.body.count) || 100;
  let breaking_news = await fetch(
    `https://iquery.finance.yahoo.com/ws/activity-feed/v1/notifications?count=${count}`,
    {
      method: "GET"
    }
  );

  breaking_news = await breaking_news.json();

  let result = {
    count,
    links: breaking_news.finance.result[0].notificationsWithMeta.map(i => ({
      article_title: i.body,
      link: i.articleUrl
    }))
  };

  res.status(200).json({ success: true, data: result });
};

// @desc Get Google News for Stock or Market
// @route GET /api/v1/stockmood/google/news
// @access Public
exports.googleNews = async (req, res, next) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  let links = [];
  let queryData =
    req.body.type === "stock_symbol"
      ? `${req.body.data}+stock`
      : `${req.body.data.split(" ").join("+")}`;
  await page.goto(
    `https://www.google.com/search?biw=1440&bih=692&tbm=nws&sxsrf=ACYBGNRDLB4fwXDh__p_W3lMMZS0L_IaHw%3A1581190585536&ei=uQ0_XtKtIIGp_QayzJB4&q=${queryData}&oq=${queryData}&gs_l=psy-ab.3...30285.30747.0.30938.0.0.0.0.0.0.0.0..0.0....0...1c.1.64.psy-ab..0.0.0....0.J0VcWseMVpw`
  );

  // Get page 2 link
  let [page2] = await page.$x(`//*[@id="nav"]/tbody/tr/td[3]/a`);
  let page2Data = await page2.getProperty("href");
  let page2Link = await page2Data.jsonValue();

  // Get all links on page1
  const getAllLinks = async p => {
    try {
      let i = 1;
      while (i < 30) {
        let [el] = await p.$x(
          `//*[@id="rso"]/div[${i}]/div/g-card/div/div/div[2]/a`
        );
        let data = await el.getProperty("href");
        let dataTxt = await data.jsonValue();
        links.push(dataTxt);
        i += 1;
      }
    } catch (error) {}
  };

  // Get all links for page1
  await getAllLinks(page);

  // Get all links for page2
  await page.goto(page2Link);
  await getAllLinks(page);

  let result = {
    symbol: req.body.stock_symbol,
    links: links
  };

  browser.close();
  res.status(200).json({ success: true, data: result });
};

// @desc Get Bing News for Stock or Market
// @route GET /api/v1/stockmood/bing/news
// @access Public
exports.bingNews = async (req, res, next) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  let links = [];
  let queryData =
    req.body.type === "stock_symbol"
      ? `${req.body.data}+stock`
      : `${req.body.data.split(" ").join("+")}`;
  await page.goto(
    `https://www.bing.com/news/search?q=${queryData}&FORM=HDRSC6`
  );

  // Get all links on page1
  const getAllLinks = async p => {
    try {
      let i = 1;
      while (i < 30) {
        let [el] = await p.$x(
          `//*[@id="algocore"]/div[${i}]/div/div[2]/div[1]/div[1]/a`
        );
        let data = await el.getProperty("href");
        let dataTxt = await data.jsonValue();
        links.push(dataTxt);
        i += 1;
      }
    } catch (error) {}
  };

  // Get all links for page1
  await getAllLinks(page);

  let result = {
    symbol: req.body.stock_symbol,
    links: links
  };

  browser.close();
  res.status(200).json({ success: true, data: result });
};

// @desc Get Recently Trending Tweets for Stock or Market
// @route GET /api/v1/stockmood/twitter/search
// @access Public
exports.retrieveTweets = async (req, res, next) => {
  // Setup Twitter client
  let client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
  });

  // Method to call Twitter API to search for Tweets
  const getTwitterData = q => {
    let res = client
      .get("search/tweets", { q: q, count: 100, result_type: "mixed" })
      .then(tweet => {
        // Build results by using an object to remove duplicate tweets
        let results = {};
        tweet.statuses.forEach(i => {
          results[i.text] = 1;
        });
        return Object.keys(results);
      })
      .catch(error => {
        throw error;
      });

    return res;
  };

  // Converting company name to tweetable search terms
  let company_name = req.body.company_name.split(" ");
  let tweetWords = {};
  for (let w of company_name) {
    if (
      !["the", "inc", "inc.", "a", "company", ","].includes(w.toLowerCase())
    ) {
      tweetWords[w] = 1;
    }
  }

  tweetWords = Object.keys(tweetWords);
  tweetWords.push(req.body.company_name);

  // Call Twitter API on all tweetable terms
  const findAllTweets = async tw => {
    let tweets = [];
    for (let w of tw) {
      let incoming_tweets = await getTwitterData(w);
      tweets.push(...incoming_tweets);
    }
    return tweets;
  };

  // Gathering results
  let result = await findAllTweets(tweetWords);
  let count = result.length;

  res.status(200).json({
    success: true,
    tweet_count: count,
    data: result
  });
};

exports.stockMoodAnalyzer = async (req, res, next) => {
  const browser = await puppeteer.launch();
  const pageTest = await browser.newPage();
  await pageTest.goto(req.body.link);
  let articleTxt = "";

  // Get paragraph tags from article
  const pTags = await pageTest.$$("p");

  const getParagraphs = async p => {
    let paragraphData = await p.getProperty("textContent");
    let paragraphTxt = await paragraphData.jsonValue();
    return paragraphTxt.trim();
  };

  // Concatenate all articleTxt to analyze
  for (let p of pTags) {
    articleTxt += await getParagraphs(p);
  }

  // Stockmood
  let sm = stockMood(articleTxt);

  browser.close();
  res.status(200).json({
    success: true,
    result: {
      score: sm.score,
      comparative: sm.comparative
    },
    mood: sm.mood,
    data: articleTxt
  });
};

// Method not API
// INPUT: Any string
// OUTPUT: Mood score, comparative score, and emoji based on score as an Object
const stockMood = text => {
  // Sentiment analysis
  let sentiment = new Sentiment();
  let result = sentiment.analyze(text);
  let score = result.comparative * 100;

  let finalMood = "No mood";
  if (score >= 5) {
    finalMood = "😁";
  } else if (score > 0) {
    finalMood = "🙂";
  } else if (score == 0) {
    finalMood = "😐";
  } else {
    finalMood = "😫";
  }
  return {
    score: result.score,
    comparative: result.comparative,
    mood: finalMood
  };
};
