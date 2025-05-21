import React, { useEffect, useState } from "react";
import { fetchLeads, fetchOrders } from "../../../client/src/api";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveBar } from "@nivo/bar";

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

  const ordersData = Object.entries(ordersByStatus).map(
    ([status, count], i) => ({
      id: status,
      label: status,
      value: count,
      color: COLORS[i % COLORS.length],
    })
  );

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
        <div style={chartCard}>
          <h3 style={{ color: "#B83280", marginBottom: "16px" }}>
            Orders by Status
          </h3>
          <div style={{ height: 300 }}>
            <ResponsivePie
              data={ordersData}
              margin={{ top: 20, right: 40, bottom: 60, left: 40 }}
              innerRadius={0.5}
              padAngle={0.7}
              cornerRadius={3}
              colors={({ data }) => data.color}
              borderWidth={1}
              borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
              arcLabelsTextColor="#333333"
              arcLinkLabelsTextColor="#333333"
              arcLinkLabelsColor={{ from: "color" }}
              legends={[
                {
                  anchor: "bottom",
                  direction: "row",
                  translateY: 56,
                  itemWidth: 100,
                  itemHeight: 14,
                  symbolSize: 14,
                  symbolShape: "circle",
                },
              ]}
            />
          </div>
        </div>

        <div style={chartCard}>
          <h3 style={{ color: "#B83280", marginBottom: "16px" }}>
            Leads by Stage
          </h3>
          <div style={{ height: 300 }}>
            <ResponsiveBar
              data={leadsByStage}
              keys={["count"]}
              indexBy="stage"
              margin={{ top: 20, right: 30, bottom: 50, left: 40 }}
              padding={0.3}
              colors={{ scheme: "purple_red" }}
              borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                legend: "Stage",
                legendPosition: "middle",
                legendOffset: 36,
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                legend: "Leads",
                legendPosition: "middle",
                legendOffset: -40,
              }}
              labelSkipWidth={12}
              labelSkipHeight={12}
              labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
              legends={[
                {
                  dataFrom: "keys",
                  anchor: "bottom-right",
                  direction: "column",
                  translateX: 120,
                  itemWidth: 100,
                  itemHeight: 20,
                  symbolSize: 14,
                },
              ]}
            />
          </div>
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

const chartCard = {
  flex: "1 1 400px",
  backgroundColor: "#FFF5F7",
  borderRadius: "12px",
  padding: "20px",
  boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
};
