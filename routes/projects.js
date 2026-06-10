const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const projects = await db.getProjects();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch projects", error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title, description, image, skills, githubUrl, liveUrl } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const project = await db.createProject({
      title,
      description,
      image,
      skills: Array.isArray(skills) ? skills : [],
      githubUrl,
      liveUrl
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: "Failed to create project", error: error.message });
  }
});

module.exports = router;
