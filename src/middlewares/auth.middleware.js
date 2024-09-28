import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';

const verifyToken = async (req, res, next) => {
  try {
    const incomingToken =
      req.cookies?.accessToken ||
      req.header('Authorization')?.replace('Bearer ', '');

    if (!incomingToken) {
      throw new ApiError(400, 'Token missing or invalid');
    }

    const decodeToken = await jwt.verify(
      incomingToken,
      process.env.ACCESS_TOKEN_SECRET
    );

    if (!decodeToken) {
      throw new ApiError(401, 'Invalid or expired token');
    }

    const user = await User.findById(decodeToken._id).select(
      '-password -refreshToken'
    );

    if (!user) {
      throw new ApiError(401, 'User not found, possibly logged out');
    }

    req.user = user;
    next();
  } catch (error) {
    next();
  }
};

export { verifyToken };
