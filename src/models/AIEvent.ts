import mongoose, { Document, Schema } from 'mongoose';

export interface IAIEvent extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'service_view' | 'recommendation_click' | 'order_created' | 'tag_preference' | 'search_query';
  payload: Record<string, any>;
  createdAt: Date;
}

const aiEventSchema = new Schema<IAIEvent>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['service_view', 'recommendation_click', 'order_created', 'tag_preference', 'search_query'],
    required: true,
  },
  payload: { type: Schema.Types.Mixed, default: {} },
}, { timestamps: true });

export default mongoose.model<IAIEvent>('AIEvent', aiEventSchema);
