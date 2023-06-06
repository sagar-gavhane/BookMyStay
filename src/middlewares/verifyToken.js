const jwt = require('jsonwebtoken');

const jwtSecretKey = '~&VV^;WhENo^"^Q';

const verifyToken = (req, res, next) => {
  const token = req.headers['x-access-token'];

  if (!token) {
    return res
      .status(403)
      .send({ message: 'A token is required for authentication', data: null });
  }

  try {
    const decoded = jwt.verify(token, jwtSecretKey);

    req.auth = {
      user: {
        id: decoded.user.id,
        email: decoded.user.email,
      },
    };
  } catch (err) {
    return res.status(401).send({ message: 'Invalid Token', data: null });
  }

  return next();
};

module.exports = verifyToken;
