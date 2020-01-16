/*

The following program scraps data from Dividend.com

The program retrieves:
- Sectors
- Industries
- Stock by Industry
- Stock Price, Date, Dividend Yield, Annualized Payout, Payout Freq, Payout Ratio, Dividend Growth

To run:

1) Install node
2) Go to terminal and the directory in which this program resides
3) Type 'npm i'
3) Type 'node index.js' to run

To keep it simple, the dataToJson method runs and only gets the Basic Materials stocks. 

The data is saved to the file basic_material_stocks.json 

*/

const puppeteer = require("puppeteer");
const fs = require("fs");

const getStockData = async link => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(link);

  const textList = [
    {
      name: "Stock-Symbol",
      xpath: "/html/body/main/section[1]/div[2]/div[1]/p[2]"
    },
    {
      name: "Stock-Industry",
      xpath: "/html/body/main/section[1]/div[2]/div[3]/p[2]"
    },
    {
      name: "Stock-Price",
      xpath: '//*[@id="stock-daily-snapshot"]/section/div[1]/p'
    },
    {
      name: "Stock-Price-Date",
      xpath: "/html/body/main/section[1]/div[2]/div[2]/p[1]/time"
    },
    {
      name: "Dividend-Yield",
      xpath: '//*[@id="stock-dividend-data"]/section/div[1]/p'
    },
    {
      name: "Annualized-Payout",
      xpath: '//*[@id="stock-dividend-data"]/section/div[2]/p'
    },
    {
      name: "Annualized-Payout-Frequency",
      xpath: '//*[@id="stock-dividend-data"]/section/div[2]/sub'
    },
    {
      name: "Payout-Ratio",
      xpath: '//*[@id="stock-dividend-data"]/section/div[4]/p'
    },
    {
      name: "Dividend-Growth",
      xpath: '//*[@id="stock-dividend-data"]/section/div[5]/p'
    }
  ];

  // For text
  const getText = async xpath => {
    const [el2] = await page.$x(xpath);
    const txt = await el2.getProperty("textContent");
    const rawTxt = await txt.jsonValue();
    return rawTxt;
  };

  // Result variable
  let result = {};

  // Scrap text data
  for (let p of textList) {
    let data = await getText(p.xpath);
    result[p.name] = await (data
      ? data.trim().replace(/(\r\n|\n|\r)/gm, " ")
      : "");
  }

  console.log(result);
  browser.close();
  return result;
};

const getIndustryStocks = async (link, count) => {
  const result = {};
  let pageNumber = 1;
  let pageUrl = "";
  let numOfPages = Math.ceil(count / 20);
  console.log(`Link->${link}\nPageCount->${numOfPages}`);

  try {
    while (pageNumber < numOfPages + 1) {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();

      if (pageNumber == 1) {
        await page.goto(link);
        pageUrl = await page.url();
      } else {
        newPage = `${pageUrl}&only=meta%2Cdata&page=${pageNumber}`;
        await page.goto(`${pageUrl}&only=meta%2Cdata&page=${pageNumber}`);
      }

      try {
        let i = 1;
        while (true) {
          // Get industry name and link
          const [el] = await page.$x(
            `//*[@id="3-industry-stocks"]/div/div[3]/div[1]/table/tbody/tr[${i}]/td[1]/a`
          );
          const stock = await el.getProperty("textContent");
          const href = await el.getProperty("href");
          const stockTxt = await stock.jsonValue();
          const hrefTxt = await href.jsonValue();

          // Get company name
          const [el2] = await page.$x(
            `//*[@id="3-industry-stocks"]/div/div[3]/div[1]/table/tbody/tr[${i}]/td[2]/a`
          );
          const stockName = await el2.getProperty("textContent");
          const stockNameTxt = await stockName.jsonValue();

          // Add to result
          result[stockTxt] = {
            name: stockNameTxt,
            link: hrefTxt,
            data: await getStockData(hrefTxt)
          };
          i++;
        }
      } catch (err) {}
      browser.close();
      pageNumber++;
    }
  } catch (err) {}
  return result;
};

const getSectorIndustries = async link => {
  const result = {};
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(link);

  try {
    let i = 1;
    while (true) {
      // Get industry name and link
      const [el] = await page.$x(
        `/html/body/main/section/article/section[2]/table/tbody/tr[${i}]/td[1]/p/a`
      );
      const industry = await el.getProperty("textContent");
      const href = await el.getProperty("href");
      const industryTxt = await industry.jsonValue();
      const hrefTxt = await href.jsonValue();

      // Get industry company count
      const [el2] = await page.$x(
        `/html/body/main/section/article/section[2]/table/tbody/tr[${i}]/td[2]/p`
      );
      const industryCompanyCount = await el2.getProperty("textContent");
      const industryCompanyCountText = await industryCompanyCount.jsonValue();
      const company_count = await parseInt(industryCompanyCountText.trim());

      // Get industry dividend yield
      const [el3] = await page.$x(
        `/html/body/main/section/article/section[2]/table/tbody/tr[${i}]/td[3]/p`
      );
      const industryDY = await el3.getProperty("textContent");
      const industryDYText = await industryDY.jsonValue();

      // Add to result
      result[industryTxt] = {
        link: hrefTxt,
        company_count: company_count,
        dividend_yield: industryDYText.trim(),
        stocks: await getIndustryStocks(hrefTxt, company_count)
      };
      i++;
    }
  } catch (err) {}
  console.log(result);
  browser.close();
  return result;
};

const getStockSectors = async () => {
  const result = {};
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(
    "https://www.dividend.com/dividend-stocks/#tm=3-top-100&r=Webpage%231282"
  );

  try {
    let i = 1;
    while (true) {
      // Get sector name and link
      const [el] = await page.$x(
        `/html/body/main/section/article/section[1]/table/tbody/tr[${i}]/td[1]/p/a`
      );
      const sector = await el.getProperty("textContent");
      const href = await el.getProperty("href");
      const sectorTxt = await sector.jsonValue();
      const hrefTxt = await href.jsonValue();

      // Get sector dividend yield
      const [el2] = await page.$x(
        `/html/body/main/section/article/section[1]/table/tbody/tr[${i}]/td[4]/p`
      );
      const sectorDY = await el2.getProperty("textContent");
      const sectorDYText = await sectorDY.jsonValue();

      // Add to result
      result[sectorTxt] = {
        link: hrefTxt,
        dividend_yield: sectorDYText.trim(),
        industries: await getSectorIndustries(hrefTxt)
      };
      i++;
    }
  } catch (err) {}
  //   console.log(result["Basic Materials"]);
  browser.close();
  return result;
};

const dataToJson = async () => {
  data = await getSectorIndustries(
    "https://www.dividend.com/dividend-stocks/basic-materials/#tm=3-sector-stocks&r=ES%3A%3ADividendStock%3A%3AStock%23DPM--NYSE&f_1=basic-materials"
  );

  console.log(data);
  let json = JSON.stringify(data, null, 2);
  fs.writeFile("basic_material_stocks.json", json, "utf8", () => {});
};

// Run
dataToJson();
