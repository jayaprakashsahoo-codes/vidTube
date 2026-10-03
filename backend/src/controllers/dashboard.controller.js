import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if(!userId){
        throw new ApiError(404,"user not found")
    };

    // We can get total views, videos, and likes in a single aggregation pipeline
    const videoStats = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
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
            $project: {
                views: 1,
                likesCount: { $size: "$likes" }
            }
        },
        {
            $group: {
                _id: null,
                totalViews: { $sum: "$views" },
                totalVideos: { $sum: 1 },
                totalLikes: { $sum: "$likesCount" }
            }
        }
    ]);

    const subscriberStats = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $count: "subscribers"
        }
    ]);

    const stats = {
        totalViews: videoStats[0]?.totalViews || 0,
        totalVideos: videoStats[0]?.totalVideos || 0,
        totalLikes: videoStats[0]?.totalLikes || 0,
        totalSubscribers: subscriberStats[0]?.subscribers || 0
    };

    return res
        .status(200)
        .json(new ApiResponse(200, stats, "Channel stats fetched successfully"));
})

const getChannelVideos = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if(!userId){
        throw new ApiError(404,"user not found")
    };

    const videos = await Video.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"video",
                as:"likes"
            }
        },
        {
            $addFields:{
                likesCount: { $size: "$likes" }
            }
        },
        {
            $project: {
                likes: 0 // Remove the likes array to keep the payload size small
            }
        }
    ])

    return res
    .status(200)
    .json(new ApiResponse(200,videos,"Videos fetched successfully"))
})

export {
    getChannelStats, 
    getChannelVideos
    }