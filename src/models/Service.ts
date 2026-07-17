import mongoose, { Document, Schema } from 'mongoose';

export interface IService extends Document {
  title: string;
  shortDesc: string;
  fullDesc: string;
  category: string;
  price: number;
  duration: number;
  ratingAvg: number;
  ratingCount: number;
  location: string;
  images: string[];
  mentorId: mongoose.Types.ObjectId;
  tags: string[];
  createdAt: Date;
}

const serviceSchema = new Schema<IService>({
  title: { type: String, required: true, trim: true },
  shortDesc: { type: String, required: true, trim: true },
  fullDesc: { type: String, required: true },
  category: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  duration: { type: Number, required: true, min: 15 },
  ratingAvg: { type: Number, default: 0, min: 0, max: 5 },
  ratingCount: { type: Number, default: 0 },
  location: { type: String, default: 'Online' },
  images: [{ type: String }],
  mentorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  tags: [{ type: String }],
}, { timestamps: true });

serviceSchema.index({ title: 'text', tags: 'text', shortDesc: 'text' });

export default mongoose.model<IService>('Service', serviceSchema);
