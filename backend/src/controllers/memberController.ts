import { Response, NextFunction } from 'express';
import User from '../models/User';
import Membership from '../models/Membership';
import CheckIn from '../models/CheckIn';
import { AuthRequest } from '../middleware/auth';

export const getAllMembers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status, search } = req.query;
    const query: any = { role: 'member' };

    if (status && status !== 'all') {
      // Get members with specific membership status
      const memberships = await Membership.find({ status });
      const memberIds = memberships.map((m) => m.member);
      query._id = { $in: memberIds };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const members = await User.find(query);

    // Get membership info for each member
    const membersWithMembership = await Promise.all(
      members.map(async (member) => {
        const membership = await Membership.findOne({ member: member._id })
          .sort({ createdAt: -1 })
          .limit(1);
        const lastCheckIn = await CheckIn.findOne({ member: member._id })
          .sort({ checkInTime: -1 })
          .limit(1);

        return {
          id: member._id,
          name: member.name,
          email: member.email,
          phone: member.phone,
          plan: membership?.planType || 'N/A',
          status: membership?.status || 'expired',
          joinDate: membership?.startDate || member.createdAt,
          expiryDate: membership?.endDate,
          lastCheckIn: lastCheckIn?.checkInTime || null,
        };
      })
    );

    res.status(200).json({
      status: 'success',
      results: membersWithMembership.length,
      data: {
        members: membersWithMembership,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

export const getMember = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const member = await User.findById(req.params.id);
    if (!member || member.role !== 'member') {
      res.status(404).json({
        status: 'fail',
        message: 'Member not found',
      });
      return;
    }

    const membership = await Membership.findOne({ member: member._id })
      .sort({ createdAt: -1 })
      .limit(1);

    res.status(200).json({
      status: 'success',
      data: {
        member: {
          ...member.toObject(),
          membership,
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

export const createMember = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, phone, planType, startDate, endDate, price } = req.body;

    const user = await User.create({
      name,
      email,
      password: password || 'password123',
      phone,
      role: 'member',
    });

    if (planType) {
      await Membership.create({
        member: user._id,
        planType,
        startDate: startDate || new Date(),
        endDate: endDate || new Date(),
        price: price || 0,
        status: 'active',
      });
    }

    res.status(201).json({
      status: 'success',
      data: {
        member: user,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

export const updateMember = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const member = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!member) {
      res.status(404).json({
        status: 'fail',
        message: 'Member not found',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: {
        member,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

export const deleteMember = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await User.findByIdAndDelete(req.params.id);

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

