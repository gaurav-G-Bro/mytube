import { Router } from 'express';
import {
  getLikedVideos,
  toggleCommentLike,
  toggleVideoLike,
  toggleTweetLike,
} from '../controllers/like.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();
router.use(verifyToken);

router.route('/toggle/v/:videoId').post(toggleVideoLike);
router.route('/toggle/c/:commentId').post(toggleCommentLike);
router.route('/toggle/t/:tweetId').post(toggleTweetLike);
router.route('/videos').get(getLikedVideos);

export default router;
