import mongoose, { Document, Schema } from 'mongoose';

export interface ISession extends Document {
  type: string;
  trainer: mongoose.Types.ObjectId;
  date: Date;
  time: string;
  duration: number; // in minutes
  maxSpots: number;
  bookedSpots: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  bookings: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    type: {
      type: String,
      required: true,
    },
    trainer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 0,
    },
    maxSpots: {
      type: Number,
      required: true,
      min: 1,
    },
    bookedSpots: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    bookings: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Booking',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
sessionSchema.index({ trainer: 1, date: 1 });
sessionSchema.index({ date: 1, status: 1 });

const Session = mongoose.model<ISession>('Session', sessionSchema);

export default Session;

