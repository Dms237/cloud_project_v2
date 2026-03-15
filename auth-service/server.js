const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());
const users = [];

app.get("/health", (req, res) => res.json({ status: "ok", service: "auth-service" }));

app.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: "name, email and password are required" });
  if (users.find(u => u.email === email)) return res.status(409).json({ message: "user already exists" });
  const user = { id: users.length + 1, name, email, password };
  users.push(user);
  res.status(201).json({ message: "user registered", user: { id: user.id, name, email } });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ message: "invalid credentials" });
  const token = jwt.sign({ sub: user.id, email: user.email, name: user.name }, process.env.JWT_SECRET || "super-secret-demo-key", { expiresIn: "2h" });
  res.json({ message: "login successful", token, user: { id: user.id, name: user.name, email: user.email } });
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Auth running on ${port}`));
