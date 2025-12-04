import { Response, NextFunction } from 'express';
import Session from '../models/Session';
import Booking from '../models/Booking';
import { AuthRequest } from '../middleware/auth';

export const getAvailableSessions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { date } = req.query;
    const query: any = {
      status: 'scheduled',
      date: date ? { $gte: new Date(date as string) } : { $gte: new Date() },
    };

    const sessions = await Session.find(query)
      .populate('trainer', 'name email')
      .sort({ date: 1, time: 1 });

    const sessionsWithAvailability = await Promise.all(
      sessions.map(async (session) => {
        const bookings = await Booking.countDocuments({
          session: session._id,
          status: 'confirmed',
        });
        return {
          ...session.toObject(),
          spots: session.maxSpots - bookings,
          bookedSpots: bookings,
        };
      })
    );

    res.status(200).json({
      status: 'success',
      results: sessionsWithAvailability.length,
      data: {
        sessions: sessionsWithAvailability,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

export const getMyBookings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const bookings = await Booking.find({ member: req.user?._id })
      .populate({
        path: 'session',
        populate: {
          path: 'trainer',
          select: 'name email',
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: bookings.length,
      data: {
        bookings,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

export const bookSession = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { sessionId } = req.body;

    const session = await Session.findById(sessionId);
    if (!session) {
      res.status(404).json({
        status: 'fail',
        message: 'Session not found',
      });
      return;
    }

    // Check if already booked
    const existingBooking = await Booking.findOne({
      member: req.user?._id,
      session: sessionId,
      status: 'confirmed',
    });

    if (existingBooking) {
      res.status(400).json({
        status: 'fail',
        message: 'You have already booked this session',
      });
      return;
    }

    // Check availability
    const bookings = await Booking.countDocuments({
      session: sessionId,
      status: 'confirmed',
    });

    if (bookings >= session.maxSpots) {
      res.status(400).json({
        status: 'fail',
        message: 'Session is fully booked',
      });
      return;
    }

    const booking = await Booking.create({
      member: req.user?._id,
      session: sessionId,
      status: 'confirmed',
    });

    await Session.findByIdAndUpdate(sessionId, {
      $push: { bookings: booking._id },
      $inc: { bookedSpots: 1 },
    });

    res.status(201).json({
      status: 'success',
      data: {
        booking,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

export const cancelBooking = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const booking = await Booking.findOneAndUpdate(
      {
        _id: req.params.id,
        member: req.user?._id,
        status: 'confirmed',
      },
      { status: 'cancelled' },
      { new: true }
    );

    if (!booking) {
      res.status(404).json({
        status: 'fail',
        message: 'Booking not found',
      });
      return;
    }

    await Session.findByIdAndUpdate(booking.session, {
      $inc: { bookedSpots: -1 },
    });

    res.status(200).json({
      status: 'success',
      data: {
        booking,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

export const createSession = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const session = await Session.create({
      ...req.body,
      trainer: req.user?._id,
      bookedSpots: 0,
    });

    res.status(201).json({
      status: 'success',
      data: {
        session,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

export const getTrainerSessions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { date } = req.query;
    const query: any = {
      trainer: req.user?._id,
    };

    if (date) {
      query.date = date;
    }

    const sessions = await Session.find(query)
      .populate('trainer', 'name email')
      .sort({ date: 1, time: 1 });

    const sessionsWithBookings = await Promise.all(
      sessions.map(async (session) => {
        const bookings = await Booking.find({
          session: session._id,
          status: 'confirmed',
        }).populate('member', 'name email');
        return {
          ...session.toObject(),
          bookings,
        };
      })
    );

    res.status(200).json({
      status: 'success',
      results: sessionsWithBookings.length,
      data: {
        sessions: sessionsWithBookings,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

export const updateSession = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const session = await Session.findOneAndUpdate(
      { _id: req.params.id, trainer: req.user?._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!session) {
      res.status(404).json({
        status: 'fail',
        message: 'Session not found',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: {
        session,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

export const deleteSession = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await Session.findOneAndDelete({ _id: req.params.id, trainer: req.user?._id });

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

