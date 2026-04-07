import { configDotenv } from 'dotenv';

configDotenv({ path: '.env' });

const config = {
  port: (process.env['PORT'] && parseInt(process.env['PORT'])) || '8000',
  mongoose: {
    db: process.env['MONGO_DB_URL'] || 'mongodb://127.0.0.1:27017/spacex',
  },
  admin: {
    email: process.env['ADMIN_EMAIL'] || '',
    password: process.env['ADMIN_PASSWORD'] || '',
  },
  gmail: {
    user: process.env['GMAIL_USER'] || '',
    pass: process.env['GMAIL_PASS'] || '',
  },
  IpWhiteList: ['http://localhost:3000', process.env['ALLOWED_ORIGIN']],
  JwtAccessSecret: process.env['JWT_ACCESS'] || '',
  JwtRefreshSecret: process.env['JWT_REFRESH'] || '',
  JwtAccessExpiresAt: 15, // 15 minutes
  JwtRefreshExpiresAt: 720, // 720 hours = 30 days
};

export default config;
