const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  postImage: { type: String },
  // Links the post directly to the creating profile
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true } 
}, { timestamps: true });

module.exports = mongoose.model('manage-post', PostSchema);
