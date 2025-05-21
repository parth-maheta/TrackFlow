import React, { useEffect, useState } from "react";
import { fetchLeads, updateLead, createLead } from "../../../client/src/api";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const ItemTypes = { LEAD: "lead" };
const stages = [
  "New",
  "Contacted",
  "Qualified",
  "Proposal Sent",
  "Won",
  "Lost",
];

function LeadCard({ lead }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.LEAD,
    item: { id: lead.id, currentStage: lead.stage },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  }));

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        padding: "10px",
        margin: "6px 0",
        backgroundColor: "#FFF5F7",
        border: "1px solid #FBB6CE",
        borderRadius: "10px",
        boxShadow: "0 2px 5px rgba(219, 39, 119, 0.1)",
        cursor: "move",
        fontSize: "14px",
        color: "#6B021D",
      }}
    >
      <strong style={{ color: "#B83280" }}>{lead.name}</strong>
      <br />
      <span style={{ color: "#9D174D" }}>{lead.contact}</span>
      <br />
      <span style={{ fontSize: "12px", color: "#C53030" }}>
        Follow-up: {lead.follow_up_date?.split("T")[0] || "None"}
      </span>
    </div>
  );
}

function StageColumn({ stage, leads, onDropLead }) {
  const [, drop] = useDrop(() => ({
    accept: ItemTypes.LEAD,
    drop: (item) => {
      if (item.currentStage !== stage) {
        onDropLead(item.id, stage);
      }
    },
  }));

  return (
    <div
      ref={drop}
      style={{
        width: "16%",
        minHeight: "400px",
        backgroundColor: "#FFF7ED",
        padding: "12px",
        borderRadius: "12px",
        boxShadow: "0 4px 10px rgba(255, 105, 180, 0.1)",
        boxSizing: "border-box",
        margin: "0 8px",
      }}
    >
      <h4
        style={{
          textAlign: "center",
          color: "#D946EF",
          marginBottom: "12px",
        }}
      >
        {stage}
      </h4>
      {leads.map((lead) => (
        <LeadCard key={lead.id} lead={lead} />
      ))}
    </div>
  );
}

export default function LeadKanban() {
  const [leads, setLeads] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);

  useEffect(() => {
    loadLeads();
  }, []);

  async function loadLeads() {
    const data = await fetchLeads();
    setLeads(data);
  }

  async function onDropLead(leadId, newStage) {
    await updateLead(leadId, { stage: newStage });
    loadLeads();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const newLead = {
      name: form.name.value,
      contact: form.contact.value, // updated field
      stage: form.stage.value,
      follow_up_date: form.follow_up_date.value,
    };

    if (editingLead) {
      await updateLead(editingLead.id, newLead);
    } else {
      await createLead(newLead);
    }

    setShowModal(false);
    setEditingLead(null);
    loadLeads();
  }

  const grouped = stages.reduce((acc, stage) => {
    acc[stage] = leads.filter((lead) => lead.stage === stage);
    return acc;
  }, {});

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ padding: "24px", fontFamily: "sans-serif" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ color: "#D946EF" }}>Lead Management</h2>
          <button
            onClick={() => {
              setShowModal(true);
              setEditingLead(null);
            }}
            style={buttonStyle}
          >
            + New Lead
          </button>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {stages.map((stage) => (
            <StageColumn
              key={stage}
              stage={stage}
              leads={grouped[stage] || []}
              onDropLead={onDropLead}
            />
          ))}
        </div>

        {showModal && (
          <div style={modalOverlay}>
            <div style={modalStyle}>
              <h3 style={{ color: "#B83280" }}>
                {editingLead ? "Edit Lead" : "New Lead"}
              </h3>
              <form onSubmit={handleSubmit}>
                <input
                  name="name"
                  placeholder="Name"
                  required
                  defaultValue={editingLead?.name || ""}
                  style={inputStyle}
                />
                <input
                  name="contact"
                  placeholder="Contact"
                  required
                  defaultValue={editingLead?.contact || ""}
                  style={inputStyle}
                />
                <select
                  name="stage"
                  required
                  defaultValue={editingLead?.stage || "New"}
                  style={inputStyle}
                >
                  {stages.map((stage) => (
                    <option key={stage}>{stage}</option>
                  ))}
                </select>
                <input
                  type="date"
                  name="follow_up_date"
                  defaultValue={
                    editingLead?.follow_up_date?.split("T")[0] || ""
                  }
                  style={inputStyle}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "10px",
                    marginTop: "16px",
                  }}
                >
                  <button type="submit" style={buttonStyle}>
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    style={{ ...buttonStyle, backgroundColor: "#FBB6CE" }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
}

// === STYLES ===

const buttonStyle = {
  backgroundColor: "#D946EF",
  color: "#fff",
  border: "none",
  padding: "10px 18px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "14px",
};

const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.3)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modalStyle = {
  background: "#FFF1F2",
  padding: "30px",
  borderRadius: "12px",
  width: "400px",
  boxShadow: "0 6px 20px rgba(214, 31, 105, 0.2)",
};

const inputStyle = {
  width: "100%",
  marginBottom: "14px",
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #FBB6CE",
  fontSize: "14px",
  backgroundColor: "#FFF5F7",
};
