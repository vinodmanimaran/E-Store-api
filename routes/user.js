const User = require ('../models/User');
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require ('../verifyToken');
const router = require ('express').Router ();
const CryptoJS = require ('crypto-js');

// UPDATE
router.put ('/:id', verifyTokenAndAuthorization, async (req, res) => {
  if (req.body.password) {
    // Encrypt the password before updating
    req.body.password = CryptoJS.AES
      .encrypt (req.body.password, process.env.PASS_SEC)
      .toString ();
  }
  try {
    // Update the user and retrieve the updated user data
    const updateUser = await User.findByIdAndUpdate (
      req.params.id,
      {
        $set: req.body,
      },
      {new: true}
    );
    res.status (200).json (updateUser);
  } catch (err) {
    // Handle any errors and send an error response
    console.error (err);
    res.status (500).json ({message: 'Something went wrong'});
  }
});

// DELETE
router.delete ('/:id', verifyTokenAndAuthorization, async (req, res) => {
  try {
    // Delete the user by ID
    await User.findByIdAndDelete (req.params.id);
    res.status (200).json ({message: 'User has been deleted'});
  } catch (err) {
    // Handle any errors and send an error response
    console.error (err);
    res.status (500).json ({message: 'Something went wrong'});
  }
});

// GET USER
router.get ('/find/:id', verifyTokenAndAdmin, async (req, res) => {
  try {
    // Find the user by ID and exclude the password from the response
    const user = await User.findById (req.params.id).select ('-password');
    res.status (200).json (user);
  } catch (err) {
    // Handle any errors and send an error response
    console.error (err);
    res.status (500).json ({message: 'Something went wrong'});
  }
});

// GET ALL USERS (ADMIN)
router.get ('/', verifyTokenAndAdmin, async (req, res) => {
  const query = req.query.new;
  try {
    let users;
    if (query) {
      // Get the newest 5 users
      users = await User.find ().sort ({_id: -1}).limit (5);
    } else {
      // Get all users
      users = await User.find ();
    }
    res.status (200).json (users);
  } catch (err) {
    // Handle any errors and send an error response
    console.error (err);
    res.status (500).json ({message: 'Something went wrong'});
  }
});

// GET USER STATS (ADMIN)
router.get ('/stats', verifyTokenAndAdmin, async (req, res) => {
  const today = new Date ();
  const lastYear = today.setFullYear (today.getFullYear () - 1);

  try {
    // Aggregate user statistics by month
    const data = await User.aggregate ([
      {
        $project: {
          month: {$month: '$createdAt'},
        },
      },
      {
        $group: {
          _id: '$month',
          total: {$sum: 1},
        },
      },
    ]);
    res.status (200).json (data);
  } catch (err) {
    // Handle any errors and send an error response
    console.error (err);
    res.status (500).json ({message: 'Something went wrong'});
  }
});

module.exports = router;
