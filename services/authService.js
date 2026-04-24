import jwt from 'jsonwebtoken';
import config from '../config.js';

export const generateTokens = (adminId) => {
  const accessToken = jwt.sign({ adminId }, config.JwtAccessSecret, {
    expiresIn: `${config.JwtAccessExpiresAt}m`,
  });

  const refreshToken = jwt.sign({ adminId }, config.JwtRefreshSecret, {
    expiresIn: `${config.JwtRefreshExpiresAt}h`,
  });

  return { accessToken, refreshToken };
};
