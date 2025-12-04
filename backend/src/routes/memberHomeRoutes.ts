import express from 'express';
import { getMemberHomeData } from '../controllers/memberHomeController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);
router.get('/', getMemberHomeData);

export default router;

