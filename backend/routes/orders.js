const express = require("express");
const router = express.Router();
const pool = require("../db/db");

// POST /api/orders - Create a new order linked to a lead
router.post("/", async (req, res) => {
  try {
    const { lead_id, status, courier, tracking_number } = req.body;

    if (!lead_id || !status) {
      return res.status(400).json({ error: "lead_id and status are required" });
    }

    const newOrder = await pool.query(
      `INSERT INTO orders (lead_id, status, courier, tracking_number) VALUES ($1, $2, $3, $4) RETURNING *`,
      [lead_id, status, courier || null, tracking_number || null]
    );

    res.status(201).json(newOrder.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// GET /api/orders - Get all orders with lead info (optional filter by status)
router.get("/", async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT orders.*, leads.name AS lead_name, leads.contact AS lead_contact 
      FROM orders 
      JOIN leads ON orders.lead_id = leads.id
    `;

    const values = [];
    if (status) {
      query += ` WHERE orders.status = $1`;
      values.push(status);
    }

    query += ` ORDER BY orders.created_at DESC`;

    const orders = await pool.query(query, values);
    res.json(orders.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// PATCH /api/orders/:id
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, courier, tracking_number } = req.body;

    const fields = [];
    const values = [];
    let count = 1;

    if (status) {
      fields.push(`status = $${count++}`);
      values.push(status);
    }
    if (courier) {
      fields.push(`courier = $${count++}`);
      values.push(courier);
    }
    if (tracking_number) {
      fields.push(`tracking_number = $${count++}`);
      values.push(tracking_number);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    values.push(id);

    const query = `UPDATE orders SET ${fields.join(
      ", "
    )} WHERE id = $${count} RETURNING *`;
    const updatedOrder = await pool.query(query, values);

    if (updatedOrder.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(updatedOrder.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
