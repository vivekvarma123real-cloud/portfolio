const mongoose = require("mongoose");
const seedData = require("./seedData");

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, default: "" },
    skills: { type: [String], default: [] },
    githubUrl: { type: String, default: "#" },
    liveUrl: { type: String, default: "#" }
  },
  { timestamps: true }
);

const Project = mongoose.model("Project", projectSchema);

async function connect() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/riya_portfolio";
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000
  });
}

async function init() {
  const count = await Project.countDocuments();
  if (count === 0) {
    await Project.insertMany(seedData);
  }
}

async function getProjects() {
  return Project.find().sort({ createdAt: 1 }).lean();
}

async function createProject(data) {
  const project = await Project.create(data);
  return project.toObject();
}

module.exports = { connect, init, getProjects, createProject };
