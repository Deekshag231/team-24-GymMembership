import { Response, NextFunction } from 'express';
import Progress from '../models/Progress';
import { AuthRequest } from '../middleware/auth';

export const getMyProgress = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { limit = 50 } = req.query;
    const progress = await Progress.find({ member: req.user?._id })
      .sort({ date: -1 })
      .limit(Number(limit));

    res.status(200).json({
      status: 'success',
      results: progress.length,
      data: {
        progress,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

export const createProgress = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const progress = await Progress.create({
      ...req.body,
      member: req.user?._id,
    });

    res.status(201).json({
      status: 'success',
      data: {
        progress,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

export const getProgressStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const progress = await Progress.find({ member: req.user?._id })
      .sort({ date: -1 });

    if (progress.length === 0) {
      res.status(200).json({
        status: 'success',
        data: {
          stats: {
            current: {},
            start: {},
            change: {},
          },
        },
      });
      return;
    }

    const latest = progress[0];
    const earliest = progress[progress.length - 1];

    const stats = {
      weight: {
        current: latest.weight || null,
        start: earliest.weight || null,
        change: latest.weight && earliest.weight ? latest.weight - earliest.weight : null,
      },
      bodyFat: {
        current: latest.bodyFat || null,
        start: earliest.bodyFat || null,
        change: latest.bodyFat && earliest.bodyFat ? latest.bodyFat - earliest.bodyFat : null,
      },
      muscle: {
        current: latest.muscle || null,
        start: earliest.muscle || null,
        change: latest.muscle && earliest.muscle ? latest.muscle - earliest.muscle : null,
      },
    };

    res.status(200).json({
      status: 'success',
      data: {
        stats,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

