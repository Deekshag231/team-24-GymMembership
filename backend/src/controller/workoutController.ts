import { Response, NextFunction } from 'express';
import Workout from '../models/Workout';
import { AuthRequest } from '../middleware/auth';

export const getMyWorkouts = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const workouts = await Workout.find({ member: req.user?._id })
      .sort({ date: -1 })
      .limit(50);

    res.status(200).json({
      status: 'success',
      results: workouts.length,
      data: {
        workouts,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

export const createWorkout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const workout = await Workout.create({
      ...req.body,
      member: req.user?._id,
    });

    res.status(201).json({
      status: 'success',
      data: {
        workout,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

export const updateWorkout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const workout = await Workout.findOneAndUpdate(
      { _id: req.params.id, member: req.user?._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!workout) {
      res.status(404).json({
        status: 'fail',
        message: 'Workout not found',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: {
        workout,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

export const deleteWorkout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await Workout.findOneAndDelete({ _id: req.params.id, member: req.user?._id });

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

export const getWorkoutStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    startOfWeek.setHours(0, 0, 0, 0);

    const workoutsThisWeek = await Workout.countDocuments({
      member: req.user?._id,
      date: { $gte: startOfWeek },
    });

    const totalWorkouts = await Workout.countDocuments({ member: req.user?._id });
    const totalVolume = await Workout.aggregate([
      { $match: { member: req.user?._id } },
      { $group: { _id: null, total: { $sum: '$totalVolume' } } },
    ]);

    // Calculate streak
    const recentWorkouts = await Workout.find({ member: req.user?._id })
      .sort({ date: -1 })
      .limit(30);

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < recentWorkouts.length; i++) {
      const workoutDate = new Date(recentWorkouts[i].date);
      workoutDate.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor((today.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === i) {
        streak++;
      } else {
        break;
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          workoutsThisWeek,
          totalWorkouts,
          totalVolume: totalVolume[0]?.total || 0,
          streak,
        },
      },
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

