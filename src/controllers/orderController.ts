import { Response, Request } from 'express';
import { AuthRequest } from '../middleware/auth';
import Order from '../models/Order';
import Service from '../models/Service';
import AIEvent from '../models/AIEvent';

function getStripe() {
  return require('stripe')(process.env.STRIPE_SECRET_KEY);
}

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
      amount: service.price,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      status: 'pending',
    });

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

export async function createCheckoutSession(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const order = await Order.findById(id).populate('serviceId');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.userId.toString() !== userId?.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Order is not pending' });
    }

    const service = order.serviceId as any;
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: service.title,
              description: service.shortDesc?.slice(0, 200),
            },
            unit_amount: Math.round(service.price * 100),
          },
          quantity: 1,
        },
      ],
      client_reference_id: order._id.toString(),
      customer_email: req.user?.email,
      metadata: { orderId: order._id.toString() },
      success_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/orders`,
    });

    order.stripeSessionId = session.id;
    await order.save();

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create checkout session' });
  }
}

export async function verifyPayment(req: AuthRequest, res: Response) {
  try {
    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({ message: 'Session ID is required' });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(session_id);
    const orderId = session.metadata?.orderId || session.client_reference_id;

    if (!orderId) {
      return res.status(404).json({ message: 'Order not found in session' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (session.payment_status === 'paid' && order.status === 'pending') {
      order.status = 'paid';
      await order.save();
    }

    res.json({ status: order.status });
  } catch (err) {
    res.status(500).json({ message: 'Failed to verify payment' });
  }
}

export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers['stripe-signature'] as string;

  let event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return res.status(400).json({ message: 'Invalid signature' });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata?.orderId || session.client_reference_id;

    if (orderId) {
      await Order.findByIdAndUpdate(orderId, { status: 'paid' });
    }
  }

  res.status(200).json({ received: true });
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

    order.status = status;
    await order.save();

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update order status' });
  }
}
