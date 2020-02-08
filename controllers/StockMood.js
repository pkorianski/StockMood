const puppeteer = require("puppeteer");
const fetch = require("node-fetch");

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
