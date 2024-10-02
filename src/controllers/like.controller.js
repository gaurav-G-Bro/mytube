import mongoose, { isValidObjectId } from 'mongoose';
import { Like } from '../models/like.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  try {
    if (!req.user || req.user === undefined)
      throw new ApiError(400, 'user not logged in');

    if (!videoId || videoId.trim() === '')
      throw new ApiError(400, 'Invalid video Id');

    const existingLike = await Like.findOne({
      video: videoId,
      likedBy: req.user._id,
    });

    if (existingLike) {
      await Like.findByIdAndDelete(existingLike._id);
      return res
        .status(200)
        .json(new ApiResponse(200, 'Video unliked successfully'));
    }

    const newLike = await Like.create({
      video: videoId,
      likedBy: req.user._id,
    });

    if (!newLike) throw new ApiError(500, 'failed to like the video');
    return res
      .status(200)
      .json(new ApiResponse(200, 'video liked successfully', newLike));
  } catch (error) {
    throw new ApiError(error.statusCode, error.message);
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  try {
    if (!commentId || commentId.trim() === '')
      throw new ApiError(400, 'Invalid comment Id');
    if (!req.user) throw new ApiError(400, 'user not logged in');

    const existingCommentLike = await Like.find({
      comment: commentId,
      likedBy: req.user._id,
    });

    if (existingCommentLike) {
      await Like.findByIdAndDelete(existingCommentLike._id);
      return res
        .status(200)
        .json(new ApiResponse(200, 'comment unliked successfully'));
    }

    const createCommentLike = await Like.create({
      comment: commentId,
      likedBy: req.user._id,
    });

    if (!createCommentLike)
      throw new ApiError(500, 'failed to like the comment');

    return res
      .status(200)
      .json(
        new ApiResponse(200, 'comment liked successfully', createCommentLike)
      );
  } catch (error) {
    throw new ApiError(error.statusCode, error.message);
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  try {
    if (!tweetId || tweetId.trim() === '')
      throw new ApiError(400, 'Invalid tweet Id');
    if (!req.user) throw new ApiError(400, 'user not logged in');

    const existingTweetLike = await Like.find({
      tweet: tweetId,
      likedBy: req.user._id,
    });

    if (existingTweetLike) {
      await Like.findByIdAndDelete(existingTweetLike._id);
      return res
        .status(200)
        .json(new ApiResponse(200, 'tweet unliked successfully'));
    }

    const createTweetLike = await Like.create({
      tweet: tweetId,
      likedBy: req.user._id,
    });

    if (!createTweetLike) throw new ApiError(500, 'failed to like the tweet');

    return res
      .status(200)
      .json(new ApiResponse(200, 'tweet liked successfully', createTweetLike));
  } catch (error) {
    throw new ApiError(error.statusCode, error.message);
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  try {
    if (!req.user) throw new ApiError(400, 'user not logged in');

    const likedVids = await Like.find();

    const likedVidsStatus =
      !likedVids.length > 0
        ? 'no liked videos found'
        : 'liked videos fetched successfully';

    const totalLikedVideosCount = await Like.countDocuments({
      likedBy: req.user._id,
    });

    // const totalLikedVideosCount = await Like.aggregate([
    //   {
    //     $group: {
    //       _id: 'likedBy',
    //       totalLikedVideos: {
    //         $sum: 1,
    //       },
    //     },
    //   },
    // ]);

    return res.status(200).json(
      new ApiResponse(200, likedVidsStatus, {
        likedVideos: likedVids,
        totalLikedVideosCount,
      })
    );
  } catch (error) {
    throw new ApiError(error.statusCode, error.message);
  }
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
