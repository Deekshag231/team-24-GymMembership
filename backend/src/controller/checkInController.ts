import { Response, NextFunction } from 'express';
import CheckIn from '../models/CheckIn';
import { AuthRequest } from '../middleware/auth';

export const checkIn = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { location } = req.body;

    // Check if already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingCheckIn = await CheckIn.findOne({
      member: req.user?._id,
      checkInTime: { $gte: today, $lt: tomorrow },
    });

    if (existingCheckIn) {
      res.status(400).json({
        status: 'fail',
        message: 'You have already checked in today',
      });
      return;
    }

    const checkIn = await CheckIn.create({
      member: req.user?._id,
      location: location || 'FitTrack Downtown',
      checkInTime: new Date(),
    });

    res.status(201).json({
      status: 'success',
      data: {
        checkIn,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

export const getMyCheckIns = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const checkIns = await CheckIn.find({ member: req.user?._id })
      .sort({ checkInTime: -1 })
      .limit(50);

    res.status(200).json({
      status: 'success',
      results: checkIns.length,
      data: {
        checkIns,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

