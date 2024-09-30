import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { Subscription } from '../models/subscription.model.js';
import { User } from '../models/user.model.js';
import mongoose from 'mongoose';

const subscribeToChannel = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const userId = req.user?._id;
  try {
    if (!channelId || channelId.trim() === '')
      throw new ApiError(400, 'channel Id is required');
    if (!userId) throw new ApiError(400, 'user not logged in');

    const existingSubscription = await Subscription.findOne({
      channel: channelId,
      subscriber: userId,
    });

    if (existingSubscription) {
      await Subscription.findByIdAndDelete(existingSubscription._id);
      return res
        .status(200)
        .json(new ApiResponse(200, 'Unsubscribed successfully'));
    }

    const subscribed = await Subscription.create({
      channel: channelId,
      subscriber: userId,
    });

    if (!subscribed) throw new ApiError(500, 'failed to subscribe the channel');

    subscribed.status =
      subscribed.status === 'unsubscribed' ? 'subscribed' : 'unsubscribed';

    await subscribed.save();
    return res
      .status(200)
      .json(new ApiResponse(200, 'subscribed successfully', subscribed));
  } catch (error) {
    throw new ApiError(error.statusCode, error.message);
  }
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  try {
    if (!channelId || channelId.trim() === '')
      throw new ApiError(400, 'channel does not exist');

    const channel = await Subscription.aggregate([
      {
        $match: {
          channel: new mongoose.Types.ObjectId(channelId),
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'subscriber',
          foreignField: '_id',
          as: 'userdetails',
        },
      },
      {
        $unwind: '$userdetails',
      },
      {
        $group: {
          _id: '$channel',
          channelSubscribersCount: {
            $sum: 1,
          },
          users: {
            $push: {
              name: '$userdetails.fullName',
              email: '$userdetails.email',
              avatar: '$userdetails.avatar',
            },
          },
        },
      },
      {
        $project: {
          users: 1,
          channelSubscribersCount: 1,
        },
      },
    ]);

    return res
      .status(200)
      .json(new ApiResponse(200, 'subscibers fetched successfully', channel));
  } catch (error) {
    throw new ApiError(error.statusCode, error.message);
  }
});

const getSubscribedToOtherChannel = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  const userId = req.user?._id;
  try {
    if (!subscriberId || subscriberId.trim() === '')
      throw new ApiError(400, 'subscriber Id is required');

    if (!userId) throw new ApiError(400, 'user not logged in');

    const subscriberDetails = await Subscription.aggregate([
      {
        $match: {
          subscriber: new mongoose.Types.ObjectId(subscriberId),
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'subscriber',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      {
        $unwind: '$userDetails',
      },
      {
        $group: {
          _id: '$subscriber',
          subscribedToCount: {
            $sum: 1,
          },
          users: {
            $push: {
              name: '$userDetails.fullName',
              email: '$userDetails.email',
              avatar: '$userDetails.avatar',
            },
          },
        },
      },
      {
        $project: {
          users: 1,
          subscribedToCount: 1,
        },
      },
    ]);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          'subscribed to other channel counts fetched successfully',
          subscriberDetails
        )
      );
  } catch (error) {
    throw new ApiError(error.statusCode, error.message);
  }
});

export {
  subscribeToChannel,
  getSubscribedChannels,
  getSubscribedToOtherChannel,
};
