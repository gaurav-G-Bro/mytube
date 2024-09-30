import { Router } from 'express';
import {
  subscribeToChannel,
  getSubscribedChannels,
  getSubscribedToOtherChannel,
} from '../controllers/subscription.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.route('/c/:channelId').post(verifyToken, subscribeToChannel);

router.route('/c/:channelId').get(verifyToken, getSubscribedChannels);

router.route('/u/:subscriberId').get(verifyToken, getSubscribedToOtherChannel);

export default router;
