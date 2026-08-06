const prisma = require('../config/db');

// Get all projects
const getAllProjects = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        builder: {
          select: { id: true, name: true, email: true },
        },
        properties: true,
      },
    });
    res.status(200).json(projects);
  } catch (error) {
    console.error('Get all projects error:', error);
    res.status(500).json({ message: 'Error retrieving projects' });
  }
};

// Create a new project (Builder only)
const createProject = async (req, res) => {
  try {
    const { name, description, location } = req.body;
    const builderId = req.user.id;

    if (!name || !description || !location) {
      return res.status(400).json({ message: 'All project fields are required' });
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        location,
        builderId,
      },
    });

    res.status(201).json(project);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Error creating project' });
  }
};

// Get projects for current builder
const getBuilderProjects = async (req, res) => {
  try {
    const builderId = req.user.id;

    const projects = await prisma.project.findMany({
      where: { builderId },
      include: {
        properties: true,
      },
    });

    res.status(200).json(projects);
  } catch (error) {
    console.error('Get builder projects error:', error);
    res.status(500).json({ message: 'Error retrieving builder projects' });
  }
};

module.exports = {
  getAllProjects,
  createProject,
  getBuilderProjects,
};
