const puppeteer = require("puppeteer");
const fetch = require("node-fetch");

// @desc Get dividends data
// @route GET /api/v1/dividends
// @access Public
exports.getDividends = async (req, res, next) => {
  let stockSearch = await fetch(
    `https://www.dividend.com/search.json?q=%22${req.body.stock_symbol}%22`,
    {
      method: "GET"
    }
  );

  stockSearch = await stockSearch.json();

  // Scraping link
  let link = `https://www.dividend.com/dividend-stocks/${stockSearch[0].sector}/${stockSearch[0].industry}/${stockSearch[0].slug}`;

  // Data to scrape
  let company_name = "/html/body/main/section[1]/div[1]/div/div[1]/h1";
  let industry = stockSearch[0].industry;
  let price = "/html/body/main/section[1]/div[2]/div[2]/p[2]/text()";
  let price_date = "/html/body/main/section[1]/div[2]/div[2]/p[1]/time";
  let dividend_yield = '//*[@id="stock-dividend-data"]/section/div[1]/p';
  let annualized_payout = '//*[@id="stock-dividend-data"]/section/div[2]/p';
  let payout_frequency = '//*[@id="stock-dividend-data"]/section/div[2]/sub';
  let payout_ratio = '//*[@id="stock-dividend-data"]/section/div[4]/p';
  let dividend_growth = '//*[@id="stock-dividend-data"]/section/div[5]/p';

  // Launch puppeteer + Page
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(link);

  const getData = async field => {
    const [el] = await page.$x(field);
    const value = await el.getProperty("textContent");
    const valueTxt = await value.jsonValue();
    return valueTxt.trim();
  };

  // Building response
  let result = {
    symbol: req.body.stock_symbol,
    company_name: await getData(company_name),
    industry: industry.split("-").join(" "),
    price: await getData(price),
    price_date: await getData(price_date),
    dividend_yield: await getData(dividend_yield),
    annualized_payout: await getData(annualized_payout),
    payout_frequency: await getData(payout_frequency),
    payout_ratio: await getData(payout_ratio),
    dividend_growth: await getData(dividend_growth)
  };

  browser.close();

  res.status(200).json({ success: true, data: result });
};
