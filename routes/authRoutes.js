const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jwt-simple');
const User = require('../models/User');
require('dotenv').config();

const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ name, email, passwordHash });
    await user.save();
    res.status(201).send('User created successfully');
  } catch (err) {
    res.status(400).send('Error creating user');
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).send('User not found');
    
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) return res.status(401).send('Invalid password');

    const token = jwt.encode({ userId: user._id }, process.env.JWT_SECRET);
    res.json({ token });
  } catch (err) {
    res.status(500).send('Error logging in');
  }
});

module.exports = router;
