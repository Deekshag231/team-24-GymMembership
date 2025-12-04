import mongoose, { Document, Schema } from 'mongoose';

export interface IPlanExercise {
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  notes?: string;
}

export interface IWorkoutPlan extends Document {
  name: string;
  description: string;
  duration: string; // e.g., "8 weeks"
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: 'strength' | 'cardio' | 'flexibility' | 'mixed';
  exercises: IPlanExercise[];
  createdBy: mongoose.Types.ObjectId;
  assignedTo: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const planExerciseSchema = new Schema<IPlanExercise>({
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
    min: 0,
  },
  notes: {
    type: String,
  },
});

const workoutPlanSchema = new Schema<IWorkoutPlan>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      required: true,
    },
    category: {
      type: String,
      enum: ['strength', 'cardio', 'flexibility', 'mixed'],
      required: true,
    },
    exercises: {
      type: [planExerciseSchema],
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
workoutPlanSchema.index({ createdBy: 1 });
workoutPlanSchema.index({ category: 1 });

const WorkoutPlan = mongoose.model<IWorkoutPlan>('WorkoutPlan', workoutPlanSchema);

export default WorkoutPlan;

