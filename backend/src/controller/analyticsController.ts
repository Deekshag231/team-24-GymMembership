import { Response, NextFunction } from 'express';
import Membership from '../models/Membership';
import Payment from '../models/Payment';
import CheckIn from '../models/CheckIn';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

export const getDashboardStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Active members
    const activeMemberships = await Membership.countDocuments({ status: 'active' });

    // Expiring this month
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const expiringMemberships = await Membership.countDocuments({
      status: 'active',
      endDate: { $gte: today, $lte: endOfMonth },
    });

    // Today's revenue
    const todayPayments = await Payment.aggregate([
      {
        $match: {
          paymentDate: { $gte: today, $lt: tomorrow },
          status: 'completed',
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);
    const todayRevenue = todayPayments[0]?.total || 0;

    // Today's check-ins
    const todayCheckIns = await CheckIn.countDocuments({
      checkInTime: { $gte: today, $lt: tomorrow },
    });

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          activeMembers: activeMemberships,
          expiringThisMonth: expiringMemberships,
          todayRevenue,
          todayCheckIns,
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

export const getRevenueAnalytics = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { months = 6 } = req.query;
    const monthsNum = Number(months);

    // Monthly revenue
    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          paymentDate: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - monthsNum)),
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$paymentDate' },
            month: { $month: '$paymentDate' },
          },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    // Plan distribution
    const planDistribution = await Membership.aggregate([
      {
        $group: {
          _id: '$planType',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        monthlyRevenue,
        planDistribution,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

