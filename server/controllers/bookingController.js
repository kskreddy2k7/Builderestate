const prisma = require('../config/db');

// Create a booking (Buyer only)
const createBooking = async (req, res) => {
  try {
    const { propertyId, amount } = req.body;
    const buyerId = req.user.id;

    if (!propertyId || !amount) {
      return res.status(400).json({ message: 'Property ID and amount are required' });
    }

    // Check if property exists and is available
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.status !== 'AVAILABLE') {
      return res.status(400).json({ message: 'Property is not available for booking' });
    }

    const booking = await prisma.booking.create({
      data: {
        propertyId,
        buyerId,
        amount: parseFloat(amount),
        status: 'PENDING',
      },
      include: {
        property: true,
      },
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Error creating booking' });
  }
};

// Get bookings for current buyer
const getBuyerBookings = async (req, res) => {
  try {
    const buyerId = req.user.id;

    const bookings = await prisma.booking.findMany({
      where: { buyerId },
      include: {
        property: {
          include: {
            images: true,
            builder: {
              select: { name: true, email: true, phone: true },
            },
          },
        },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(bookings);
  } catch (error) {
    console.error('Get buyer bookings error:', error);
    res.status(500).json({ message: 'Error retrieving bookings' });
  }
};

// Get bookings for current builder's properties
const getBuilderBookings = async (req, res) => {
  try {
    const builderId = req.user.id;

    const bookings = await prisma.booking.findMany({
      where: {
        property: {
          builderId,
        },
      },
      include: {
        property: {
          include: {
            images: true,
          },
        },
        buyer: {
          select: { id: true, name: true, email: true, phone: true },
        },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(bookings);
  } catch (error) {
    console.error('Get builder bookings error:', error);
    res.status(500).json({ message: 'Error retrieving bookings' });
  }
};

// Update booking status (Builder or Admin)
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // CONFIRMED, CANCELLED, PENDING

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { property: true },
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Ensure authorized: builder who owns the property or Admin
    if (booking.property.builderId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to manage this booking' });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status },
    });

    // If confirmed, optionally mark property as SOLD
    if (status === 'CONFIRMED') {
      await prisma.property.update({
        where: { id: booking.propertyId },
        data: { status: 'SOLD' },
      });
    } else if (status === 'CANCELLED') {
      await prisma.property.update({
        where: { id: booking.propertyId },
        data: { status: 'AVAILABLE' },
      });
    }

    res.status(200).json(updatedBooking);
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ message: 'Error updating booking status' });
  }
};

// Process mock payment (Buyer only)
const createPayment = async (req, res) => {
  try {
    const { bookingId, amount, reference } = req.body;
    const buyerId = req.user.id;

    if (!bookingId || !amount || !reference) {
      return res.status(400).json({ message: 'Booking ID, amount, and reference are required' });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.buyerId !== buyerId) {
      return res.status(403).json({ message: 'Unauthorized payment attempt' });
    }

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        bookingId,
        amount: parseFloat(amount),
        status: 'SUCCESS',
        reference,
      },
    });

    // Auto-update booking to CONFIRMED and property to SOLD
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CONFIRMED' },
    });

    await prisma.property.update({
      where: { id: booking.propertyId },
      data: { status: 'SOLD' },
    });

    res.status(201).json(payment);
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ message: 'Error processing payment' });
  }
};

module.exports = {
  createBooking,
  getBuyerBookings,
  getBuilderBookings,
  updateBookingStatus,
  createPayment,
};
