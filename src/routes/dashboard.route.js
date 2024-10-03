import { Router } from 'express';
import {
  getChannelStats,
  getChannelVideos,
} from '../controllers/dashboard.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.route('/stats').get(verifyToken, getChannelStats);
router.route('/videos').get(verifyToken, getChannelVideos);

export default router;
