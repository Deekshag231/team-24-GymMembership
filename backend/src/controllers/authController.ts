import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

const signToken = (id: string): string => {
  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn: config.jwtExpire,
  });
};

export const register = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, phone, role } = req.body;

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || 'member',
    });

    const token = signToken(user._id.toString());

    res.status(201).json({
      status: 'success',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({
        status: 'fail',
        message: 'Email already exists',
      });
      return;
    }
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

export const login = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        status: 'fail',
        message: 'Please provide email and password',
      });
      return;
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({
        status: 'fail',
        message: 'Incorrect email or password',
      });
      return;
    }

    const token = signToken(user._id.toString());

    res.status(200).json({
      status: 'success',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
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

export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id);

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

