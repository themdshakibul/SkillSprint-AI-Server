import { Response } from 'express';
import Service from '../models/Service';
import Review from '../models/Review';
import { AuthRequest } from '../middleware/auth';

export async function getServices(req: AuthRequest, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const search = (req.query.search as string) || '';
    const category = (req.query.category as string) || '';
    const minPrice = parseFloat(req.query.minPrice as string);
    const maxPrice = parseFloat(req.query.maxPrice as string);
    const minRating = parseFloat(req.query.minRating as string);
    const sort = (req.query.sort as string) || '-createdAt';

    const filter: any = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
        { shortDesc: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) filter.category = category;
    if (!isNaN(minPrice) || !isNaN(maxPrice)) {
      filter.price = {};
      if (!isNaN(minPrice)) filter.price.$gte = minPrice;
      if (!isNaN(maxPrice)) filter.price.$lte = maxPrice;
    }
    if (!isNaN(minRating)) filter.ratingAvg = { $gte: minRating };

    const sortObj: any = {};
    if (sort === 'price') sortObj.price = 1;
    else if (sort === '-price') sortObj.price = -1;
    else if (sort === 'rating') sortObj.ratingAvg = -1;
    else if (sort === 'newest') sortObj.createdAt = -1;
    else sortObj.createdAt = -1;

    const total = await Service.countDocuments(filter);
    const services = await Service.find(filter)
      .populate('mentorId', 'name avatar')
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      data: services,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch services' });
  }
}

export async function getService(req: AuthRequest, res: Response) {
  try {
    const service = await Service.findById(req.params.id)
      .populate('mentorId', 'name avatar email');

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const reviews = await Review.find({ serviceId: service._id })
      .populate('userId', 'name avatar')
      .sort('-createdAt')
      .limit(20);

    const related = await Service.find({
      category: service.category,
      _id: { $ne: service._id },
    })
      .populate('mentorId', 'name avatar')
      .limit(4);

    res.json({ service, reviews, related });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch service' });
  }
}

export async function createService(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { title, shortDesc, fullDesc, category, price, duration, images, tags } = req.body;

    const service = await Service.create({
      title,
      shortDesc,
      fullDesc,
      category,
      price,
      duration,
      images: images || [],
      tags: tags || [],
      mentorId: req.user._id,
      location: 'Online',
    });

    res.status(201).json(service);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create service' });
  }
}

export async function deleteService(req: AuthRequest, res: Response) {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    if (service.mentorId.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await service.deleteOne();
    res.json({ message: 'Service deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete service' });
  }
}

export async function getCategories(_req: AuthRequest, res: Response) {
  try {
    const categories = await Service.distinct('category');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
}
