import { Response, NextFunction } from 'express';
import Staff from '../models/Staff';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

export const getAllStaff = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { filter } = req.query;
    const query: any = {};

    if (filter === 'trainers') {
      const trainers = await User.find({ role: 'trainer' });
      const trainerIds = trainers.map((t) => t._id);
      query.user = { $in: trainerIds };
    } else if (filter === 'staff') {
      const staffUsers = await User.find({ role: { $in: ['admin', 'trainer'] } });
      const staffIds = staffUsers.map((s) => s._id);
      query.user = { $in: staffIds };
      query.role = { $ne: 'trainer' };
    }

    const staff = await Staff.find(query)
      .populate('user', 'name email phone role')
      .sort({ joinDate: -1 });

    res.status(200).json({
      status: 'success',
      results: staff.length,
      data: {
        staff,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

export const createStaff = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId, role, specialization, availability } = req.body;

    const staff = await Staff.create({
      user: userId,
      role,
      specialization: specialization || [],
      availability: availability || {},
    });

    res.status(201).json({
      status: 'success',
      data: {
        staff,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

