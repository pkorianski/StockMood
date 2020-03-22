const puppeteer = require("puppeteer");
const fetch = require("node-fetch");

exports.getDividendsData = async symbol => {
  let stockSearch = await fetch(
    `https://www.dividend.com/search.json?q=%22${symbol}%22`,
    {
      method: "GET"
    }
  );

  stockSearch = await stockSearch.json();

  let stockData = await fetch(
    `https://www.dividend.com/api/dividend/stocks/${stockSearch[0].slug}/`,
    {
      method: "GET"
    }
  );

  stockData = await stockData.json();

  let result = {
    symbol: symbol,
    company_name: await stockData.stock_name,
    industry: await stockData.industry.split("-").join(" "),
    sector: await stockData.sector,
    dividend_yield: (await stockData.latest_yield) * 100,
    annualized_payout: await stockData.annualized_payout,
    payout_frequency: await stockData.closest_payment_frequency_text,
    dars_recommendation: await stockData.dars_overall_notes,
    dars_rating_advice: await stockData.dars_rating_advice,
    price: await stockData.last_price,
    price_change_today: await stockData.price_change_today,
    payout_ratio: await stockData.payout_ratio,
    price_six_months_ago: await stockData.price_6_month_ago,
    pe_ratio: await stockData.pe_ratio,
    eps_growth: await stockData.eps_growth,
    ytd_return: await stockData.ytd_return,
    rank: await stockData.rank,
    most_watched_stock: await stockData.most_watched_stock,
    dars: {
      relative_strength: await stockData.dars_relative_strength,
      yield_attractiveness: await stockData.dars_yield_attractiveness,
      dividend_reliability: await stockData.dars_dividend_reliability,
      dividend_uptrend: await stockData.dars_dividend_uptrend,
      earning_profile: await stockData.dars_earning_growth,
      overall: await stockData.dars_overall,
      overall_change: await stockData.dars_overall_change,
      sector: {
        average_yield: await stockData.sector_average_yield,
        average_overall: await stockData.sector_average_dars_overall,
        average_relative_strength: await stockData.sector_average_dars_relative_strength,
        average_yield_attractiveness: await stockData.sector_average_dars_yield_attractiveness,
        average_dividend_reliability: await stockData.sector_average_dars_dividend_reliability,
        average_dividend_uptrend: await stockData.sector_average_dars_dividend_reliability,
        average_earning_growth: await stockData.sector_average_dars_earning_growth
      }
    }
  };

  return result;
};
