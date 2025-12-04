import mongoose, { Document, Schema } from 'mongoose';

export interface IStaff extends Document {
  user: mongoose.Types.ObjectId;
  role: string;
  specialization: string[];
  rating: number;
  activeClients: number;
  joinDate: Date;
  availability?: {
    [key: string]: string; // e.g., "Monday": "7:00 AM - 8:00 PM"
  };
  createdAt: Date;
  updatedAt: Date;
}

const staffSchema = new Schema<IStaff>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    role: {
      type: String,
      required: true,
    },
    specialization: [
      {
        type: String,
      },
    ],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    activeClients: {
      type: Number,
      default: 0,
      min: 0,
    },
    joinDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    availability: {
      type: Map,
      of: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
staffSchema.index({ user: 1 });

const Staff = mongoose.model<IStaff>('Staff', staffSchema);

export default Staff;

