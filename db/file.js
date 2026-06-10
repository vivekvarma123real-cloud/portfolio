const fs = require("fs").promises;
const path = require("path");
const seedData = require("./seedData");

const dataFile = path.join(__dirname, "..", "data", "projects.json");

async function connect() {}

async function init() {
  try {
    await fs.access(dataFile);
  } catch {
    await fs.mkdir(path.dirname(dataFile), { recursive: true });
    await fs.writeFile(dataFile, JSON.stringify(seedData, null, 2));
  }
}

async function getProjects() {
  const data = await fs.readFile(dataFile, "utf8");
  return JSON.parse(data).map((project, index) => ({
    id: project.id || index + 1,
    ...project
  }));
}

async function createProject(data) {
  const projects = await getProjects();
  const project = {
    id: projects.length ? Math.max(...projects.map(p => p.id)) + 1 : 1,
    title: data.title,
    description: data.description,
    image: data.image || "",
    skills: data.skills || [],
    githubUrl: data.githubUrl || "#",
    liveUrl: data.liveUrl || "#"
  };

  projects.push(project);
  await fs.writeFile(dataFile, JSON.stringify(projects, null, 2));
  return project;
}

module.exports = { connect, init, getProjects, createProject };
