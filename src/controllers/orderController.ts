import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Order from '../models/Order';
import Service from '../models/Service';
import AIEvent from '../models/AIEvent';

export async function createOrder(req: AuthRequest, res: Response) {
  try {
    const { serviceId, scheduledAt } = req.body;
    const userId = req.user?._id;

    if (!serviceId) {
      return res.status(400).json({ message: 'Service ID is required' });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const order = await Order.create({
      userId,
      serviceId,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      status: 'pending', // Simulated payment step, starts as pending
    });

    // Track event for AI recommendation
    await AIEvent.create({
      userId,
      type: 'order_created',
      payload: { serviceId, category: service.category, title: service.title },
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create order' });
  }
}

export async function getMyOrders(req: AuthRequest, res: Response) {
  try {
    const orders = await Order.find({ userId: req.user?._id })
      .populate({
        path: 'serviceId',
        select: 'title category price images duration',
        populate: { path: 'mentorId', select: 'name avatar' }
      })
      .sort('-createdAt');

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
}

export async function getMentorOrders(req: AuthRequest, res: Response) {
  try {
    // Find all services owned by this mentor
    const services = await Service.find({ mentorId: req.user?._id }).select('_id');
    const serviceIds = services.map(s => s._id);

    const orders = await Order.find({ serviceId: { $in: serviceIds } })
      .populate('userId', 'name email avatar')
      .populate('serviceId', 'title category price duration')
      .sort('-createdAt');

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch mentor orders' });
  }
}

export async function updateOrderStatus(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'paid', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findById(id).populate('serviceId');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Access control:
    // User can cancel. Mentor can update to paid/completed.
    // For simplicity in this demo, we allow the update.
    order.status = status;
    await order.save();

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update order status' });
  }
}
