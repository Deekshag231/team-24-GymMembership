import mongoose, { Document, Schema } from 'mongoose';

export interface IProgress extends Document {
  member: mongoose.Types.ObjectId;
  date: Date;
  weight?: number;
  bodyFat?: number;
  muscle?: number;
  chest?: number;
  waist?: number;
  arms?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const progressSchema = new Schema<IProgress>(
  {
    member: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    weight: {
      type: Number,
      min: 0,
    },
    bodyFat: {
      type: Number,
      min: 0,
      max: 100,
    },
    muscle: {
      type: Number,
      min: 0,
    },
    chest: {
      type: Number,
      min: 0,
    },
    waist: {
      type: Number,
      min: 0,
    },
    arms: {
      type: Number,
      min: 0,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
progressSchema.index({ member: 1, date: -1 });

const Progress = mongoose.model<IProgress>('Progress', progressSchema);

export default Progress;

