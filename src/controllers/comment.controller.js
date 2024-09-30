import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { Comment } from '../models/comment.model.js';

const getVideoComments = asyncHandler(async (req, res) => {
  try {
    return res.status(200).json(new ApiResponse(200, 'ok'));
  } catch (error) {
    throw new ApiError(error.statusCode, error.message);
  }
});

const addComment = asyncHandler(async (req, res) => {
  try {
    return res.status(200).json(new ApiResponse(200, 'ok'));
  } catch (error) {
    throw new ApiError(error.statusCode, error.message);
  }
});

const deleteComment = asyncHandler(async (req, res) => {
  try {
    return res.status(200).json(new ApiResponse(200, 'ok'));
  } catch (error) {
    throw new ApiError(error.statusCode, error.message);
  }
});

const updateComment = asyncHandler(async (req, res) => {
  try {
    return res.status(200).json(new ApiResponse(200, 'ok'));
  } catch (error) {
    throw new ApiError(error.statusCode, error.message);
  }
});
export { getVideoComments, addComment, deleteComment, updateComment };
