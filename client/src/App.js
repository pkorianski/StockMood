import React, { Fragment } from "react";
import { Provider } from "react-redux";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Container, Row, Col } from "reactstrap";
import store from "./store";
import "./App.css";
import SMNavbar from "./components/layout/SMNavbar";
import SMSidebar from "./components/layout/SMSidebar";
import Dashboard from "./components/dashboard/Dashboard";

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Fragment>
          <Container fluid="xl">
            <Row>
              <SMNavbar />
              <SMSidebar />
              <Switch>
                <Route exact path="/" component={Dashboard} />
              </Switch>
            </Row>
          </Container>
        </Fragment>
      </Router>
    </Provider>
  );
}

export default App;
