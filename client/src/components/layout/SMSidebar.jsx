import React, { useState } from "react";
import "../../App.css";
import { Home, BarChart2, ShoppingCart, FileText, Users } from "react-feather";
import { Nav, NavItem, NavLink } from "reactstrap";

const SMSidebar = () => {
  let [activeSection, setActiveSection] = useState("Dashboard");

  const sideBarMenu = [
    ["Dashboard", <Home className="feather" />, "/"],
    ["Watched Stocks", <BarChart2 className="feather" />, "/watched-stocks"],
    ["My Stocks", <ShoppingCart className="feather" />, "/my-stocks"],
    ["Breaking News", <FileText className="feather" />, "/breaking-news"]
  ];

  const sideBarAdmin = [
    ["Settings", <Users className="feather" />, "/account-settings"]
  ];

  const createNavSection = s => (
    <NavItem key={s[0]}>
      <NavLink href={s[2]} className={s[0] === activeSection ? "active" : ""}>
        <span className="feather">{s[1]}</span>
        {s[0]}
      </NavLink>
    </NavItem>
  );

  return (
    <Nav className="col-md-2 d-none d-md-block bg-light sidebar" defa>
      <div class="sidebar-sticky">
        <h6 class="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-muted">
          <span>Main</span>
        </h6>
        {sideBarMenu.map(section => createNavSection(section))}

        <h6 class="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-muted">
          <span>Account Mgmt</span>
        </h6>
        {sideBarAdmin.map(section => createNavSection(section))}
      </div>
    </Nav>
  );
};

export default SMSidebar;
