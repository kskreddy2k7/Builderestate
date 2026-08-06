const prisma = require('../config/db');

// Get all properties with search and filter
const getAllProperties = async (req, res) => {
  try {
    const { search, city, type, minPrice, maxPrice, bedrooms, bathrooms, status } = req.query;

    const where = {};

    // Filter by status (default to AVAILABLE for public search if not specified)
    if (status) {
      where.status = status;
    }

    // Search query
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filters
    if (city) {
      where.city = { equals: city, mode: 'insensitive' };
    }
    if (type) {
      where.type = type;
    }
    if (bedrooms) {
      where.bedrooms = parseInt(bedrooms);
    }
    if (bathrooms) {
      where.bathrooms = parseInt(bathrooms);
    }

    // Price range filter
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    const properties = await prisma.property.findMany({
      where,
      include: {
        images: true,
        builder: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        project: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(properties);
  } catch (error) {
    console.error('Get all properties error:', error);
    res.status(500).json({ message: 'Error retrieving properties' });
  }
};

// Get property by ID
const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        images: true,
        builder: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        project: true,
      },
    });

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.status(200).json(property);
  } catch (error) {
    console.error('Get property by ID error:', error);
    res.status(500).json({ message: 'Error retrieving property' });
  }
};

// Create a new property (Builder only)
const createProperty = async (req, res) => {
  try {
    const { title, description, price, address, city, type, bedrooms, bathrooms, area, projectId, imageUrls } = req.body;
    const builderId = req.user.id; // From authMiddleware

    if (!title || !description || !price || !address || !city || !type || !bedrooms || !bathrooms || !area) {
      return res.status(400).json({ message: 'Missing required property details' });
    }

    const data = {
      title,
      description,
      price: parseFloat(price),
      address,
      city,
      type,
      bedrooms: parseInt(bedrooms),
      bathrooms: parseInt(bathrooms),
      area: parseFloat(area),
      builderId,
    };

    if (projectId) {
      data.projectId = projectId;
    }

    // Handle uploaded files if any (from multer)
    let finalImages = [];
    if (req.files && req.files.length > 0) {
      finalImages = req.files.map((file) => `/uploads/${file.filename}`);
    } else if (imageUrls && Array.isArray(imageUrls)) {
      // Support manual JSON image URLs for seeding/testing
      finalImages = imageUrls;
    }

    const property = await prisma.property.create({
      data: {
        ...data,
        images: {
          create: finalImages.map((url) => ({ url })),
        },
      },
      include: {
        images: true,
        project: true,
      },
    });

    res.status(201).json(property);
  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({ message: 'Error creating property' });
  }
};

// Update property (Builder who owns it or Admin)
const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, address, city, type, bedrooms, bathrooms, area, status, projectId, imageUrls } = req.body;

    const property = await prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check ownership or Admin role
    if (property.builderId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to update this property' });
    }

    const data = {};
    if (title) data.title = title;
    if (description) data.description = description;
    if (price) data.price = parseFloat(price);
    if (address) data.address = address;
    if (city) data.city = city;
    if (type) data.type = type;
    if (bedrooms) data.bedrooms = parseInt(bedrooms);
    if (bathrooms) data.bathrooms = parseInt(bathrooms);
    if (area) data.area = parseFloat(area);
    if (status) data.status = status;
    
    if (projectId !== undefined) {
      data.projectId = projectId || null;
    }

    // Handle image updates
    let newImages = [];
    if (req.files && req.files.length > 0) {
      newImages = req.files.map((file) => `/uploads/${file.filename}`);
    } else if (imageUrls && Array.isArray(imageUrls)) {
      newImages = imageUrls;
    }

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        ...data,
        images: newImages.length > 0 ? {
          deleteMany: {}, // Clean old images
          create: newImages.map((url) => ({ url })),
        } : undefined,
      },
      include: {
        images: true,
        project: true,
      },
    });

    res.status(200).json(updatedProperty);
  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({ message: 'Error updating property' });
  }
};

// Delete property (Builder who owns it or Admin)
const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check auth
    if (property.builderId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to delete this property' });
    }

    await prisma.property.delete({
      where: { id },
    });

    res.status(200).json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({ message: 'Error deleting property' });
  }
};

module.exports = {
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
};
