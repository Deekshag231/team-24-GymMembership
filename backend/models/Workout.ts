import mongoose, { Document, Schema } from 'mongoose';

export interface IExercise {
  name: string;
  sets: number;
  reps: number;
  weight: number;
  notes?: string;
}

export interface IWorkout extends Document {
  member: mongoose.Types.ObjectId;
  date: Date;
  exercises: IExercise[];
  duration: number; // in minutes
  totalVolume: number;
  caloriesBurned?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const exerciseSchema = new Schema<IExercise>({
  name: {
    type: String,
    required: true,
  },
  sets: {
    type: Number,
    required: true,
    min: 1,
  },
  reps: {
    type: Number,
    required: true,
    min: 1,
  },
  weight: {
    type: Number,
    required: true,
    min: 0,
  },
  notes: {
    type: String,
  },
});

const workoutSchema = new Schema<IWorkout>(
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
    exercises: {
      type: [exerciseSchema],
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 0,
    },
    totalVolume: {
      type: Number,
      default: 0,
    },
    caloriesBurned: {
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

// Calculate total volume before saving
workoutSchema.pre('save', function (next) {
  this.totalVolume = this.exercises.reduce(
    (sum, ex) => sum + ex.sets * ex.reps * ex.weight,
    0
  );
  next();
});

// Indexes
workoutSchema.index({ member: 1, date: -1 });
workoutSchema.index({ date: -1 });

const Workout = mongoose.model<IWorkout>('Workout', workoutSchema);

export default Workout;

