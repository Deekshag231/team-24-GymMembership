import express from 'express';
import {
  getAllMembers,
  getMember,
  createMember,
  updateMember,
  deleteMember,
} from '../controllers/memberController';
import { protect, restrictTo } from '../middleware/auth';
import { validate } from '../middleware/validate';
import Joi from 'joi';

const router = express.Router();

const createMemberSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).optional(),
  phone: Joi.string().optional(),
  planType: Joi.string().optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  price: Joi.number().optional(),
});

const updateMemberSchema = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().optional(),
});

router.use(protect);

router.get('/', restrictTo('admin'), getAllMembers);
router.get('/:id', restrictTo('admin'), getMember);
router.post('/', restrictTo('admin'), validate(createMemberSchema), createMember);
router.patch('/:id', restrictTo('admin'), validate(updateMemberSchema), updateMember);
router.delete('/:id', restrictTo('admin'), deleteMember);

export default router;

