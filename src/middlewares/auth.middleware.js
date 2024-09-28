import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';

const verfifyToken = async (req, res, next) => {
  const incomingToken =
    req.cookies?.accessToken ||
    req.header('Authorization')?.replace('Bearer ', '');

  if (!incomingToken) throw new ApiError(400, 'Invalid token');

  const decodeToken = await jwt.verify(
    incomingToken,
    process.env.ACCESS_TOKEN_SECRET
  );
  if (!decodeToken) throw new ApiError(401, 'Unauthorized request');

  const user = await User.findById(decodeToken._id).select(
    '-password -refreshToken'
  );
  req.user = user;

  next();
};

export { verfifyToken };
