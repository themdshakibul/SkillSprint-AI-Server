import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Service from '../models/Service';
import User from '../models/User';
import Order from '../models/Order';

export async function getPendingServices(req: AuthRequest, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const total = await Service.countDocuments({ approved: false });
    const services = await Service.find({ approved: false })
      .populate('mentorId', 'name email avatar')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ data: services, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch pending services' });
  }
}

export async function getAllServices(req: AuthRequest, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;

    const filter: any = {};
    if (status === 'approved') filter.approved = true;
    else if (status === 'pending') filter.approved = false;

    const total = await Service.countDocuments(filter);
    const services = await Service.find(filter)
      .populate('mentorId', 'name email avatar')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ data: services, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch services' });
  }
}

export async function approveService(req: AuthRequest, res: Response) {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    service.approved = true;
    await service.save();

    res.json({ message: 'Service approved', service });
  } catch (err) {
    res.status(500).json({ message: 'Failed to approve service' });
  }
}

export async function rejectService(req: AuthRequest, res: Response) {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    await Order.deleteMany({ serviceId: service._id });

    res.json({ message: 'Service rejected and removed' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to reject service' });
  }
}

export async function getUsers(req: AuthRequest, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const role = req.query.role as string;

    const filter: any = {};
    if (role) filter.role = role;

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-password')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ data: users, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
}

export async function deleteUser(req: AuthRequest, res: Response) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin users' });
    }

    await Service.deleteMany({ mentorId: user._id });
    await Order.deleteMany({ userId: user._id });
    await user.deleteOne();

    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user' });
  }
}

export async function getDashboardStats(req: AuthRequest, res: Response) {
  try {
    const totalUsers = await User.countDocuments();
    const totalMentors = await User.countDocuments({ role: 'mentor' });
    const totalBuyers = await User.countDocuments({ role: 'buyer' });
    const totalServices = await Service.countDocuments();
    const pendingServices = await Service.countDocuments({ approved: false });
    const approvedServices = await Service.countDocuments({ approved: true });
    const totalOrders = await Order.countDocuments();
    const completedOrders = await Order.countDocuments({ status: 'completed' });

    res.json({
      totalUsers,
      totalMentors,
      totalBuyers,
      totalServices,
      pendingServices,
      approvedServices,
      totalOrders,
      completedOrders,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
}