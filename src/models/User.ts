import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'buyer' | 'mentor' | 'admin';
  avatar?: string;
  googleId?: string;
  skillsInterested: string[];
  goals: string[];
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, minlength: 6 },
  role: { type: String, enum: ['buyer', 'mentor', 'admin'], default: 'buyer' },
  avatar: { type: String },
  googleId: { type: String },
  skillsInterested: [{ type: String }],
  goals: [{ type: String }],
}, { timestamps: true });

export default mongoose.model<IUser>('User', userSchema);
