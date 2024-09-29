import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { uploadOnCloudinary } from '../utils/cloudinary.upload.js';
import { User } from '../models/user.model.js';
import { generateAccessTokenAndRefreshToken } from '../utils/genAccessRefreshToken.js';
import { OPTIONS_COOKIE } from '../constants/constant.js';
import mongoose from 'mongoose';

const registerUser = asyncHandler(async (req, res) => {
  try {
    const { username, email, fullName, password } = req.body;
    if (!username || !email) {
      throw new ApiError(400, 'username and email is required');
    }
    if (username?.trim() === '' || email?.trim() === '')
      throw new ApiError(400, 'Can not send empty spaces');

    if (!fullName || fullName?.trim() === '')
      throw new ApiError(400, 'fullname is requied');

    if (!password || password?.trim() === '')
      throw new ApiError(400, 'password is required');

    const existedUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existedUser)
      throw new ApiError(
        400,
        'User already registered using this email or username'
      );

    const avatarLocalPath = req.files?.avatar
      ? req.files.avatar[0]?.path
      : null;
    if (!avatarLocalPath) throw new ApiError(400, 'avatar file is required');

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const avatarUrl = avatar?.url;

    if (!avatarUrl)
      throw new ApiError(
        500,
        'something went wrong while uploading the file, please try again'
      );

    const coverImageLocalPath = req.files?.coverImage
      ? req.files.coverImage[0]?.path
      : null;

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    const coverImageUrl = coverImage?.url || '';
    if (!coverImageUrl) throw new ApiError(500, 'Failed to upload cover image');

    const userData = {
      username,
      fullName,
      email,
      password,
      avatar: avatarUrl,
      coverImage: coverImageUrl,
    };

    const user = await User.create(userData);
    if (!user) throw new ApiError(500, 'user not registered, please try again');

    const userDetails = await User.findById(user._id).select(
      '-password -refreshToken'
    );
    return res
      .status(200)
      .json(new ApiResponse(201, 'User registered successfully', userDetails));
  } catch (error) {
    throw new ApiError(error.statusCode, error.message);
  }
});

const loginUser = asyncHandler(async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || username?.trim() === '' || !email || email?.trim() === '')
      throw new ApiError(400, 'username and email is required');

    if (!password || password.trim() === '')
      throw new ApiError(400, 'password is required');

    const user = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (!user) throw new ApiError(404, 'user does not exist');

    if (
      (username && username !== user.username) ||
      (email && email !== user.email)
    )
      throw new ApiError(
        400,
        'Invalid credentials, please use own username and email'
      );

    const validUser = await user.isPasswordValid(password);
    if (!validUser) throw new ApiError(400, 'Invalid Credentials');

    const { accessToken, refreshToken } =
      await generateAccessTokenAndRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    const existedUser = await User.findById(user._id).select(
      '-password -refreshToken'
    );

    return res
      .status(200)
      .cookie('accessToken', accessToken, OPTIONS_COOKIE)
      .cookie('refreshToken', refreshToken, OPTIONS_COOKIE)
      .json(
        new ApiResponse(200, 'user logged in successfully', {
          user: existedUser,
          accessToken,
          refreshToken,
        })
      );
  } catch (error) {
    throw new ApiError(error.statusCode, error.message);
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  try {
    if (!req?.user) {
      return res
        .status(400)
        .clearCookie('accessToken', OPTIONS_COOKIE)
        .clearCookie('refreshToken', OPTIONS_COOKIE)
        .json(new ApiResponse(400, 'User already logged out'));
    }

    const userId = req.user._id;
    await User.findByIdAndUpdate(
      userId,
      {
        $unset: { refreshToken: 1 },
      },
      { new: true }
    );

    return res
      .status(200)
      .clearCookie('accessToken', OPTIONS_COOKIE)
      .clearCookie('refreshToken', OPTIONS_COOKIE)
      .json(new ApiResponse(200, 'user logged out successfully'));
  } catch (error) {
    throw new ApiError(error.statusCode, error.message);
  }
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    if (!req.user || req.user.length < 0)
      throw new ApiError(404, 'Please, login and try again');

    const { accessToken, refreshToken } =
      await generateAccessTokenAndRefreshToken(req.user?._id);
    req.user.refreshToken = refreshToken;

    return res
      .status(200)
      .cookie('accessToken', accessToken)
      .cookie('refreshToken', refreshToken)
      .json(
        new ApiResponse(200, {
          accessToken: accessToken,
          refreshToken: refreshToken,
        })
      );
  } catch (error) {
    throw new ApiError(error.statusCode, error.message);
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, confirmPassword, newPassword } = req.body;
  try {
    if (!req.user || req.user.length < 0)
      throw new ApiError(404, 'Please, login and try again');

    if (!oldPassword || oldPassword.trim() === '')
      throw new ApiError(400, 'old password is required');

    if (!newPassword || newPassword.trim() === '')
      throw new ApiError(400, 'New Password is required');

    if (!confirmPassword || confirmPassword.trim() === 0)
      throw new ApiError(400, 'confirm password is required');

    if (confirmPassword !== newPassword)
      throw new ApiError(
        400,
        'new password and confirm password must be same.'
      );

    const userId = req.user?._id;
    const user = await User.findById(userId);
    if (!user) throw new ApiError(500, 'user not logged in or registered');

    const validUser = await user.isPasswordValid(oldPassword);
    if (!validUser) throw new ApiError(400, 'Invalid old password');

    user.password = newPassword;
    await user.save();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { user: user._id },
          'password changed successfully'
        )
      );
  } catch (error) {
    throw new ApiError(error.statusCode, error.message);
  }
});

