const prisma = require('../config/db');

// Get Admin dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const builderCount = await prisma.user.count({ where: { role: 'BUILDER' } });
    const buyerCount = await prisma.user.count({ where: { role: 'BUYER' } });
    
    const totalProperties = await prisma.property.count();
    const totalBookings = await prisma.booking.count();
    const confirmedBookings = await prisma.booking.count({ where: { status: 'CONFIRMED' } });
    
    const payments = await prisma.payment.findMany({
      where: { status: 'SUCCESS' },
      select: { amount: true },
    });
    
    const totalRevenue = payments.reduce((acc, curr) => acc + curr.amount, 0);

    res.status(200).json({
      stats: {
        totalUsers,
        builderCount,
        buyerCount,
        totalProperties,
        totalBookings,
        confirmedBookings,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error('Get admin dashboard stats error:', error);
    res.status(500).json({ message: 'Error retrieving admin statistics' });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Error retrieving users' });
  }
};

// Delete a user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if trying to delete self
    if (req.user.id === id) {
      return res.status(400).json({ message: 'Admins cannot delete their own account' });
    }

    await prisma.user.delete({
      where: { id },
    });

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  deleteUser,
};
