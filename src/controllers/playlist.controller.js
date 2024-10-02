import mongoose from 'mongoose';
import { Playlist } from '../models/playlist.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  try {
    if (!req.user) throw new ApiError(400, 'user not logged in');
    if (!name || name.trim() === '')
      throw new ApiError(400, 'name is required');

    if (!description || description.trim() === '')
      throw new ApiError(400, 'description is required');

    const playlist = await Playlist.create({
      name,
      description,
      owner: req.user._id,
    });

    if (!playlist)
      throw new ApiError(
        500,
        'something went wrong while creating the playlist'
      );

    return res
      .status(200)
      .json(new ApiResponse(200, 'playlist created successfully', playlist));
  } catch (error) {
    throw new ApiError(error.statusCode, error.message);
  }
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  try {
    if (!req.user) throw new ApiError(400, 'user not logged in');
    if (!userId || userId.trim() === '')
      throw new ApiError(400, 'userId is required');

    const existingPlaylist = await Playlist.find({
      owner: userId,
    });

    const playlistStatus =
      !existingPlaylist.length > 0
        ? 'no playlist found'
        : 'playlists fetched successfully';

    return res
      .status(200)
      .json(new ApiResponse(200, playlistStatus, existingPlaylist));
  } catch (error) {
    throw new ApiError(error.statusCode, error.message);
  }
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  try {
    if (!req.user) throw new ApiError(400, 'user not logged in');

    if (!playlistId || playlistId.trim() === '')
      throw new ApiError(400, 'Invalid playlist Id');

    const playlist = await Playlist.findById(playlistId);
    if (!playlist)
      throw new ApiError(404, 'playlist does not exists or removed');

    if (playlist.owner.toString() !== req.user._id.toString())
      throw new ApiError(401, 'you are not authorized to fetch this playlist');

    return res
      .status(200)
      .json(new ApiResponse(200, 'playlist fetched successfully', playlist));
  } catch (error) {
    throw new ApiError(error.statusCode, error.message);
  }
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  try {
    if (!req.user) throw new ApiError(400, 'user not logged in');
    if (!playlistId || playlistId.trim() === '')
      throw new ApiError(400, 'Invalid playlist Id');

    if (!videoId || videoId.trim() === '')
      throw new ApiError(400, 'Invalid video Id');

    const existingPlaylist = await Playlist.findById(playlistId);

    if (!existingPlaylist)
      throw new ApiError(404, 'playlist does not exist or removed');

    if (existingPlaylist.owner.toString() !== req.user._id.toString())
      throw new ApiError(
        401,
        'you are unauthorized to access add videos in playlist'
      );

    const addVidsToPlaylist = await Playlist.findByIdAndUpdate(
      playlistId,
      {
        $push: {
          videos: videoId,
        },
      },
      { new: true }
    );

    if (!addVidsToPlaylist)
      throw new ApiError(500, 'something went wrong while adding the video');

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          'video added to playlist successfully',
          addVidsToPlaylist
        )
      );
  } catch (error) {
    throw new ApiError(error.statusCode, error.message);
  }
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  try {
    if (!req.user) throw new ApiError(400, 'user not logged in');
    if (!playlistId || playlistId.trim() === '')
      throw new ApiError(400, 'Invalid playlist Id');

    if (!videoId || videoId.trim() === '')
      throw new ApiError(400, 'Invalid video Id');

    const existingPlaylist = await Playlist.findById(playlistId);

    if (!existingPlaylist)
      throw new ApiError(404, 'playlist does not exist or removed');

    if (existingPlaylist.owner.toString() !== req.user._id.toString())
      throw new ApiError(
        401,
        'you are unauthorized to access add videos in playlist'
      );

    const removeVidsFromPlaylist = await Playlist.findByIdAndUpdate(
      playlistId,
      {
        $pull: {
          videos: videoId,
        },
      },
      { new: true }
    );

    if (!removeVidsFromPlaylist)
      throw new ApiError(500, 'something went wrong while removing the video');

    return res
      .status(200)
      .json(new ApiResponse(200, 'video removed from playlist successfully'));
  } catch (error) {
    throw new ApiError(error.statusCode, error.message);
  }
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  try {
    if (!req.user) throw new ApiError(400, 'user not logged in');

    if (!playlistId || playlistId.trim() === '')
      throw new ApiError(400, 'Invalid playlist Id');

    const existingPlaylist = await Playlist.findById(playlistId);
    if (!playlist)
      throw new ApiError(404, 'playlist does not exists or removed');

    if (playlist.owner.toString() !== req.user._id.toString())
      throw new ApiError(401, 'you are not authorized to delete this playlist');

    const deleteStatus = await Playlist.findByIdAndDelete(playlistId);
    if (!deleteStatus)
      throw new ApiError(
        500,
        'something went wrong while deleting the playlist'
      );
    return res
      .status(200)
      .json(new ApiResponse(200, 'playlist deleted successfully'));
  } catch (error) {
    throw new ApiError(error.statusCode, error.message);
  }
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  try {
    if (!req.user) throw new ApiError(400, 'user not logged in');

    if (!playlistId || playlistId.trim() === '')
      throw new ApiError(400, 'Invalid playlist Id');

    if (!name || name.trim() === '')
      throw new ApiError(400, 'name is required');

    if (!description || description.trim() === '')
      throw new ApiError(400, 'description is required');

    const existingPlaylist = await Playlist.findById(playlistId);
    if (!existingPlaylist)
      throw new ApiError(404, 'playlist does not exists or removed');

    if (existingPlaylist.owner.toString() !== req.user._id.toString())
      throw new ApiError(401, 'you are not authorized to update this playlist');

    const updatedStatus = await Playlist.findByIdAndUpdate(
      playlistId,
      {
        name,
        description,
      },
      { new: true }
    );
    if (!updatedStatus)
      throw new ApiError(
        500,
        'something went wrong while updating the playlist'
      );
    return res
      .status(200)
      .json(
        new ApiResponse(200, 'playlist updated successfully', updatedStatus)
      );
  } catch (error) {
    throw new ApiError(error.statusCode, error.message);
  }
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
