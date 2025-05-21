const express = require("express");
const router = express.Router();
const pool = require("../db/db");

// POST /api/leads — Add a new lead
router.post("/", async (req, res) => {
  try {
    const { name, contact, company, product_interest, stage, follow_up_date } =
      req.body;

    // Basic validation
    if (!name || !contact || !stage) {
      return res
        .status(400)
        .json({ error: "Name, contact, and stage are required" });
    }

    const newLead = await pool.query(
      `INSERT INTO leads (name, contact, company, product_interest, stage, follow_up_date)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, contact, company, product_interest, stage, follow_up_date]
    );

    res.status(201).json(newLead.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});
// GET /api/leads — Get all leads
// GET /api/leads?stage=Qualified&follow_up_before=2025-05-30
router.get("/", async (req, res) => {
  try {
    const { stage, follow_up_before } = req.query;
    let query = "SELECT * FROM leads";
    let conditions = [];
    let values = [];

    if (stage) {
      values.push(stage);
      conditions.push(`stage = $${values.length}`);
    }
    if (follow_up_before) {
      values.push(follow_up_before);
      conditions.push(`follow_up_date <= $${values.length}`);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY created_at DESC";

    const leads = await pool.query(query, values);
    res.json(leads.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});
// PATCH /api/leads/:id
// PATCH /api/leads/:id
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { stage, follow_up_date, name, contact, company, product_interest } =
      req.body;

    const fields = [];
    const values = [];
    let count = 1;

    if (stage) {
      fields.push(`stage = $${count++}`);
      values.push(stage);
    }
    if (follow_up_date) {
      fields.push(`follow_up_date = $${count++}`);
      values.push(follow_up_date);
    }
    if (name) {
      fields.push(`name = $${count++}`);
      values.push(name);
    }
    if (contact) {
      fields.push(`contact = $${count++}`);
      values.push(contact);
    }
    if (company) {
      fields.push(`company = $${count++}`);
      values.push(company);
    }
    if (product_interest) {
      fields.push(`product_interest = $${count++}`);
      values.push(product_interest);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    values.push(id);

    const query = `UPDATE leads SET ${fields.join(
      ", "
    )} WHERE id = $${count} RETURNING *`;
    const updatedLead = await pool.query(query, values);

    if (updatedLead.rows.length === 0) {
      return res.status(404).json({ error: "Lead not found" });
    }

    res.json(updatedLead.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
