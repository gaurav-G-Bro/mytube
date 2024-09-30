const get_cloudinary_file_publicId = (cloudinaryFilePath) => {
  const path = cloudinaryFilePath.split('/');
  const lastSplittedPath = path[path.length - 1];
  const public_id = lastSplittedPath.split('.')[0];
  return public_id;
};

export { get_cloudinary_file_publicId };
