import React from "react";
import "./AppBar.css";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function AppBar({ onToggleSidebar }) {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };
  return (
    <header className="appbar">
      <button className="menu-btn" onClick={onToggleSidebar}>
        ☰
      </button>
      <h1>Banking Dashboard</h1>
      <Button
          variant="contained"
          color="secondary"
          onClick={handleLogout}
        >
          Logout
        </Button>
    </header>
  );
}
