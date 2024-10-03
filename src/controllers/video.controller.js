import mongoose from 'mongoose';
import { Video } from '../models/video.model.js';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { uploadOnCloudinary } from '../utils/cloudinary.upload.js';
import { removeFileFromCloudinary } from '../utils/remove-cloudinary-file.js';
import { get_cloudinary_file_publicId } from '../utils/get-public-id-cloudinary-files.js';

const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query = '',
    sortBy = 'createdAt',
    sortType = 'desc',
  } = req.query;
  const userId = req.user._id;

  try {
    if (!userId) throw new ApiError(400, 'user not logged in');

    const sortOrder = sortType === 'asc' ? 1 : -1;

    const video = await Video.aggregate([
      {
        $match: query
          ? {
              title: {
                $regex: query,
                $options: 'i',
              },
            }
          : {},
      },
      {
        $facet: {
          totalCount: [{ $count: 'count' }],
          videos: [
            { $sort: { [sortBy]: sortOrder } },
            { $skip: (page - 1) * parseInt(limit) },
            { $limit: parseInt(limit) },
          ],
        },
      },
      {
        $addFields: {
          totalCount: { $arrayElemAt: ['$totalCount.count', 0] },
        },
      },
    ]);

    const totalCount = video[0].totalCount || 0;
    const videosData = video[0].videos;

    const videoStatus =
      videosData.length > 0 ? 'Videos fetched successfully' : 'No video found';

    return res.status(200).json(
      new ApiResponse(200, videoStatus, videosData, {
        totalCount,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
      })
    );
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

const updateVideoThumbnail = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;
  try {
    if (!req.user) throw new ApiError(400, 'user not logged in');

    if (!videoId || videoId.trim() === '')
      throw new ApiError(400, 'Invalid video Id');

    if (!title || title.trim() === '')
      throw new ApiError(400, 'title is required');

    if (!description || description.trim() === '')
      throw new ApiError(400, 'description is required');

    const thumbnailLocalPath = req.file ? req.file.path : null;

    if (!thumbnailLocalPath)
      throw new ApiError(500, 'failed to upload thumbnail');

    const existing_video = await Video.findById(videoId);
    if (!existing_video) throw new ApiError(404, 'video not found');

    const public_id = await get_cloudinary_file_publicId(
      existing_video.thumbnail
    );
    if (!public_id) throw new ApiError(500, 'pubilc id not found');

    const removedStatus = await removeFileFromCloudinary(public_id);

    if (!removedStatus)
      throw new ApiError(500, 'something went wrong while removing the file');

    const uploaded_thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if (!uploaded_thumbnail.url)
      throw new ApiError(500, 'thumbnail not uploaded, try again');

    let new_thumbnail;
    if (uploaded_thumbnail.url) {
      new_thumbnail = await Video.findByIdAndUpdate(
        videoId,
        {
          $set: {
            thumbnail: uploaded_thumbnail.url,
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
    throw new ApiError(error.statusCode, error.message);
  }
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;
  try {
    if (!userId) throw new ApiError(400, 'user not logged in');
    if (!videoId || videoId.trim() === '')
      throw new ApiError(400, 'Invalid video id');

    const existing_video = await Video.findById(videoId);
    if (!existing_video) throw new ApiError(404, 'video not found');

    const public_id = await get_cloudinary_file_publicId(
      existing_video.videoFile[0]
    );

    const public_id_thumbnail = await get_cloudinary_file_publicId(
      existing_video.thumbnail
    );
    if (!public_id || !public_id_thumbnail)
      throw new ApiError(500, 'pubilc id not found');

    const removedStatus = await removeFileFromCloudinary(public_id);
    const removedThumbnailStatus = await removeFileFromCloudinary(
      public_id_thumbnail
    );

    if (!removedStatus || !removedThumbnailStatus)
      throw new ApiError(500, 'something went wrong while removing the file');

    if (removedStatus && removedThumbnailStatus) {
      const delStatus = await Video.findByIdAndDelete(videoId);
      if (!delStatus) throw new ApiError(500, 'failed to delete the video');
    }
    return res.status(200).json(new ApiResponse(200, 'video deleted'));
  } catch (error) {
    throw new ApiError(error.statusCode, error.message);
  }
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const user = req.user;

  try {
    if (!videoId || videoId.trim() === '')
      throw new ApiError(400, 'invalid video Id');
    if (!user) throw new ApiError(400, 'user not logged in');

    const existingVideo = await Video.findById(videoId);
    existingVideo.isPublished = !existingVideo.isPublished;

    await existingVideo.save();
    return res.status(200).json(
      new ApiResponse(200, 'toggle successfully done', {
        existingVideo,
      })
    );
  } catch (error) {
    throw new ApiError(error.statusCode, error.message);
  }
});

const incrementViews = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  try {
    if (!req.user) throw new ApiError(400, 'user not logged in');
    if (!videoId) throw new ApiError(400, '');

    const viewsOnVideo = await Video.findByIdAndUpdate(
      videoId,
      {
        $inc: {
          views: 1,
        },
      },
      { new: true }
    );

    return res
      .status(200)
      .json(new ApiResponse(200, 'views incremented successfully'));
  } catch (error) {
    throw new ApiError(error.statusCode, error.message);
  }
});
export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideoThumbnail,
  deleteVideo,
  togglePublishStatus,
  incrementViews,
};
