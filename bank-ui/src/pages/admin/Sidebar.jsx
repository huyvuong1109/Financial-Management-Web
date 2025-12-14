import React from "react";
import { Link } from "react-router-dom";
import "./Sidebar.css";

export default function Sidebar({ isOpen }) {
  return (
    <aside className={`sidebar ${isOpen ? "" : "closed"}`}>
      <ul>
        <li>
          <Link to="/Dashboard">Dashboard</Link>
        </li>
        <li>
          <Link to="/User">User</Link>
        </li>
        <li>
          <Link to="/Card">Card</Link>
        </li>
        <li>
          <Link to="/Transactions">Transactions</Link>
        </li>
        <li>
          <Link to="/Budget">Budget Management</Link>
        </li>
      </ul>
    </aside>
  );
}
