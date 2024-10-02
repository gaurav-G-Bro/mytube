import mongoose from 'mongoose';
import { Tweet } from '../models/tweet.model.js';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  try {
    if (!req.user) throw new ApiError(400, 'user not logged in');
    if (!content || content.trim() === '')
      throw new ApiError(400, 'content is required');

    const createContent = await Tweet.create({
      content,
      owner: req.user._id,
    });

    if (!createContent) throw new ApiError(500, 'failed to tweet');

    return res
      .status(200)
      .json(new ApiResponse(200, 'tweet successful', createContent));
  } catch (error) {
    throw new ApiError(error.statusCode, error.message);
  }
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  try {
    if (!req.user) throw new ApiError(400, 'user not logged in');

    if (!userId || userId.trim() === '')
      throw new ApiError(400, 'Invalid user Id');

    const existingTweet = await Tweet.find({
      owner: userId,
    });

    if (!existingTweet)
      throw new ApiError(404, 'tweet does not exist or removed');

    const tweetStatus =
      !existingTweet.length > 0
        ? 'no tweet found'
        : 'tweet fetched successfully';

    return res
      .status(200)
      .json(new ApiResponse(200, tweetStatus, existingTweet));
  } catch (error) {
    throw new ApiError(error.statusCode, error.message);
  }
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;
  try {
    if (!req.user) throw new ApiError(400, 'user not logged in');

    if (!tweetId || tweetId.trim() === '')
      throw new ApiError(400, 'Invalid tweetId');

    if (!content || content.trim() === '')
      throw new ApiError(400, 'content is required');

    const existingTweet = await Tweet.find({
      tweetId,
      owner: req.user._id,
    });

    if (!existingTweet)
      throw new ApiError(401, 'you are not authorized to update it');

    const updateTweet = await Tweet.findByIdAndUpdate(
      tweetId,
      {
        content,
      },
      { new: true }
    );

    if (!updateTweet)
      throw new ApiError(404, 'tweet does not exist or removed');

    return res
      .status(200)
      .json(new ApiResponse(200, 'tweet updated successfully', updateTweet));
  } catch (error) {
    throw new ApiError(error.statusCode, error.message);
  }
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  try {
    if (!req.user) throw new ApiError(400, 'user not logged in');
    if (!tweetId || tweetId.trim() === '')
      throw new ApiError(400, 'Invalid tweetId');

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) throw new ApiError(404, 'tweet does not exist or removed');

    if (tweet.owner.toString() !== req.user._id.toString())
      throw new ApiError(401, 'you are not authorized to delete this tweet');

    const deleteStatus = await Tweet.findByIdAndDelete(tweetId);
    if (!deleteStatus)
      throw new ApiError(500, 'something went wrong while deleting the tweet');
    return res
      .status(200)
      .json(new ApiResponse(200, 'tweet deleted successfully'));
  } catch (error) {
    throw new ApiError(error.statusCode, error.message);
  }
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
