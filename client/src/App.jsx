import React from "react";
import DashboardLayout from "./components/DashboardLayout";
import LeadKanban from "./components/LeadKanban"; // your lead kanban component
import OrderList from "./components/OrderList"; // your order list component
import Dashboard from "./components/dashboard"; // your summary dashboard component

export default function App() {
  return (
    <DashboardLayout>
      <section style={{ marginBottom: "48px" }}>
        <LeadKanban />
      </section>

      <section style={{ marginBottom: "48px" }}>
        <OrderList />
      </section>

      <section>
        <Dashboard />
      </section>
    </DashboardLayout>
  );
}
