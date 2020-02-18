import React, { Fragment } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import "../../App.css";
import {
  Navbar,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  NavbarText
} from "reactstrap";
import "../../App.css";

const SMNavbar = props => {
  return (
    <Navbar className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
      <NavbarBrand className="navbar-brand col-sm-3 col-md-2 mr-0">
        <Link className="navbar-brand-link" to="/">
          StockMood
        </Link>
      </NavbarBrand>
    </Navbar>
  );
};

SMNavbar.propTypes = {};

export default SMNavbar;
