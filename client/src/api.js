const API_BASE = "http://localhost:5000/api";

export async function fetchLeads() {
  const res = await fetch(`${API_BASE}/leads`);
  return res.json();
}

export async function updateLead(id, data) {
  const res = await fetch(`${API_BASE}/leads/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function fetchOrders() {
  const res = await fetch(`${API_BASE}/orders`);
  return res.json();
}

export async function updateOrder(id, data) {
  const res = await fetch(`${API_BASE}/orders/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}
export async function createOrder(order) {
  const res = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order),
  });
  return res.json();
}
export async function createLead(lead) {
  const res = await fetch(`${API_BASE}/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lead),
  });
  const data = await res.json();
  console.log("createLead response:", data);
  return data;
}
// example:
export async function updateOrderStatus(id, data) {
  const res = await fetch(`/orders/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}
