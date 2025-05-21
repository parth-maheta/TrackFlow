// backend/index.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const pool = require("./db/db");

const app = express();
app.use(cors());
app.use(express.json());
const leadRoutes = require("./routes/leads");
app.use("/api/leads", leadRoutes);
const orderRoutes = require("./routes/orders");
app.use("/api/orders", orderRoutes);

// Testing postgresqlDB connection
app.get("/api/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Database error");
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
