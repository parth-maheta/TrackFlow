import React, { useEffect, useState } from "react";
import { fetchLeads, updateLead } from "../../../frontend/src/api";

const stages = [
  "New",
  "Contacted",
  "Qualified",
  "Proposal Sent",
  "Won",
  "Lost",
];

export default function LeadList() {
  const [leads, setLeads] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ stage: "", follow_up_date: "" });

  useEffect(() => {
    loadLeads();
  }, []);

  async function loadLeads() {
    const data = await fetchLeads();
    setLeads(data);
  }

  function startEditing(lead) {
    setEditingId(lead.id);
    setFormData({
      stage: lead.stage || "",
      follow_up_date: lead.follow_up_date
        ? lead.follow_up_date.split("T")[0]
        : "",
    });
  }

  function cancelEditing() {
    setEditingId(null);
  }

  function handleChange(e) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function saveLead() {
    await updateLead(editingId, formData);
    setEditingId(null);
    loadLeads();
  }

  return (
    <div>
      <h2>Leads</h2>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Name</th>
            <th>Contact</th>
            <th>Company</th>
            <th>Product Interest</th>
            <th>Stage</th>
            <th>Follow-up Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) =>
            editingId === lead.id ? (
              <tr key={lead.id}>
                <td>{lead.name}</td>
                <td>{lead.contact}</td>
                <td>{lead.company}</td>
                <td>{lead.product_interest}</td>
                <td>
                  <select
                    name="stage"
                    value={formData.stage}
                    onChange={handleChange}
                  >
                    <option value="">--Select--</option>
                    {stages.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="date"
                    name="follow_up_date"
                    value={formData.follow_up_date}
                    onChange={handleChange}
                  />
                </td>
                <td>
                  <button onClick={saveLead}>Save</button>{" "}
                  <button onClick={cancelEditing}>Cancel</button>
                </td>
              </tr>
            ) : (
              <tr key={lead.id}>
                <td>{lead.name}</td>
                <td>{lead.contact}</td>
                <td>{lead.company}</td>
                <td>{lead.product_interest}</td>
                <td>{lead.stage}</td>
                <td>
                  {lead.follow_up_date ? lead.follow_up_date.split("T")[0] : ""}
                </td>
                <td>
                  <button onClick={() => startEditing(lead)}>Edit</button>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}
