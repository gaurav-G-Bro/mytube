import { Router } from 'express';
import {
  createTweet,
  deleteTweet,
  getUserTweets,
  updateTweet,
} from '../controllers/tweet.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();
router.use(verifyToken);

router.route('/').post(createTweet);
router.route('/user/:userId').get(getUserTweets);
router.route('/:tweetId').patch(updateTweet).delete(deleteTweet);

export default router;
