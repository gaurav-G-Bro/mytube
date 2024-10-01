import { Router } from 'express';
import {
  deleteVideo,
  getAllVideos,
  getVideoById,
  publishAVideo,
  togglePublishStatus,
  updateVideoThumbnail,
} from '../controllers/video.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.upload.js';

const router = Router();

router
  .route('/')
  .get(verifyToken, getAllVideos)
  .post(
    verifyToken,
    upload.fields([
      {
        name: 'videoFile',
        maxCount: 1,
      },
      {
        name: 'thumbnail',
        maxCount: 1,
      },
    ]),
    publishAVideo
  );

router
  .route('/:videoId')
  .get(verifyToken, getVideoById)
  .delete(verifyToken, deleteVideo)
  .patch(verifyToken, upload.single('thumbnail'), updateVideoThumbnail);

router
  .route('/toggle/publish/:videoId')
  .patch(verifyToken, togglePublishStatus);

export default router;
