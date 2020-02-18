import React, { Fragment } from "react";
import PropTypes from "prop-types";
import "../../App.css";
import { Container, Row, Col } from "reactstrap";
import WatchList from "./WatchList";
import MyStocks from "./MyStocks";

const Dashboard = props => {
  return (
    <Fragment>
      {/* <div className="container-fluid">
        <div className="row">
          <nav className="col-md-2 d-none d-md-block bg-light sidebar">
            <div className="sidebar-sticky">
              <ul className="nav flex-column">
                <li className="nav-item">
                  <a className="nav-link active" href="#">
                    Dashboard
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link active" href="#">
                    WatchList
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link active" href="#">
                    MyStocks
                  </a>
                </li>
              </ul>
            </div>
          </nav>
        </div>
      </div> */}
      {/* <Container className="Dash-Container">
        <Row></Row>
        <Row>
          <h2 className="HeadingTitle">Watch List</h2>
        </Row>
        <Row>
          <WatchList />
        </Row>
      </Container>
      <Container>
        <Row>
          <h2 className="HeadingTitle">My Stocks</h2>
        </Row>
        <Row>
          <MyStocks />
        </Row>
      </Container>
      <Container>
        <Row>
          <h2>Breaking News</h2>
        </Row>
      </Container> */}
    </Fragment>
  );
};

Dashboard.propTypes = {};

export default Dashboard;
