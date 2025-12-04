import express from 'express';
import { register, login, getMe } from '../controllers/authController';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import Joi from 'joi';

const router = express.Router();

const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().optional(),
  role: Joi.string().valid('member', 'admin', 'trainer').optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', protect, getMe);

export default router;

