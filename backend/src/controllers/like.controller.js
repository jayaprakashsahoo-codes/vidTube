import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {Video} from "../models/video.model.js"
import {Comment} from "../models/comment.model.js"
import {Tweet} from "../models/tweet.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video id")
    };
    const userId=req.user?._id;
    if(!userId){
        throw new ApiError(404,"user not found")
    }
    const video=await Video.findById(videoId);
    if(!video){
        throw new ApiError(404,"video not found")
    }
    const like = await Like.findOne({video:videoId,likedBy:userId});
    let isLiked;
    if(like){
        await like.deleteOne();
        isLiked = false;
    }else{
        await Like.create({video:videoId,likedBy:userId});
        isLiked = true;
    }
    const likesCount = await Like.countDocuments({ video: videoId });
    return res.status(200).json(new ApiResponse(200, { isLiked, likesCount }, isLiked ? "Video liked successfully" : "Video unliked successfully"));
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"Invalid comment id")
    }
    const userId=req.user?._id;
    if(!userId){
        throw new ApiError(404,"user not found")
    }
    const comment=await Comment.findById(commentId);
    if(!comment){
        throw new ApiError(404,"comment not found")
    }
    const like = await Like.findOne({comment:commentId,likedBy:userId});
    let isLiked;
    if(like){
        await like.deleteOne();
        isLiked = false;
    }else{
        await Like.create({comment:commentId,likedBy:userId});
        isLiked = true;
    }
    const likesCount = await Like.countDocuments({ comment: commentId });
    return res.status(200).json(new ApiResponse(200, { isLiked, likesCount }, isLiked ? "Comment liked successfully" : "Comment unliked successfully"));
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"Invalid tweet id")
    }
    const userId=req.user?._id;
    if(!userId){
        throw new ApiError(404,"user not found")
    }
    const tweet=await Tweet.findById(tweetId);
    if(!tweet){
        throw new ApiError(404,"tweet not found")
    }
    const like = await Like.findOne({tweet:tweetId,likedBy:userId});
    let isLiked;
    if(like){
        await like.deleteOne();
        isLiked = false;
    }else{
        await Like.create({tweet:tweetId,likedBy:userId});
        isLiked = true;
    }
    const likesCount = await Like.countDocuments({ tweet: tweetId });
    return res.status(200).json(new ApiResponse(200, { isLiked, likesCount }, isLiked ? "Tweet liked successfully" : "Tweet unliked successfully"));
})


const getLikedVideos = asyncHandler(async (req, res) => {
    const userId=req.user?._id;
    if(!userId){
        throw new ApiError(404,"user not found")
    }
    
    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(userId),
                video: { $exists: true, $ne: null } // Only fetch likes that are for videos
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "likedVideo",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: { $first: "$owner" }
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$likedVideo" // Filters out any likes whose referenced video was deleted
        },
        {
            $replaceRoot: { newRoot: "$likedVideo" } // Returns video object directly
        }
    ]);

    return res.status(200).json(new ApiResponse(200, likedVideos, "Liked videos fetched successfully"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}