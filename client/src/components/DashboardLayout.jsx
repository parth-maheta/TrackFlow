// DashboardLayout.jsx
import React from "react";

export default function DashboardLayout({ children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#FFF5F7",
        padding: "20px",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: "#2D3748",
      }}
    >
      <header
        style={{
          marginBottom: "20px",
          textAlign: "center",
          fontSize: "1.8rem",
          fontWeight: "bold",
          color: "#D53F8C",
        }}
      >
        TrackFlow - Lightweight CRM & Operations Process Automation Platform
      </header>
      <main>{children}</main>
    </div>
  );
}
