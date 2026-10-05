import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {Comment} from "../models/comment.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary, deleteFromCloudinary, getPublicIdFromUrl} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query

    if (userId && !isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user id")
    }

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1)
    const pageSize = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100)
    const allowedSortFields = ["createdAt", "updatedAt", "title", "views", "duration"]
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt"
    const sortOrder = sortType === "asc" ? 1 : -1
    const match = { isPublished: true }

    if (userId) match.owner = new mongoose.Types.ObjectId(userId)
    if (query?.trim()) {
        const rawQuery = query.trim()
        const escapedQuery = rawQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        const exactSearch = new RegExp(escapedQuery, "i")

        // Split into terms for word-by-word token matching
        const words = rawQuery.split(/\s+/).filter(Boolean)
        const wordConditions = words.map(w => {
            const escaped = w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
            return [
                { title: new RegExp(escaped, "i") },
                { description: new RegExp(escaped, "i") }
            ]
        }).flat()

        // Create fuzzy regex patterns for words longer than 3 characters (allowing 1 letter typo)
        const fuzzyConditions = words.filter(w => w.length > 3).map(w => {
            // Build pattern allowing any single character variation between adjacent characters
            const fuzzyPattern = w.split("").map(char => `${char.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}?`).join(".?")
            const fuzzyRegex = new RegExp(fuzzyPattern, "i")
            return [
                { title: fuzzyRegex },
                { description: fuzzyRegex }
            ]
        }).flat()

        match.$or = [
            { title: exactSearch },
            { description: exactSearch },
            ...wordConditions,
            ...fuzzyConditions
        ]
    }

    const videos = await Video.aggregatePaginate(
        Video.aggregate([
            { $match: match },
            { $sort: { [sortField]: sortOrder, _id: -1 } },
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    pipeline: [{ $project: { username: 1, fullName: 1, avatar: 1 } }],
                    as: "owner"
                }   
            },
            { $set: { owner: { $first: "$owner" } } },
            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "video",
                    as: "likes"
                }
            },
            {
                $addFields: {
                    likesCount: { $size: "$likes" }
                }
            },
            {
                $project: {
                    likes: 0
                }
            }
        ]),
        { page: pageNumber, limit: pageSize }
    )

    return res.status(200).json(new ApiResponse(200, videos, "Videos fetched successfully"))
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body

    // 1. Validate text fields
    if (!title?.trim() || !description?.trim()) {
        throw new ApiError(400, "Title and description are required")
    }

    // 2. Get local file paths from multer
    const videoLocalPath = req.files?.videoFile?.[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path

    if (!videoLocalPath) {
        throw new ApiError(400, "Video file is required")
    }
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail is required")
    }

    // 3. Upload both files to Cloudinary
    const videoFile = await uploadOnCloudinary(videoLocalPath)
    if (!videoFile) {
        throw new ApiError(500, "Failed to upload video file")
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    if (!thumbnail) {
        throw new ApiError(500, "Failed to upload thumbnail")
    }

    // 4. Create the video document in DB
    const video = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        title: title.trim(),
        description: description.trim(),
        duration: videoFile.duration,
        owner: req.user._id
    })

    return res
        .status(201)
        .json(new ApiResponse(201, video, "Video published successfully"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video id")
    }

    // Increment views count for the video
    await Video.findByIdAndUpdate(videoId, {
        $inc: { views: 1 }
    });

    // If user is authenticated, add video to watch history
    if (req.user?._id) {
        await User.findByIdAndUpdate(req.user._id, {
            $addToSet: { watchHistory: videoId }
        });
    }

    const userId = req.user?._id ? new mongoose.Types.ObjectId(req.user._id) : null;

    const video = await Video.aggregate([
        {
            $match:{_id:new mongoose.Types.ObjectId(videoId)}
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner",
                pipeline:[
                    {
                        $project:{
                            username:1,
                            avatar:1,
                            fullName:1,
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $addFields:{
                owner:{$first:"$owner"},
                likesCount: { $size: "$likes" },
                isLiked: userId
                    ? {
                        $cond: {
                            if: { $in: [userId, "$likes.likedBy"] },
                            then: true,
                            else: false
                        }
                    }
                    : false
            }
        },
        {
            $project: {
                likes: 0
            }
        }
    ])
    if(!video?.length){
        throw new ApiError(404,"Video not found")
    }
    return res.status(200).json(new ApiResponse(200,video[0],"Video fetched successfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video id")
    }
    
    const {title, description} = req.body;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path || req.file?.path;

    if(!title?.trim() && !description?.trim() && !thumbnailLocalPath){
        throw new ApiError(400,"Please provide at least one field to update")
    }
    
    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404,"Video not found")
    }

    if (video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You do not have permission to update this video")
    }
    
    if(title?.trim()){
        video.title = title.trim();
    }
    if(description?.trim()){
        video.description = description.trim();
    }
    
    if (thumbnailLocalPath) {
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
        if (!thumbnail) {
             throw new ApiError(500, "Failed to upload new thumbnail");
        }
        if (video.thumbnail) {
            const oldPublicId = getPublicIdFromUrl(video.thumbnail);
            if (oldPublicId) {
                await deleteFromCloudinary(oldPublicId, "image");
            }
        }
        video.thumbnail = thumbnail.url;
    }
    
    await video.save({ validateBeforeSave: false });
    return res.status(200).json(new ApiResponse(200,video,"Video updated successfully"));
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video id")
    }
    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404,"Video not found")
    }

    if (video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You do not have permission to delete this video")
    }

    // Delete media assets from Cloudinary
    if (video.videoFile) {
        const videoPublicId = getPublicIdFromUrl(video.videoFile);
        if (videoPublicId) {
            await deleteFromCloudinary(videoPublicId, "video");
        }
    }
    if (video.thumbnail) {
        const thumbnailPublicId = getPublicIdFromUrl(video.thumbnail);
        if (thumbnailPublicId) {
            await deleteFromCloudinary(thumbnailPublicId, "image");
        }
    }

    // Delete associated comments and likes
    await Comment.deleteMany({ video: videoId });
    await Like.deleteMany({ video: videoId });

    await video.deleteOne();
    return res.status(200).json(new ApiResponse(200, { videoId }, "Video deleted successfully"));
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video id")
    }
    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404,"Video not found")
    }

    if (video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You do not have permission to toggle publish status for this video")
    }

    video.isPublished = !video.isPublished;
    await video.save();
    return res.status(200).json(new ApiResponse(200,video,"Video published status toggled successfully"));
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
