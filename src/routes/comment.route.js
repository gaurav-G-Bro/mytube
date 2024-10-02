import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import {
  getVideoComments,
  addComment,
  deleteComment,
  updateComment,
} from '../controllers/comment.controller.js';

const router = Router();

router
  .route('/:videoId')
  .get(verifyToken, getVideoComments)
  .post(verifyToken, addComment);
router
  .route('/c/:commentId')
  .delete(verifyToken, deleteComment)
  .patch(verifyToken, updateComment);

export default router;
