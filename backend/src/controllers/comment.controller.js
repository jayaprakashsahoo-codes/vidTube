import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {Video} from "../models/video.model.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const commentsAggregate = Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {$sort: {createdAt: -1}},
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            username: 1,
                            avatar: 1
                        }
                    }
                ],
                as: "owner"
            }
        },
        {
            $addFields: {
                owner: {$first: "$owner"}
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "comment",
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
    ])

    const comments = await Comment.aggregatePaginate(commentsAggregate, {
        page: Math.max(parseInt(page, 10) || 1, 1),
        limit: Math.max(parseInt(limit, 10) || 10, 1)
    })

    return res
        .status(200)
        .json(new ApiResponse(200, comments, "Video comments fetched successfully"))
})

const addComment = asyncHandler(async (req, res) => {
    const {videoId} = req.params;
    const {content}=req.body;

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }
    const video=await Video.findById(videoId);
    if(!video){
        throw new ApiError(404,"Video does not exist");
    }
    if(!content?.trim()){
        throw new ApiError(400,"Content is required");
    }

    const newComment = await Comment.create({
      content: content.trim(),
      video: videoId,
      owner: req.user._id,
    });

    const createdComment = await Comment.findById(newComment._id).populate("owner", "username fullName avatar");

    if (!createdComment) {
      throw new ApiError(
        500,
        "Something went wrong while creating the comment"
      );
    }

    return res
      .status(201)
      .json(
        new ApiResponse(201, createdComment, "Comment created successfully")
      );
})

const updateComment = asyncHandler(async (req, res) => {
    const {commentId}=req.params;
    const {content}=req.body;
    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment id")
    }

    if (typeof content !== "string" || !content.trim()) {
        throw new ApiError(400, "Content is required")
    }

    const updatedComment = await Comment.findOneAndUpdate(
        {_id: commentId, owner: req.user._id},
        {$set: {content: content.trim()}},
        {new: true, runValidators: true}
    ).populate("owner", "username fullName avatar")

    if (!updatedComment) {
        throw new ApiError(404, "Comment does not exist or you don't have permission")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedComment, "Comment updated successfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
    const {commentId}=req.params;
    if(!mongoose.isValidObjectId(commentId)){
        throw new ApiError(400,"Invalid commentId")
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if (comment.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You do not have permission to delete this comment");
    }

    await Like.deleteMany({ comment: commentId });
    await Comment.findByIdAndDelete(commentId);

    return res
    .status(200)
    .json(new ApiResponse(200, { commentId }, "Comment deleted successfully"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }
