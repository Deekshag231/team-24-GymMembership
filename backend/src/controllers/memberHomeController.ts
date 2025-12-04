import { Response, NextFunction } from 'express';
import Membership from '../models/Membership';
import Workout from '../models/Workout';
import CheckIn from '../models/CheckIn';
import Booking from '../models/Booking';
import { AuthRequest } from '../middleware/auth';

export const getMemberHomeData = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const memberId = req.user?._id;

    // Get membership
    const membership = await Membership.findOne({ member: memberId })
      .sort({ createdAt: -1 });

    // Calculate days remaining
    let daysRemaining = 0;
    if (membership && membership.endDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endDate = new Date(membership.endDate);
      endDate.setHours(0, 0, 0, 0);
      daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    }

    // Get today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Calculate streak
    const recentCheckIns = await CheckIn.find({ member: memberId })
      .sort({ checkInTime: -1 })
      .limit(30);

    let streak = 0;
    const checkInDates = recentCheckIns.map((ci) => {
      const date = new Date(ci.checkInTime);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    });

    const todayTime = today.getTime();
    for (let i = 0; i < checkInDates.length; i++) {
      const expectedDate = todayTime - i * 24 * 60 * 60 * 1000;
      if (checkInDates.includes(expectedDate)) {
        streak++;
      } else {
        break;
      }
    }

    // Workouts this week
    const startOfWeek = new Date(today);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const workoutsThisWeek = await Workout.countDocuments({
      member: memberId,
      date: { $gte: startOfWeek },
    });

    // Today's workout stats
    const todayWorkout = await Workout.findOne({
      member: memberId,
      date: { $gte: today, $lt: tomorrow },
    });

    const caloriesBurned = todayWorkout?.caloriesBurned || 0;
    const minutesExercised = todayWorkout?.duration || 0;

    // Upcoming sessions
    const upcomingBookings = await Booking.find({
      member: memberId,
      status: 'confirmed',
    })
      .populate({
        path: 'session',
        populate: {
          path: 'trainer',
          select: 'name',
        },
      })
      .sort({ createdAt: 1 })
      .limit(5);

    const upcomingSessions = upcomingBookings.map((booking: any) => ({
      id: booking._id,
      title: booking.session?.type || 'Session',
      time: booking.session?.time || '',
      trainer: booking.session?.trainer?.name || 'Trainer',
      date: booking.session?.date || new Date(),
    }));

    res.status(200).json({
      status: 'success',
      data: {
        membership: {
          plan: membership?.planType || 'N/A',
          startDate: membership?.startDate || null,
          endDate: membership?.endDate || null,
          daysRemaining,
          status: membership?.status || 'expired',
        },
        todayStats: {
          streak,
          workoutsThisWeek,
          caloriesBurned,
          minutesExercised,
        },
        upcomingSessions,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

