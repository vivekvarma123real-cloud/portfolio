require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./db");
const projectsRouter = require("./routes/projects");
const contactRouter = require("./routes/contact");

const app = express();
const PORT = process.env.PORT || 3000;

let dbReady = null;

function ensureDb() {
  if (!dbReady) {
    dbReady = db.connect().then(() => db.init());
  }
  return dbReady;
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api", async (req, res, next) => {
  try {
    await ensureDb();
    next();
  } catch (error) {
    res.status(503).json({ message: "Database unavailable", error: error.message });
  }
});

app.use("/api/projects", projectsRouter);
app.use("/api/contact", contactRouter);

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    backend: "Node.js / Express.js",
    database: process.env.DB_TYPE || "file"
  });
});

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api") || /\.[a-zA-Z0-9]+$/.test(req.path)) {
    return next();
  }
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

async function startServer() {
  try {
    await ensureDb();
    console.log(`Database connected (${process.env.DB_TYPE || "file"})`);

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;
