const express = require('express');
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

// Add Comment
router.post('/', authenticate, async (req, res) => {
  const { postId, comment } = req.body;
  try {
    const newComment = new Comment({ postId, userId: req.userId, comment });
    await newComment.save();
    res.send('Comment added successfully');
  } catch (err) {
    res.status(400).send('Error adding comment');
  }
});

module.exports = router;
