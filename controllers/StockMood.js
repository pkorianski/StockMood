const puppeteer = require("puppeteer");
const fetch = require("node-fetch");
const Sentiment = require("sentiment");
const Twitter = require("twitter");
const { StaticPool } = require("node-worker-threads-pool");

// Method to analyze a news articles mood
// Input: link: News article link
// OUTPUT: Object containing mood score, comparative score, emoji, and article text data
const stockMoodNewsAnalyzer = async link => {
  const browser = await puppeteer.launch();
  const pageTest = await browser.newPage();
  await pageTest.goto(link);
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

  return {
    link,
    score: sm.score,
    comparative: sm.comparative,
    mood: sm.mood
  };
};

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

  // // Results
  // let mood_scores = [];
  // let mood_comparative_scores = [];
  // let results = [];

  // // Go through each link and analyze articles mood
  // for (let link of links) {
  //   let linkStockMood = await stockMoodNewsAnalyzer(link);
  //   mood_scores.push(linkStockMood.score);
  //   mood_comparative_scores.push(linkStockMood.comparative);
  //   results.push(linkStockMood);
  // }

  // NEW Article moods
  let moods_result = await worker_pool_moods(links);
  console.log(moods_result);

  browser.close();
  res.status(200).json({
    success: true,
    data: {
      link_count: links.length,
      avg_score_mood:
        "mood_scores.reduce((a, b) => a + b) / mood_scores.length",
      avg_comparative_mood:
        "mood_comparative_scores.reduce((a, b) => a + b) / \
        mood_comparative_scores.length"
      // results
    }
  });
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

  // Initialize tweetwords
  let tweetWords = {};

  // Converting company name to tweetable search terms
  if (req.body.type === "company") {
    // Check for Twitter handle, if found add to tweetWoods
    let twitter_handle = await getCompanyTwitterHandle(
      client,
      req.body.company_name
    );
    twitter_handle && (tweetWords[twitter_handle] = 1);

    // Find all words in company name
    let company_name = req.body.company_name.split(" ");
    for (let w of company_name) {
      if (
        !["the", "inc", "inc.", "a", "company", ","].includes(w.toLowerCase())
      ) {
        tweetWords[w] = 1;
      }
    }

    // Add remaning words + convert to iterable list
    tweetWords[req.body.company_name] = 1;
    tweetWords[req.body.stock_symbol] = 1;
    tweetWords = Object.keys(tweetWords);
  } else if (req.body.type === "market") {
    let industry_name = req.body.industry.split(" ");
    let sector_name = req.body.sector.split(" ");
    for (let w of industry_name) {
      if (
        !["the", "inc", "inc.", "a", "company", ","].includes(w.toLowerCase())
      ) {
        tweetWords[w] = 1;
      }
    }

    for (let w of sector_name) {
      if (
        !["the", "inc", "inc.", "a", "company", ","].includes(w.toLowerCase())
      ) {
        tweetWords[w] = 1;
      }
    }

    // Add remaning words + convert to iterable list
    tweetWords[req.body.industry] = 1;
    tweetWords[req.body.sector] = 1;
    tweetWords = Object.keys(tweetWords);
  }

  // Gathering results
  let result = await findAllTweets(client, tweetWords);
  let count = result.length;
  let tweet_comparatives = [];
  let tweet_scores = [];

  // Tweet Stockmood
  let tweetMoods = [];
  for (let tweet of result) {
    let mood = stockMood(tweet);
    tweet_comparatives.push(mood.comparative * 100);
    tweet_scores.push(mood.score);
    tweetMoods.push({
      tweet,
      mood
    });
  }

  res.status(200).json({
    success: true,
    data: {
      tweetWords,
      tweet_count: count,
      avg_score_mood:
        tweet_scores.reduce((a, b) => a + b) / tweet_scores.length,
      avg_comparative_mood:
        tweet_comparatives.reduce((a, b) => a + b) / tweet_comparatives.length,
      result: tweetMoods
    }
  });
};

// Method to analyze texts mood
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

// Method to receive Company Twitter Handle
// Input: c: Twitter client, name: Company name
// Output: Company Twitter Handle
const getCompanyTwitterHandle = async (c, name) => {
  let res = c
    .get("users/search", { q: name, count: 10 })
    .then(users => {
      return users ? users[0].screen_name : "";
    })
    .catch(error => {
      throw error;
    });
  return res;
};

// Method to call Twitter API to search for Tweets
// Input: c: Twitter client, q: Tweet query
// Ouput: List of links
const getTwitterData = (c, q) => {
  let res = c
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

// Method to call Twitter API on all tweetable terms
// Input: c: Twitter client, tw: Tweet words
// Output: List of all tweets for all tweet words
const findAllTweets = async (c, tw) => {
  let tweets = [];
  for (let w of tw) {
    let incoming_tweets = await getTwitterData(c, w);
    tweets.push(...incoming_tweets);
  }
  return tweets;
};

// Trial workerr pool threads
const worker_pool_moods = async l => {
  // // Results
  let mood_scores = [];
  let mood_comparative_scores = [];
  let results = [];

  const pool = new StaticPool({
    size: 2,
    task: async function(link) {
      const browser = await puppeteer.launch();
      const pageTest = await browser.newPage();
      await pageTest.goto(link);
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

      return {
        link,
        score: sm.score,
        comparative: sm.comparative,
        mood: sm.mood
      };
    },
    workerData: "workerData!"
  });

  // // Go through each link and analyze articles mood
  for (let link of l) {
    await (async () => {
      const linkStockMood = await pool.exec(link);
      // mood_scores.push(linkStockMood.score);
      // mood_comparative_scores.push(linkStockMood.comparative);
      results.push(linkStockMood);
    })();
    // let linkStockMood = await stockMoodNewsAnalyzer(link);
    // mood_scores.push(linkStockMood.score);
    // mood_comparative_scores.push(linkStockMood.comparative);
    // results.push(linkStockMood);
  }

  return {
    mood_scores,
    mood_comparative_scores,
    results
  };
};
