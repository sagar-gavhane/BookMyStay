const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers['x-access-token'];

  if (!token) {
    return res
      .status(403)
      .send({ message: 'A token is required for authentication', data: null });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    req.auth = {
      user: {
        user_id: decoded.user.user_id,
        email: decoded.user.email,
      },
    };
  } catch (err) {
    return res.status(401).send({ message: 'Invalid Token', data: null });
  }

  return next();
};

module.exports = verifyToken;
