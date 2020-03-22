const puppeteer = require("puppeteer");
const fetch = require("node-fetch");
const Sentiment = require("sentiment");
const Twitter = require("twitter");

// Method to analyze texts mood
// INPUT: Any string
// OUTPUT: Mood score, comparative score, and emoji based on score as an Object
const stockMood = text => {
  // Sentiment analysis
  let sentiment = new Sentiment();
  let result = sentiment.analyze(text);
  return {
    score: result.score,
    comparative: result.comparative * 100
  };
};

const stockMoodEmoji = score => {
  if (score >= 5) {
    finalMood = "😁";
  } else if (score > 0) {
    finalMood = "🙂";
  } else if (score == 0) {
    finalMood = "😐";
  } else {
    finalMood = "😫";
  }
  return finalMood;
};

exports.stockMoodDecision = async links => {
  let score = 0,
    comparative = 0;
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  if (links.length == 0) {
    await browser.close();
    return null;
  }

  // Got moods for all links
  const promises = links.map(async l => {
    try {
      await page.goto(l);
      let articleTxt = "";
      // Get paragraph tags from article
      const pTags = await page.$$("p");

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
      score += sm.score;
      comparative += sm.comparative;
    } catch (error) {}
  });

  // Execute promise list
  await Promise.all(promises);
  await browser.close();

  // Results
  score /= links.length;
  comparative /= links.length;

  return {
    score: score,
    comparative,
    decision: stockMoodEmoji(comparative)
  };
};
