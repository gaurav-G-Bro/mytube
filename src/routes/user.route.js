import { Router } from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
} from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.upload.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.route('/register').post(
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 },
  ]),
  registerUser
);
router.route('/login').post(loginUser);
router.route('/logout').post(verifyToken, logoutUser);
router.route('/refresh-token').post(verifyToken, refreshAccessToken);
router.route('/change-password').patch(verifyToken, changeCurrentPassword);
router.route('/current-user').get(verifyToken, getCurrentUser);
router.route('/update-account').patch(verifyToken, updateAccountDetails);
router
  .route('/update-avatar')
  .patch(verifyToken, upload.single('avatar'), updateUserAvatar);

export default router;
