import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const {content} = req.body;
    if(!content?.trim()){
        throw new ApiError(400,"content is required");
    }
    const tweet = await Tweet.create({
        content: content.trim(),
        owner: req.user._id
    });
    return res.status(201).json(new ApiResponse(201,tweet,"Tweet created successfully"));
})

const getUserTweets = asyncHandler(async (req, res) => {
    const {userId} = req.params;
    if(!isValidObjectId(userId)){
        throw new ApiError(400,"invalid user id");
    }
    const tweets = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        { $sort: { createdAt: -1 } },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    { $project: { username: 1, fullName: 1, avatar: 1 } }
                ]
            }
        },
        { $addFields: { owner: { $first: "$owner" } } },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likes"
            }
        },
        {
            $addFields: {
                likesCount: { $size: "$likes" },
                isLiked: {
                    $cond: {
                        if: { $in: [req.user?._id, "$likes.likedBy"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: { likes: 0 }
        }
    ]);
    return res.status(200).json(new ApiResponse(200, tweets, "User tweets fetched successfully"));
})

const updateTweet = asyncHandler(async (req, res) => {
    const {tweetId} = req.params;
    const {content} = req.body;
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"invalid tweet id");
    }
    if(!content?.trim()){
        throw new ApiError(400,"content is required");
    }

    const existingTweet = await Tweet.findById(tweetId);
    if (!existingTweet) {
        throw new ApiError(404, "Tweet not found");
    }

    if (existingTweet.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You do not have permission to update this tweet");
    }

    const tweet = await Tweet.findByIdAndUpdate(tweetId, {
        content: content.trim()
    }, {new: true});

    return res.status(200).json(new ApiResponse(200, tweet, "Tweet updated successfully"));
})

const deleteTweet = asyncHandler(async (req, res) => {
    const {tweetId} = req.params;
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"invalid tweet id");
    }

    const existingTweet = await Tweet.findById(tweetId);
    if (!existingTweet) {
        throw new ApiError(404, "Tweet not found");
    }

    if (existingTweet.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You do not have permission to delete this tweet");
    }

    await Like.deleteMany({ tweet: tweetId });
    await Tweet.findByIdAndDelete(tweetId);

    return res.status(200).json(new ApiResponse(200, { tweetId }, "Tweet deleted successfully"));
})

const getAllTweets = asyncHandler(async (req, res) => {
    const tweets = await Tweet.aggregate([
        { $sort: { createdAt: -1 } },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    { $project: { username: 1, fullName: 1, avatar: 1 } }
                ]
            }
        },
        { $addFields: { owner: { $first: "$owner" } } },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likes"
            }
        },
        {
            $addFields: {
                likesCount: { $size: "$likes" },
                isLiked: {
                    $cond: {
                        if: { $in: [req.user?._id, "$likes.likedBy"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: { likes: 0 }
        }
    ]);
    return res.status(200).json(new ApiResponse(200, tweets, "All tweets fetched successfully"));
})

export {
    createTweet,
    getUserTweets,
    getAllTweets,
    updateTweet,
    deleteTweet
}
