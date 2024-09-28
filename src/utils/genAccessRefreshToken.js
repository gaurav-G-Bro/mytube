import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';

const generateAccessTokenAndRefreshToken = async (userId) => {
  if (!userId) throw new ApiError(500, 'UserId is required');
  const user = await User.findById(userId);
  if (!user) throw new ApiError(400, 'Invalid credentials');
  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

export { generateAccessTokenAndRefreshToken };
