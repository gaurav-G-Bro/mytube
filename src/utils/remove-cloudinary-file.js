import { v2 as cloudinary } from 'cloudinary';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME_CLOUDINARY,
  api_key: process.env.API_KEY_CLOUDINARY,
  api_secret: process.env.API_SECRET_CLOUDINARY,
});

const removeFileFromCloudinary = async (publicId) => {
  try {
    if (!publicId) throw new ApiError(400, 'publicId is required');
    const removedFileStatus = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
    });

    const removedVideoStatus = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'video',
    });

    if (!removedFileStatus || !removedVideoStatus)
      throw new ApiError(500, 'failed to remove the file from cloudinary');
    return removedFileStatus ? true : false;
  } catch (error) {
    throw new ApiError(error.statusCode, error.message);
  }
};

export { removeFileFromCloudinary };
