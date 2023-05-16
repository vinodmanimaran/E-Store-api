const User = require('../models/User');
const router = require('express').Router();
const { validationResult } = require('express-validator');
const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');

// REGISTER
router.post('/register', async (req, res) => {
  try {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Return errors if request body is invalid
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    // Check if the user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      // Return error if user already exists
      return res.status(400).json({ message: 'User already exists' });
    }

    // Encrypt password before storing it in the database
    const encryptedPassword = CryptoJS.AES.encrypt(
      password,
      process.env.PASS_SEC
    ).toString();

    const newUser = new User({
      username,
      email,
      password: encryptedPassword,
    });

    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    // Log error and return error message
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username
    const user = await User.findOne({ username });

    if (!user) {
      // User not found in the database
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Decrypt the stored password
    const decryptedPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASS_SEC
    );
    const originalPassword = decryptedPassword.toString(CryptoJS.enc.Utf8);

    if (originalPassword !== password) {
      // Incorrect password provided
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate access token
    const accessToken = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_ENV,
      { expiresIn: '3d' }
    );

    const { password: userPassword, ...others } = user._doc;
    // Return user details (excluding password) and access token
    res.status(200).json({ ...others, accessToken });
  } catch (err) {
    // Log the error and return a generic error message
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});




module.exports = router;
