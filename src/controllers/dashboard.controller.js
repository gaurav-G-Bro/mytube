import mongoose from 'mongoose';
import { Video } from '../models/video.model.js';
import { User } from '../models/user.model.js';
import { Subscription } from '../models/subscription.model.js';
import { Like } from '../models/like.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const getChannelStats = asyncHandler(async (req, res) => {
  try {
    if (!req.user) throw new ApiError(400, 'user not logged in');

    const videoStats = await Video.aggregate([
      {
        $match: { owner: req.user._id },
      },
      {
        $group: {
          _id: '$owner',
          totalViews: { $sum: '$views' },
          totalVideos: { $sum: 1 },
        },
      },
    ]);

    const stats =
      videoStats.length > 0
        ? videoStats[0]
        : {
            totalViews: 0,
            totalVideos: 0,
          };

    const videos = await Video.find({ owner: req.user._id }).select('_id');
    const videoIds = videos.map((video) => video._id);

    const totalLikes = await Like.countDocuments({ video: { $in: videoIds } });
    const user = await User.findById(req.user._id).select('subscribers');
    const totalSubscribers = user.subscribers ? user.subscribers.length : 0;

    res.status(200).json(
      new ApiResponse(200, 'Channel status fetched successfully', {
        totalViews: stats.totalViews,
        totalLikes,
        totalVideos: stats.totalVideos,
        totalSubscribers: totalSubscribers,
      })
    );
  } catch (error) {
    throw new ApiError(error.statusCode, error.message);
  }
});

const getChannelVideos = asyncHandler(async (req, res) => {
  try {
    if (!req.user) throw new ApiError(400, 'user not logged in');
    const videos = await Video.find({
      owner: req.user._id,
    });

    const videosStatus =
      !videos.length > 0 ? 'No video available' : 'Videos fetched successfully';
    return res.status(200).json(new ApiResponse(200, videosStatus, videos));
  } catch (error) {
    throw new ApiError(error.statusCode, error.message);
  }
});

export { getChannelStats, getChannelVideos };
