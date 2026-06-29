const fs = require('fs');
const Post = require('../../app/models/post.model'); // Adjust path as needed
const { uploadFileOnCloudinary } = require('../utils/uploadFilesOnCloudinary');

class PostController {
  // 1. CREATE Post (Logged-in user only)
  async createPost(req, res) {
    try {
      const { title, content } = req.body;

      if (!title || !content) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ status: false, message: "Title and content are required" });
      }

      const postData = new Post({
        title,
        content,
        user: req.user.id // Secured: Attached from auth middleware token payload
      });

      if (req.file) {
        try {
          const cloudinaryResponse = await uploadFileOnCloudinary(req.file.path);
          postData.postImage = cloudinaryResponse.secure_url || cloudinaryResponse;
          fs.unlinkSync(req.file.path);
        } catch (uploadError) {
          if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
          throw uploadError;
        }
      }

      const savedPost = await postData.save();
      return res.status(201).json({ status: true, message: "Post created successfully", data: savedPost });
    } catch (error) {
      return res.status(500).json({ status: false, message: "Error creating post", error: error.message });
    }
  }

  // 2. READ All Posts (Created by the logged-in user only)
  async getMyPosts(req, res) {
    try {
      const posts = await Post.find({ user: req.user.id }).sort({ createdAt: -1 });
      return res.status(200).json({ status: true, results: posts.length, data: posts });
    } catch (error) {
      return res.status(500).json({ status: false, message: "Error fetching your posts", error: error.message });
    }
  }

  // 3. READ Single Post (By ID, validates ownership)
  async getPostById(req, res) {
    try {
      const post = await Post.findById(req.params.id);
      
      if (!post) {
        return res.status(404).json({ status: false, message: "Post not found" });
      }

      // Security check: Ensure the post belongs to the requester
      if (post.user.toString() !== req.user.id) {
        return res.status(403).json({ status: false, message: "Unauthorized to view this post" });
      }

      return res.status(200).json({ status: true, data: post });
    } catch (error) {
      return res.status(500).json({ status: false, message: "Error fetching post", error: error.message });
    }
  }

  // 4. UPDATE Post (Logged-in owner only)
  async updatePost(req, res) {
    try {
      const { title, content } = req.body;
      let post = await Post.findById(req.params.id);

      if (!post) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(404).json({ status: false, message: "Post not found" });
      }

      // Security check: Only the owner can update
      if (post.user.toString() !== req.user.id) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(403).json({ status: false, message: "Unauthorized to update this post" });
      }

      // Update fields if provided
      if (title) post.title = title;
      if (content) post.content = content;

      // Update image if a new one is uploaded
      if (req.file) {
        try {
          const cloudinaryResponse = await uploadFileOnCloudinary(req.file.path);
          post.postImage = cloudinaryResponse.secure_url || cloudinaryResponse;
          fs.unlinkSync(req.file.path);
        } catch (uploadError) {
          if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
          throw uploadError;
        }
      }

      const updatedPost = await post.save();
      return res.status(200).json({ status: true, message: "Post updated successfully", data: updatedPost });
    } catch (error) {
      return res.status(500).json({ status: false, message: "Error updating post", error: error.message });
    }
  }

  // 5. DELETE Post (Logged-in owner only)
  async deletePost(req, res) {
    try {
      const post = await Post.findById(req.params.id);

      if (!post) {
        return res.status(404).json({ status: false, message: "Post not found" });
      }

      // Security check: Only the owner can delete
      if (post.user.toString() !== req.user.id) {
        return res.status(403).json({ status: false, message: "Unauthorized to delete this post" });
      }

      await post.deleteOne(); // Use deleteOne instead of remove() for modern Mongoose setups
      return res.status(200).json({ status: true, message: "Post deleted successfully" });
    } catch (error) {
      return res.status(500).json({ status: false, message: "Error deleting post", error: error.message });
    }
  }
}

module.exports = new PostController();
