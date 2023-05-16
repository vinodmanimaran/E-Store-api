const jwt = require("jsonwebtoken");

/**
 * Middleware to verify the token in the request header.
 * If the token is valid, it sets the user object in the request and calls the next middleware.
 * Otherwise, it returns an error response.
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.token;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SEC, (err, user) => {
      if (err) {
        // Token verification failed
        console.error("Token verification error:", err);
        return res.status(403).json({ error: "Token is not valid!" });
      }
      req.user = user;
      next();
    });
  } else {
    // Token not found in the header
    return res.status(401).json({ error: "You are not authenticated!" });
  }
};

/**
 * Middleware to verify token and authorization.
 * It first verifies the token using the `verifyToken` middleware,
 * then checks if the user is authorized based on their ID or admin status.
 * If authorized, it calls the next middleware. Otherwise, it returns an error response.
 */
const verifyTokenAndAuthorization = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.id === req.params.id || req.user.isAdmin) {
      next();
    } else {
      res.status(403).json({ error: "You are not allowed to do that!" });
    }
  });
};

/**
 * Middleware to verify token and admin status.
 * It first verifies the token using the `verifyToken` middleware,
 * then checks if the user is an admin.
 * If the user is an admin, it calls the next middleware. Otherwise, it returns an error response.
 */
const verifyTokenAndAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.isAdmin) {
      next();
    } else {
      res.status(403).json({ error: "You are not allowed to do that!" });
    }
  });
};

module.exports = {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
};
