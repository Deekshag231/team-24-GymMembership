import express from 'express';
import { checkIn, getMyCheckIns } from '../controllers/checkInController';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import Joi from 'joi';

const router = express.Router();

const checkInSchema = Joi.object({
  location: Joi.string().optional(),
});

router.use(protect);

router.post('/', validate(checkInSchema), checkIn);
router.get('/', getMyCheckIns);

export default router;

