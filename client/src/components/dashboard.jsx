import React, { useEffect, useState } from "react";
import { fetchLeads, fetchOrders } from "../../../client/src/api";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#D946EF",
  "#FBB6CE",
  "#FED7AA",
  "#FEEBC8",
  "#F472B6",
  "#9F7AEA",
];

const stages = [
  "New",
  "Contacted",
  "Qualified",
  "Proposal Sent",
  "Won",
  "Lost",
];

export default function Dashboard() {
  const [leads, setLeads] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const leadData = await fetchLeads();
    const orderData = await fetchOrders();
    setLeads(leadData);
    setOrders(orderData);
  }

  // Metrics
  const totalLeads = leads.length;
  const openLeads = leads.filter(
    (l) => !["Won", "Lost"].includes(l.stage)
  ).length;
  const convertedLeads = leads.filter((l) => l.stage === "Won").length;

  const ordersByStatus = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  const thisWeekFollowUps = leads.filter((lead) => {
    if (!lead.follow_up_date) return false;
    const followUp = new Date(lead.follow_up_date);
    const today = new Date();
    const weekAhead = new Date();
    weekAhead.setDate(today.getDate() + 7);
    return followUp >= today && followUp <= weekAhead;
  }).length;

  // Prepare data for charts
  const ordersData = Object.entries(ordersByStatus).map(([status, count]) => ({
    name: status,
    value: count,
  }));

  const leadsByStage = stages.map((stage) => ({
    stage,
    count: leads.filter((lead) => lead.stage === stage).length,
  }));

  return (
    <div style={{ padding: "24px", fontFamily: "sans-serif" }}>
      <h2 style={{ color: "#D946EF", marginBottom: "20px" }}>
        Dashboard Overview
      </h2>

      {/* Metrics */}
      <div style={cardRow}>
        <DashboardCard title="Total Leads" value={totalLeads} color="#FBB6CE" />
        <DashboardCard title="Open Leads" value={openLeads} color="#FED7AA" />
        <DashboardCard
          title="Conversions"
          value={convertedLeads}
          color="#D946EF"
        />
        <DashboardCard
          title="Follow-ups This Week"
          value={thisWeekFollowUps}
          color="#FEEBC8"
        />
      </div>

      {/* Charts */}
      <div
        style={{
          display: "flex",
          gap: "40px",
          marginTop: "40px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            flex: "1 1 400px",
            backgroundColor: "#FFF5F7",
            borderRadius: "12px",
            padding: "20px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
          }}
        >
          <h3 style={{ color: "#B83280", marginBottom: "16px" }}>
            Orders by Status
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={ordersData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#D946EF"
                label
              >
                {ordersData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <ReTooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div
          style={{
            flex: "1 1 400px",
            backgroundColor: "#FFF5F7",
            borderRadius: "12px",
            padding: "20px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
          }}
        >
          <h3 style={{ color: "#B83280", marginBottom: "16px" }}>
            Leads by Stage
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={leadsByStage}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stage" tick={{ fill: "#B83280" }} />
              <YAxis />
              <ReTooltip />
              <Bar dataKey="count" fill="#D946EF" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// === Reusable Card Component ===
function DashboardCard({
  title,
  value,
  color,
  textColor = "#4A5568",
  border = false,
}) {
  return (
    <div
      style={{
        backgroundColor: color,
        padding: "20px",
        borderRadius: "12px",
        width: "220px",
        boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
        border: border ? "1px solid #FBB6CE" : "none",
        marginBottom: "16px",
      }}
    >
      <div style={{ fontSize: "14px", color: textColor, marginBottom: "8px" }}>
        {title}
      </div>
      <div style={{ fontSize: "24px", fontWeight: "bold", color: textColor }}>
        {value}
      </div>
    </div>
  );
}

const cardRow = {
  display: "flex",
  gap: "20px",
  flexWrap: "wrap",
};
