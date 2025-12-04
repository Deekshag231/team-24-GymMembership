import { Response, NextFunction } from 'express';
import WorkoutPlan from '../models/WorkoutPlan';
import { AuthRequest } from '../middleware/auth';

export const getAllPlans = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { category } = req.query;
    const query: any = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    const plans = await WorkoutPlan.find(query)
      .populate('createdBy', 'name')
      .populate('assignedTo', 'name');

    res.status(200).json({
      status: 'success',
      results: plans.length,
      data: {
        plans,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

export const createPlan = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const plan = await WorkoutPlan.create({
      ...req.body,
      createdBy: req.user?._id,
    });

    res.status(201).json({
      status: 'success',
      data: {
        plan,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

export const assignPlan = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { memberId } = req.body;

    const plan = await WorkoutPlan.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { assignedTo: memberId } },
      { new: true }
    );

    if (!plan) {
      res.status(404).json({
        status: 'fail',
        message: 'Plan not found',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: {
        plan,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

export const updatePlan = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const plan = await WorkoutPlan.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user?._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!plan) {
      res.status(404).json({
        status: 'fail',
        message: 'Plan not found or you do not have permission',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: {
        plan,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

export const deletePlan = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await WorkoutPlan.findOneAndDelete({ _id: req.params.id, createdBy: req.user?._id });

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

