import express from 'express';
import {
  getMyProgress,
  createProgress,
  getProgressStats,
} from '../controllers/progressController';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import Joi from 'joi';

const router = express.Router();

const progressSchema = Joi.object({
  date: Joi.date().optional(),
  weight: Joi.number().min(0).optional(),
  bodyFat: Joi.number().min(0).max(100).optional(),
  muscle: Joi.number().min(0).optional(),
  chest: Joi.number().min(0).optional(),
  waist: Joi.number().min(0).optional(),
  arms: Joi.number().min(0).optional(),
  notes: Joi.string().optional(),
});

router.use(protect);

router.get('/stats', getProgressStats);
router.get('/', getMyProgress);
router.post('/', validate(progressSchema), createProgress);

export default router;

