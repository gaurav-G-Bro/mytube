import { Router } from 'express';
import {
  createTweet,
  deleteTweet,
  getUserTweets,
  updateTweet,
} from '../controllers/tweet.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.route('/').post(verifyToken, createTweet);
router.route('/user/:userId').get(verifyToken, getUserTweets);
router
  .route('/:tweetId')
  .patch(verifyToken, updateTweet)
  .delete(verifyToken, deleteTweet);

export default router;
