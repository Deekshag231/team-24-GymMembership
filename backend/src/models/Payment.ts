import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  member: mongoose.Types.ObjectId;
  amount: number;
  type: 'membership' | 'session' | 'plan';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentDate: Date;
  membership?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    member: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      enum: ['membership', 'session', 'plan'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    membership: {
      type: Schema.Types.ObjectId,
      ref: 'Membership',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
paymentSchema.index({ member: 1, paymentDate: -1 });
paymentSchema.index({ paymentDate: -1, status: 1 });

const Payment = mongoose.model<IPayment>('Payment', paymentSchema);

export default Payment;

