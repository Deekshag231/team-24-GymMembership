import { Response, NextFunction } from 'express';
import User from '../models/User';
import Booking from '../models/Booking';
import Workout from '../models/Workout';
import Progress from '../models/Progress';
import { AuthRequest } from '../middleware/auth';

export const getTrainerClients = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get all bookings for sessions created by this trainer
    const Session = require('../models/Session').default;
    const sessions = await Session.find({ trainer: req.user?._id });
    const sessionIds = sessions.map((s: any) => s._id);

    const bookings = await Booking.find({
      session: { $in: sessionIds },
      status: 'confirmed',
    }).populate('member', 'name email phone');

    // Get unique members
    const memberMap = new Map();
    bookings.forEach((booking: any) => {
      const memberId = booking.member._id.toString();
      if (!memberMap.has(memberId)) {
        memberMap.set(memberId, {
          id: memberId,
          name: booking.member.name,
          email: booking.member.email,
          phone: booking.member.phone,
          sessionsCompleted: 0,
          totalSessions: 0,
          lastSession: null,
          streak: 0,
        });
      }
    });

    // Calculate stats for each client
    const clients = Array.from(memberMap.values());
    for (const client of clients) {
      const clientBookings = bookings.filter(
        (b: any) => b.member._id.toString() === client.id
      );
      client.totalSessions = clientBookings.length;
      client.sessionsCompleted = clientBookings.filter(
        (b: any) => b.status === 'completed'
      ).length;

      if (clientBookings.length > 0) {
        const lastBooking = clientBookings.sort(
          (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];
        client.lastSession = lastBooking.createdAt;
      }

      // Get workouts for streak calculation
      const workouts = await Workout.find({ member: client.id })
        .sort({ date: -1 })
        .limit(30);
      
      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      for (let i = 0; i < workouts.length; i++) {
        const workoutDate = new Date(workouts[i].date);
        workoutDate.setHours(0, 0, 0, 0);
        const daysDiff = Math.floor((today.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff === i) {
          streak++;
        } else {
          break;
        }
      }
      client.streak = streak;
    }

    res.status(200).json({
      status: 'success',
      results: clients.length,
      data: {
        clients,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

