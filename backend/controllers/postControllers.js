import User from "../models/userModel.js";
import Post from "../models/postModel.js";
import asyncHandler from "express-async-handler";
import generateToken from "../utils/generateToken.js";
import dotenv from "dotenv";

dotenv.config();

// route for the user registration route
const addPost = asyncHandler(async (req, res) => {
  try {
    const { postDescription, images, tags } = req.body;
    console.log("User ID ", req.userId);
    const newPost = await Post.create({
      userId: req.userId,
      postDescription,
      images,
      tags,
    });

    return res.status(201).json(newPost);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// route for getting all posts
const getAllPosts = asyncHandler(async (req, res) => {
  try {
    const posts = await Post.find().populate("userId", "name email"); // Populate userId with user details
    return res.status(200).json(posts);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// route for getting all User posts
const getUserPosts = asyncHandler(async (req, res) => {
  try {
    const userId = req.userId;
    const userPosts = await Post.find({ userId }).populate(
      "userId",
      "name email"
    ); // Populate user details
    return res.status(200).json(userPosts);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// route for updating post
const updatePost = asyncHandler(async (req, res) => {

   
    try {
        const postId = req.params.postId;
        console.log("body: ",req.body)
        const updatedPost = await Post.findOneAndUpdate(
          { _id: postId, userId: req.userId }, 
          { $set: req.body },
          { new: true }
        );
    
        if (!updatedPost) {
          return res.status(404).json({ message: 'Post not found or unauthorized' });
        }
    
        return res.status(200).json(updatedPost);
      } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
      } })


const updatePostActivity = asyncHandler(async (req, res) => {
    try {
        const postId = req.params.postId;
        const { comment, like, share } = req.body;
        
        const post = await Post.findById(postId);
    
        if (!post) {
          return res.status(404).json({ message: 'Post not found' });
        }
    
        if (comment) {
          post.comments.push({ userId: req.userId, comment });
          post.commentCount = post.comments.length;
        }
    
        if (like !== undefined) {
            const userIndex = post.likes.indexOf(req.userId);
            
            if (like && userIndex === -1) {
              // Add user ID to the likes array
              post.likes.push(req.userId);
              // Increment likeCount
              post.likeCount = post.likes.length;
            } else if (!like && userIndex !== -1) {
              // Remove user ID from the likes array
              post.likes.splice(userIndex, 1);
              // Decrement likeCount
              post.likeCount = post.likes.length;
            }
          }
    
        if (share) {
          post.shares.push(req.userId);
          post.shareCount = post.shares.length;
        }
      
        await post.save();
    
        return res.status(200).json(post);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
      }
    });
    


const deletePost = asyncHandler(async (req, res) => {
  try {
    const postId = req.params.postId;
    const deletedPost = await Post.findOneAndDelete({
      _id: postId,
      userId: req.userId,
    });

    if (!deletedPost) {
      return res
        .status(404)
        .json({ message: "Post not found or unauthorized" });
    }

    return res.status(204).json({ message: "Post deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
});


export {addPost, getAllPosts, updatePost, deletePost, getUserPosts, updatePostActivity}
