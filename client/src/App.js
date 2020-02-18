import React, { Fragment } from "react";
import { Provider } from "react-redux";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
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
          <SMNavbar />
          <SMSidebar />
          <Switch>
            <Route exact path="/" component={Dashboard} />
          </Switch>
        </Fragment>
      </Router>
    </Provider>
  );
}

export default App;
