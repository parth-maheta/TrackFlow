// backend/index.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const pool = require("./db/db");

const app = express();
const allowedOrigins = [
  "http://localhost:3000", // your local CRA dev server
  "https://trackeflow.netlify.app/", //
  // your Netlify frontend URL
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true, // if you use cookies/auth
  })
);
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
