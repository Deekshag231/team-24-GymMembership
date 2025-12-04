import mongoose, { Document, Schema } from 'mongoose';

export interface IMembership extends Document {
  member: mongoose.Types.ObjectId;
  planType: string;
  status: 'active' | 'expired' | 'frozen' | 'cancelled';
  startDate: Date;
  endDate: Date;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

const membershipSchema = new Schema<IMembership>(
  {
    member: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    planType: {
      type: String,
      required: true,
      enum: ['Monthly Basic', 'Monthly Premium', 'Quarterly Premium', 'Annual Premium', 'Premium Annual'],
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'frozen', 'cancelled'],
      default: 'active',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
membershipSchema.index({ member: 1, status: 1 });
membershipSchema.index({ endDate: 1 });

const Membership = mongoose.model<IMembership>('Membership', membershipSchema);

export default Membership;

