import jwt from 'jsonwebtoken';
import config from '../config.js';

export const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, config.JwtAccessSecret, {
    expiresIn: `${config.JwtAccessExpiresAt}m`,
  });

  const refreshToken = jwt.sign({ userId }, config.JwtRefreshSecret, {
    expiresIn: `${config.JwtRefreshExpiresAt}h`,
  });

  return { accessToken, refreshToken };
};
