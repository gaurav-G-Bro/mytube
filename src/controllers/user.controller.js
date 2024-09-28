import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { uploadOnCloudinary } from '../utils/cloudinary.upload.js';
import { User } from '../models/user.model.js';
import { generateAccessTokenAndRefreshToken } from '../utils/genAccessRefreshToken.js';
import { OPTIONS_COOKIE } from '../constants/constant.js';

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

    if (!user) throw new ApiError(400, 'user does not exist');

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
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $unset: { refreshToken: 1 },
      },
      { new: true }
    ).select('-password -refreshToken');

    return res
      .status(200)
      .clearCookie('accessToken', OPTIONS_COOKIE)
      .clearCookie('refreshToken', OPTIONS_COOKIE)
      .json(new ApiResponse(200, 'user logged out successfully'));
  } catch (error) {
    throw new ApiError(error.statusCode, error.message);
  }
});

export { registerUser, loginUser, logoutUser };

// export {
// 	 logoutUser,
// 	 refreshAccessToken,
// 	 changeCurrentPassword,
// 	 getCurrentUser,
// 	 updateAccountDetails,
// 	 updateUserAvatar,
// 	 updateUserCoverImage,
// 	 getUserChannelProfile,
// 	 getWatchHistory
// 	};
