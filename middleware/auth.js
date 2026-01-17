import jwt from 'jsonwebtoken';

export const verifyAccessToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).send({ error: 'Access token is missing' });
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).send({ error: 'Access token expired' });
    }
    return res.status(401).send({ error: 'Invalid access token' });
  }
};

export const verifyRefreshToken = (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).send({ error: 'Refresh token is missing' });
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).send({ error: 'Refresh token expired' });
    }
    return res.status(401).send({ error: 'Invalid refresh token' });
  }
};
