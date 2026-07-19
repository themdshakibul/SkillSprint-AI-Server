import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  serviceId: mongoose.Types.ObjectId;
  status: 'pending' | 'paid' | 'completed' | 'cancelled';
  amount: number;
  stripeSessionId?: string;
  scheduledAt?: Date;
  createdAt: Date;
}

const orderSchema = new Schema<IOrder>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
  status: { type: String, enum: ['pending', 'paid', 'completed', 'cancelled'], default: 'pending' },
  amount: { type: Number, required: true },
  stripeSessionId: { type: String, sparse: true, unique: true },
  scheduledAt: { type: Date },
}, { timestamps: true });

export default mongoose.model<IOrder>('Order', orderSchema);
