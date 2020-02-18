import React, { Fragment, useState } from "react";
import { Table, Button } from "reactstrap";
import "../../App.css";
import PropTypes from "prop-types";

const MyStocks = props => {
  let [watchList, setWatchList] = useState([
    {
      symbol: "DIS",
      company_name: "The Walt Disney Company",
      dividend_recommendation: "Recommend",
      dividend_yield: 1.261,
      annualized_payout: 1.76,
      payout_frequency: "Semi Annually",
      current_price: 139.54,
      payout_ratio: 0.324,
      stock_news_mood: "Good",
      market_news_mood: "Average",
      social_mood: "Okay"
    },
    {
      symbol: "FB",
      company_name: "Facebook",
      dividend_recommendation: "Recommend",
      dividend_yield: 1.261,
      annualized_payout: 1.76,
      payout_frequency: "Semi Annually",
      current_price: 139.54,
      payout_ratio: 0.324,
      stock_news_mood: "Good",
      market_news_mood: "Average",
      social_mood: "Okay"
    }
  ]);

  return (
    <Fragment>
      <Button className="AddButton" color="primary">
        Add New Portfolio Stock
      </Button>
      <Table className="StockTable" responsive dark striped bordered hover>
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Company Name</th>
            <th>Dividend Recommendation</th>
            <th>Dividend Yield</th>
            <th>Annualized Payout</th>
            <th>Payout Frequency</th>
            <th>Current Price</th>
            <th>Payout Ratio</th>
            <th>Stock News Mood</th>
            <th>Market News Mood</th>
            <th>Social Mood</th>
            <th>Option</th>
          </tr>
        </thead>
        <tbody>
          {watchList.map(stock => (
            <tr>
              {Object.keys(stock).map(key => (
                <td>{stock[key]}</td>
              ))}
              <td>
                <Button color="danger">X</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Fragment>
  );
};

MyStocks.propTypes = {};

export default MyStocks;
