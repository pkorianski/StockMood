const Twitter = require("twitter");

const getCompanyTwitterHandle = async (c, name) => {
  let res = c
    .get("users/search", { q: name, count: 10 })
    .then(users => {
      return users ? users[0].screen_name : "";
    })
    .catch(error => {
      return null;
    });
  return res;
};

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
      return null;
    });

  return res;
};

const findAllTweets = async (c, tw) => {
  let tweets = [];

  const promises = tw.map(async w => {
    try {
      let incoming_tweets = await getTwitterData(c, w);
      tweets.push(...incoming_tweets);
    } catch (error) {}
  });
  await Promise.all(promises);
  return tweets;
};

exports.stockTwitterTweets = async (symbol, company_name) => {
  let client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
  });

  // Initialize tweetwords
  let tweetWords = {};
  // Check for Twitter handle, if found add to tweetWoods
  let twitter_handle = await getCompanyTwitterHandle(client, company_name);
  twitter_handle && (tweetWords[twitter_handle] = 1);

  // Find all words in company name
  let company_name_list = company_name.split(" ");
  for (let w of company_name_list) {
    if (
      !["the", "inc", "inc.", "a", "company", ","].includes(w.toLowerCase())
    ) {
      tweetWords[w] = 1;
    }
  }

  // Add remaning words + convert to iterable list
  tweetWords[company_name] = 1;
  tweetWords[symbol] = 1;
  tweetWords = Object.keys(tweetWords);

  // Gathering results
  let result = await findAllTweets(client, tweetWords);
  let count = result.length;

  return {
    tweet_count: count,
    tweets: result
  };
};
