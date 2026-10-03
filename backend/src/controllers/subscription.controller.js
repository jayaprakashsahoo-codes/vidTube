import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"Invalid channel id")
    }
    const userId=req.user?._id;
    if(!userId){
        throw new ApiError(404,"User not found")
    }

    if (channelId.toString() === userId.toString()) {
        throw new ApiError(400, "You cannot subscribe to your own channel")
    }

    const subscription = await Subscription.findOne({channel:channelId,subscriber:userId});
    if(subscription){
        await subscription.deleteOne();
        return res.status(200).json(new ApiResponse(200, { isSubscribed: false }, "Subscription removed successfully"))
    }else{
        await Subscription.create({channel:channelId,subscriber:userId});
        return res.status(200).json(new ApiResponse(200, { isSubscribed: true }, "Subscribed successfully"))
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
     if(!isValidObjectId(channelId)){
        throw new ApiError(400,"invalid channel id")
    }
    //write agregation pipeline here
    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriberDetails",
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
                subscriberDetails: { $first: "$subscriberDetails" }
            }
        },
        {
            $project: {
                _id: 0,
                subscriberDetails: 1
            }
        }
    ])
    return res.status(200).json(new ApiResponse(200,subscribers,"Subscribers fetched successfully"))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if(!isValidObjectId(subscriberId)){
        throw new ApiError(400,"invalid subscriber id")
    }
    const subscribedChannels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channelDetails",
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
                channelDetails: { $first: "$channelDetails" }
            }
        },
        {
            $project: {
                _id: 0,
                channelDetails: 1
            }
        }
    ])
    return res.status(200).json(new ApiResponse(200,subscribedChannels,"Subscribed channels fetched successfully"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}