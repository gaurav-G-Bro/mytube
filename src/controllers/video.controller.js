import mongoose, { isValidObjectId } from 'mongoose';
import { Video } from '../models/video.model.js';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { uploadOnCloudinary } from '../utils/cloudinary.upload.js';
import { removeFileFromCloudinary } from '../utils/remove-cloudinary-file.js';
import { get_cloudinary_file_publicId } from '../utils/get-public-id-cloudinary-files.js';

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType } = req.query;
  const userId = req.user._id;
  //TODO: get all videos based on query, sort, pagination
  try {
    if (!userId) throw new ApiError(400, 'user not logged in');

    const videos = await Video.find({});
    if (!videos) throw new ApiError(500, 'failed to fetch videos');

    const videoStatus =
      videos.length > 0 ? 'videos fetched successfully' : 'No video found';
    return res.status(200).json(new ApiResponse(200, videoStatus, videos));
  } catch (error) {
    throw new ApiError(error.statusCode, error.message);
  }
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  try {
    if (!req.user) throw new ApiError(400, 'user not logged in');

    if (!title || title.trim() === '')
      throw new ApiError(400, 'title is required');

    if (!description || description.trim() === '')
      throw new ApiError(400, 'description is required');

    const videoLocalPath = req.files?.videoFile[0].path;
    const thumbnailLocalPath = req.files?.thumbnail[0].path;

    const videoUploadStatus = await uploadOnCloudinary(videoLocalPath);
    const thumbnailUploadStatus = await uploadOnCloudinary(thumbnailLocalPath);

    if (!videoUploadStatus?.url)
      throw new ApiError(500, 'failed to upload video, try again');
    if (!thumbnailUploadStatus?.url)
      throw new ApiError(500, 'failed to upload thumbnail, try again');

    const videoDetails = {
      title,
      description,
      videoFile: videoUploadStatus.url,
      thumbnail: thumbnailUploadStatus.url,
      isPublished: true,
      duration: videoUploadStatus.duration,
      owner: req.user._id,
    };

    let video;
    if (videoUploadStatus.url && thumbnailUploadStatus.url) {
      video = await Video.create(videoDetails);
    }

    return res
      .status(200)
      .json(new ApiResponse(200, 'video published successfully', video));
  } catch (error) {
    console.log(error);
    throw new ApiError(error.statusCode, error.message);
  }
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  try {
    if (!videoId || videoId.trim() === '')
      throw new ApiError(404, 'video not found');
    if (!req.user) throw new ApiError(400, 'User not logged in');

    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(500, 'video does not exist');

    return res
      .status(200)
      .json(new ApiResponse(200, 'video fetched successfully', video));
  } catch (error) {
    throw new ApiError(error.statusCode, error.message);
  }
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;
  try {
    if (!videoId) throw new ApiError(400, 'video does not exist or removed');
    if (!req.user) throw new ApiError(400, 'user not logged in');

    if (!title || title.trim() === '')
      throw new ApiError(400, 'title is required');

    if (!description || description.trim() === '')
      throw new ApiError(400, 'description is required');

    const thumbnailLocalPath = req.file.path;

    if (!thumbnailLocalPath)
      throw new ApiError(500, 'failed to upload thumbnail');

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if (!thumbnail.url)
      throw new ApiError(500, 'thumbnail not uploaded, try again');

    const existing_video = await Video.findById(videoId);
    if (!existing_video) throw new ApiError(404, 'video not found');

    const public_id = await get_cloudinary_file_publicId(
      existing_video.thumbnail
    );
    if (!public_id) throw new ApiError(500, 'path not found');

    const removedStatus = await removeFileFromCloudinary(public_id);
    if (!removedStatus)
      throw new ApiError(500, 'something went wrong while removing the file');

    let new_thumbnail;
    if (removedStatus) {
      new_thumbnail = await Video.findByIdAndUpdate(
        videoId,
        {
          $set: {
            thumbnail: thumbnail.url,
            title,
            description,
          },
        },
        { new: true }
      );
    }
    return res.status(200).json(
      new ApiResponse(200, 'video details updated successfully', {
        thumbnail: new_thumbnail,
      })
    );
  } catch (error) {
    console.log(error);
    throw new ApiError(error.statusCode, error.message);
  }
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
