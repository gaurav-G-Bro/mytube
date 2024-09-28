import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import { ApiError } from '../utils/ApiError.js';

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME_CLOUDINARY,
  api_key: process.env.API_KEY_CLOUDINARY,
  api_secret: process.env.API_SECRET_CLOUDINARY,
});

const uploadOnCloudinary = async function (localFilePath) {
  try {
    if (!localFilePath) throw new ApiError(400, 'Local file path not found');
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto',
    });
    if (!response) throw new ApiError(400, 'Failed to upload file, try again');
    fs.unlinkSync(localFilePath);
    return response;
  } catch (err) {
    fs.unlinkSync(localFilePath);
    return err.message;
  }
};

export { uploadOnCloudinary };
