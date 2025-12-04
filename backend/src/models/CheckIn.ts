import mongoose, { Document, Schema } from 'mongoose';

export interface ICheckIn extends Document {
  member: mongoose.Types.ObjectId;
  location: string;
  checkInTime: Date;
  createdAt: Date;
}

const checkInSchema = new Schema<ICheckIn>(
  {
    member: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    checkInTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
checkInSchema.index({ member: 1, checkInTime: -1 });
checkInSchema.index({ checkInTime: -1 });

const CheckIn = mongoose.model<ICheckIn>('CheckIn', checkInSchema);

export default CheckIn;

