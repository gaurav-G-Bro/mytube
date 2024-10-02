import { Router } from 'express';
import {
  addVideoToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getUserPlaylists,
  removeVideoFromPlaylist,
  updatePlaylist,
} from '../controllers/playlist.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.route('/').post(verifyToken, createPlaylist);

router
  .route('/:playlistId')
  .get(verifyToken, getPlaylistById)
  .patch(verifyToken, updatePlaylist)
  .delete(verifyToken, deletePlaylist);

router
  .route('/add/:videoId/:playlistId')
  .patch(verifyToken, addVideoToPlaylist);
router
  .route('/remove/:videoId/:playlistId')
  .patch(verifyToken, removeVideoFromPlaylist);

router.route('/user/:userId').get(verifyToken, getUserPlaylists);

export default router;
