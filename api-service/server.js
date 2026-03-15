const express = require("express");
const cors = require("cors");
const { pool, initDb } = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", service: "api-service", database: "connected" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.get("/tasks", async (req, res) => {
  const result = await pool.query("SELECT * FROM tasks ORDER BY id DESC");
  res.json(result.rows);
});

app.post("/tasks", async (req, res) => {
  const { title, status } = req.body;
  if (!title || !title.trim()) return res.status(400).json({ message: "title is required" });
  const result = await pool.query(
    "INSERT INTO tasks (title, status) VALUES ($1, $2) RETURNING *",
    [title.trim(), status || "todo"]
  );
  res.status(201).json(result.rows[0]);
});

app.put("/tasks/:id", async (req, res) => {
  const result = await pool.query(
    "UPDATE tasks SET title = COALESCE($1, title), status = COALESCE($2, status) WHERE id = $3 RETURNING *",
    [req.body.title, req.body.status, req.params.id]
  );
  if (result.rowCount === 0) return res.status(404).json({ message: "task not found" });
  res.json(result.rows[0]);
});

app.delete("/tasks/:id", async (req, res) => {
  const result = await pool.query("DELETE FROM tasks WHERE id = $1 RETURNING *", [req.params.id]);
  if (result.rowCount === 0) return res.status(404).json({ message: "task not found" });
  res.json({ message: "task deleted", task: result.rows[0] });
});

const port = process.env.PORT || 3000;
initDb().then(() => app.listen(port, () => console.log(`API running on ${port}`))).catch(err => {
  console.error(err);
  process.exit(1);
});