const getCurrentUser = asyncHandler(async (req, res) => {
  try {
    const user = req.user;
    if (!user) throw new ApiError(404, 'User not logged in');

    return res
      .status(200)
      .json(new ApiResponse(200, user, 'user fetched successfully'));
  } catch (error) {
    throw new ApiError(error.statusCode, error.message);
  }
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { username, email, fullName } = req.body;
  try {
    if (!req.user) throw new ApiError(404, 'user not logged in');

    if (!username || username.trim() === '')
      throw new ApiError(400, 'username is required');

    if (!email || email.trim() === '')
      throw new ApiError(400, 'email is required');

    if (!fullName || fullName.trim() === '')
      throw new ApiError(400, 'fullname is required');

    const userDetails = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          username,
          email,
          fullName,
        },
      },
      { new: true }
    ).select('-password -refreshToken -watchHistory');

    if (!userDetails) throw new ApiError(500, 'Failed to update user account');

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          'account details updated successfully',
          userDetails
        )
      );
  } catch (error) {
    console.log(error);
    throw new ApiError(error.statusCode, error.message);
  }
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  try {
    if (!req.user) throw new ApiError(400, 'user not logged in');

    if (!req.file) throw new ApiError(400, 'avatar file is required');

    const avatarLocalPath = req.file ? req.file.path : null;
    if (!avatarLocalPath)
      throw new ApiError(500, 'failed to upload file or image, try again');

    const uploadStatus = await uploadOnCloudinary(avatarLocalPath);
    if (!uploadStatus)
      throw new ApiError(500, 'something went wrong while uploading avatar');

    const userId = req.user?._id;
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          avatar: uploadStatus.url,
        },
      },
      { new: true }
    );

    return res.status(200).json(
      new ApiResponse(200, 'avatar updated successfully', {
        avatar: user.avatar,
      })
    );
  } catch (error) {
    throw new ApiError(error.statusCode, error.message);
  }
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  try {
    if (!req.user) throw new ApiError(400, 'user not logged in');

    if (!req.file) throw new ApiError(400, 'cover Image is required');

    const coverImageLocalPath = req.file ? req.file.path : null;
    if (!coverImageLocalPath)
      throw new ApiError(500, 'failed to upload image, try again');

    const uploadStatus = await uploadOnCloudinary(coverImageLocalPath);
    if (!uploadStatus)
      throw new ApiError(
        500,
        'something went wrong while uploading cover image'
      );

    const userId = req.user?._id;
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          coverImage: uploadStatus.url,
        },
      },
      { new: true }
    );

    return res.status(200).json(
      new ApiResponse(200, 'cover image updated successfully', {
        coverImage: user.coverImage,
      })
    );
  } catch (error) {
    throw new ApiError(error.statusCode, error.message);
  }
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  try {
    if (!req.user) throw new ApiError(400, 'User not logged in');
    if (!username) throw new ApiError(400, 'Invalid username');

    const channel = await User.aggregate([
      {
        $match: {
          username: username.toLowerCase(),
        },
      },
      {
        $lookup: {
          from: '$subscriptions',
          localField: '_id',
          foreignField: 'channel',
          as: 'subscribers',
        },
      },
      {
        $lookup: {
          from: 'subscriptions',
          localField: '_id',
          foreignField: 'subscriber',
          as: 'subscribedTo',
        },
      },
      {
        $addFields: {
          subscriberCount: {
            $size: '$subscribers',
          },
          subscribedToCount: {
            $size: '$subscribedTo',
          },
          isSubscribed: {
            $cond: {
              if: { $in: [req.user?._id, '$subscribers.subscribe'] },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $project: {
          username: 1,
          email: 1,
          fullName: 1,
          avatar: 1,
          coverImage: 1,
          subscribedToCount: 1,
          subscriberCount: 1,
          isSubscribed: 1,
        },
      },
    ]);

    if (!channel.length) throw new ApiError(400, 'Channel does not exist');
    return res
      .status(200)
      .json(
        new ApiResponse(200, 'Channel profile fetched successfully', channel[0])
      );
  } catch (error) {
    throw new ApiError(error.statusCode, error.message);
  }
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = req.user;
  try {
    if (!user) throw new ApiError(400, 'user not logged in');

    const existedUser = await User.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(user._id),
        },
      },
      {
        $lookup: {
          from: 'videos',
          localField: 'watchHistory',
          foreignField: '_id',
          as: 'watchHistory',
          pipeline: [
            {
              $lookup: {
                from: 'users',
                localField: 'owner',
                foreignField: '_id',
                as: 'owner',
              },
            },
            {
              $addFields: {
                owner: {
                  $first: '$owner',
                },
              },
            },
          ],
        },
      },
      {
        $project: {
          fullName: 1,
          username: 1,
          avatar: 1,
          owner: 1,
          watchHistory: 1,
        },
      },
    ]);

    return res
      .status(200)
      .json(
        new ApiResponse(200, 'watch history fetched successfully', existedUser)
      );
  } catch (error) {
    throw new ApiError(error.statusCode, error.message);
  }
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
};
