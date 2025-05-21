import React, { useEffect, useState } from "react";
import {
  fetchOrders,
  updateOrderStatus,
  createOrder,
  fetchLeads,
} from "../../../client/src/api";

const orderStages = [
  "Order Received",
  "In Development",
  "Ready to Dispatch",
  "Dispatched",
];

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [leads, setLeads] = useState([]);
  const [view, setView] = useState("kanban");
  const [columns, setColumns] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);

  useEffect(() => {
    loadOrders();
    loadLeads();
  }, []);

  useEffect(() => {
    const cols = {};
    orderStages.forEach((stage) => {
      cols[stage] = orders.filter((order) => order.status === stage);
    });
    setColumns(cols);
  }, [orders]);

  async function loadOrders() {
    const ordersData = await fetchOrders();
    setOrders(ordersData);
  }

  async function loadLeads() {
    const leadsData = await fetchLeads();
    setLeads(leadsData);
  }

  async function handleModalSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const newOrder = {
      lead_id: Number(form.lead_id.value),
      status: form.status.value,
      courier: form.courier.value,
      tracking_number: form.tracking_no.value,
    };

    if (editingOrder) {
      await updateOrderStatus(editingOrder.id, newOrder);
    } else {
      await createOrder(newOrder);
    }

    setShowModal(false);
    setEditingOrder(null);
    loadOrders();
  }

  return (
    <div style={{ maxWidth: 1100, margin: "auto", padding: 20 }}>
      <h2 style={{ textAlign: "center", color: "#D7263D" }}>
        Order Management
      </h2>

      <div style={{ textAlign: "center", margin: 20 }}>
        <button
          onClick={() => setView(view === "kanban" ? "list" : "kanban")}
          style={buttonStyle}
        >
          Switch to {view === "kanban" ? "List View" : "Kanban View"}
        </button>
        <button
          onClick={() => {
            setShowModal(true);
            setEditingOrder(null);
          }}
          style={newOrderButton}
        >
          + New Order
        </button>
      </div>

      {view === "kanban" ? (
        <div style={{ display: "flex", gap: "15px", overflowX: "auto" }}>
          {orderStages.map((stage) => (
            <div key={stage} style={kanbanColumnStyle}>
              <h3 style={kanbanColumnHeader}>{stage}</h3>
              {columns[stage]?.map((order) => (
                <div key={order.id} style={kanbanCardStyle}>
                  <p>
                    <strong>Order ID:</strong> {order.id}
                  </p>
                  <p>
                    <strong>Lead ID:</strong> {order.lead_id}
                  </p>
                  <p>
                    <strong>Courier:</strong> {order.courier || "N/A"}
                  </p>
                  <p>
                    <strong>Tracking No:</strong> {order.tracking_no || "N/A"}
                  </p>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr style={theadRowStyle}>
              <th>Order ID</th>
              <th>Lead ID</th>
              <th>Status</th>
              <th>Courier</th>
              <th>Tracking No</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} style={tbodyRowStyle}>
                <td>{order.id}</td>
                <td>{order.lead_id}</td>
                <td>
                  <select
                    value={order.status}
                    onChange={async (e) => {
                      const newStatus = e.target.value;
                      await updateOrderStatus(order.id, { status: newStatus });
                      setOrders((prev) =>
                        prev.map((o) =>
                          o.id === order.id ? { ...o, status: newStatus } : o
                        )
                      );
                    }}
                    style={dropdownStyle}
                  >
                    {orderStages.map((stage) => (
                      <option key={stage} value={stage}>
                        {stage}
                      </option>
                    ))}
                  </select>
                </td>
                <td>{order.courier || "-"}</td>
                <td>{order.tracking_no || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div style={modalOverlay}>
          <div style={modalStyle}>
            <h3>{editingOrder ? "Edit Order" : "New Order"}</h3>
            <form onSubmit={handleModalSubmit}>
              <select
                name="lead_id"
                required
                defaultValue={editingOrder?.lead_id || ""}
                style={inputStyle}
              >
                <option value="">Select Lead</option>
                {leads.map((lead) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.name} (ID: {lead.id})
                  </option>
                ))}
              </select>
              <select
                name="status"
                required
                defaultValue={editingOrder?.status || "Order Received"}
                style={inputStyle}
              >
                {orderStages.map((stage) => (
                  <option key={stage}>{stage}</option>
                ))}
              </select>
              <input
                name="courier"
                placeholder="Courier"
                defaultValue={editingOrder?.courier || ""}
                style={inputStyle}
              />
              <input
                name="tracking_no"
                placeholder="Tracking No"
                defaultValue={editingOrder?.tracking_no || ""}
                style={inputStyle}
              />
              <div style={{ marginTop: 15 }}>
                <button type="submit" style={buttonStyle}>
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    ...buttonStyle,
                    marginLeft: 10,
                    backgroundColor: "#aaa",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const buttonStyle = {
  backgroundColor: "#FF6F91",
  border: "none",
  color: "white",
  padding: "10px 20px",
  borderRadius: "20px",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "1rem",
};

const newOrderButton = {
  ...buttonStyle,
  backgroundColor: "#FF9671",
  marginLeft: 10,
};

const kanbanColumnStyle = {
  flex: "0 0 250px",
  borderRadius: "12px",
  padding: "15px",
  backgroundColor: "#fff0f6",
  minHeight: "300px",
};

const kanbanColumnHeader = {
  textAlign: "center",
  color: "#D7263D",
  marginBottom: "10px",
  fontWeight: "700",
};

const kanbanCardStyle = {
  backgroundColor: "white",
  borderRadius: "12px",
  padding: "12px 15px",
  marginBottom: "12px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "1rem",
  backgroundColor: "#fff5f7",
  borderRadius: "12px",
  overflow: "hidden",
};

const theadRowStyle = {
  backgroundColor: "#FFC1CC",
  color: "#8B0000",
};

const tbodyRowStyle = {
  textAlign: "center",
  backgroundColor: "#fff",
  borderBottom: "1px solid #ffe0e0",
  height: "60px",
};

const dropdownStyle = {
  padding: "6px 10px",
  borderRadius: "10px",
  border: "1px solid #FFB6C1",
  backgroundColor: "#fff5f7",
  color: "#D7263D",
  fontWeight: "500",
};

const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.3)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modalStyle = {
  background: "white",
  padding: "30px",
  borderRadius: "15px",
  width: "400px",
  boxShadow: "0 6px 30px rgba(0,0,0,0.3)",
};

const inputStyle = {
  width: "100%",
  marginBottom: "12px",
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #FFC1CC",
};
