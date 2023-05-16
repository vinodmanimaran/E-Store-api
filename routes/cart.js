const Cart = require('../models/Cart');
const Product = require('../models/Cart');
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require('../verifyToken');

const router = require('express').Router();

/**
 * CREATE a new Cart
 * POST /api/carts/
 * Requires user authentication
 */
router.post('/', verifyToken, async (req, res) => {
  const newCart = new Cart(req.body);

  try {
    const savedCart = await newCart.save();
    res.status(200).json(savedCart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create cart' });
  }
});

/**
 * UPDATE a cart
 * PUT /api/carts/:id
 * Requires user authentication and authorization
 */
router.put('/:id', verifyTokenAndAuthorization, async (req, res) => {
  try {
    const updatedCart = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedCart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update cart' });
  }
});

/**
 * DELETE a cart
 * DELETE /api/carts/:id
 * Requires user authentication and authorization
 */
router.delete('/:id', verifyTokenAndAuthorization, async (req, res) => {
  try {
    await Cart.findByIdAndDelete(req.params.id);
    res.status(200).json('Cart has been deleted');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete cart' });
  }
});

/**
 * GET a specific cart by user ID
 * GET /api/carts/find/:userid
 * Requires user authentication and authorization
 */
router.get('/find/:userid', verifyTokenAndAuthorization, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userid: req.params.userid });
    res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve cart' });
  }
});

/**
 * GET all carts
 * GET /api/carts/
 * Requires admin privilege
 */
router.get('/', verifyTokenAndAdmin, async (req, res) => {
  try {
    const carts = await Cart.find();
    res.status(200).json(carts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve carts' });
  }
});

module.exports = router;
