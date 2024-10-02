import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { Comment } from '../models/comment.model.js';
import mongoose from 'mongoose';

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  try {
    if (!req.user) throw new ApiError(400, 'user not logged in');

    if (!videoId || videoId.trim() === '')
      throw new ApiError(400, 'Invalid video Id');

    const vidsComments = await Comment.find({
      video: videoId,
      owner: req.user._id,
    });

    const vidsCommentsStatus =
      !vidsComments.length > 0
        ? 'no comment found on video'
        : 'comments fetched successfully';

    return res
      .status(200)
      .json(new ApiResponse(200, vidsCommentsStatus, vidsComments));
  } catch (error) {
    throw new ApiError(error.statusCode, error.message);
  }
});

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;
  try {
    if (!req.user) throw new ApiError(400, 'user not logged in');

    if (!videoId || videoId.trim() === '')
      throw new ApiError(400, 'Invalid video Id');

    if (content.trim() === '')
      throw new ApiError(400, 'can not send empty comment');

    const addVidsComments = await Comment.create({
      video: videoId,
      owner: req.user._id,
      content,
    });

    if (!addVidsComments) throw new ApiError(500, 'failed to comment on video');

    return res
      .status(200)
      .json(
        new ApiResponse(200, 'comment added successfully', addVidsComments)
      );
  } catch (error) {
    throw new ApiError(error.statusCode, error.message);
  }
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  try {
    if (!req.user) throw new ApiError(400, 'user not logged in');
    if (!commentId || commentId.trim() === '')
      throw new ApiError(400, 'Invalid comment id');

    const comment = await Comment.findById(commentId);

    if (!comment) throw new ApiError(404, 'comment does not exist or removed');

    if (comment.owner.toString() !== req.user._id.toString())
      throw new ApiError(401, 'you are not authorized to delete this comment');

    await Comment.findByIdAndDelete(commentId);

    return res
      .status(200)
      .json(new ApiResponse(200, 'comment deleted successfully'));
  } catch (error) {
    throw new ApiError(error.statusCode, error.message);
  }
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  try {
    if (!req.user) throw new ApiError(400, 'user not logged in');
    if (!commentId || commentId.trim() === '')
      throw new ApiError(400, 'Invalid comment id');
    if (!content || content.trim() === '')
      throw new ApiError(400, 'content is required');

    const comment = await Comment.findById(commentId);
    if (!comment) throw new ApiError(404, 'comment does not exist or removed');

    if (comment.owner.toString() !== req.user._id.toString())
      throw new ApiError(401, 'you are not authorized to update this comment');

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      {
        $set: {
          content,
        },
      },
      { new: true }
    );

    if (!updatedComment)
      throw new ApiError(500, 'failed to update the comment');
    return res
      .status(200)
      .json(
        new ApiResponse(200, 'comment updated successfully', updatedComment)
      );
  } catch (error) {
    throw new ApiError(error.statusCode, error.message);
  }
});

export { getVideoComments, addComment, deleteComment, updateComment };
