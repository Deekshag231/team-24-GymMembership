import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  member: mongoose.Types.ObjectId;
  session: mongoose.Types.ObjectId;
  status: 'confirmed' | 'cancelled' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    member: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    session: {
      type: Schema.Types.ObjectId,
      ref: 'Session',
      required: true,
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled', 'completed'],
      default: 'confirmed',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
bookingSchema.index({ member: 1, status: 1 });
bookingSchema.index({ session: 1 });

const Booking = mongoose.model<IBooking>('Booking', bookingSchema);

export default Booking;

