const express = require('express');
const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');

const router = express.Router();

// Middleware to verify authentication
const authenticate = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).send('No token provided');

  try {
    const decoded = jwt.decode(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(400).send('Invalid token');
  }
};

// Create Post
router.post('/', authenticate, async (req, res) => {
  const { content } = req.body;
  try {
    const post = new Post({ userId: req.userId, content });
    await post.save();
    res.status(201).send('Post created successfully');
  } catch (err) {
    res.status(400).send('Error creating post');
  }
});

// Get Feed
router.get('/feed', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const friendPosts = await Post.find({ userId: { $in: user.friends } });

    const nonFriendPosts = await Post.aggregate([
      { $match: { userId: { $nin: user.friends } } },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'postId',
          as: 'comments',
        },
      },
      {
        $match: {
          'comments.userId': { $in: user.friends },
        },
      },
    ]);

    const feed = [...friendPosts, ...nonFriendPosts];
    res.json(feed);
  } catch (err) {
    res.status(500).send('Error fetching feed');
  }
});

module.exports = router;
