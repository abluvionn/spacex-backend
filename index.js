import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import config from './config.js';
import { rateLimit } from 'express-rate-limit';

const app = express();
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // limit each IP to 100 requests per windowMs
});

app.use(limiter);
app.use(express.json());
app.use(cors({ origin: config.IpWhiteList, credentials: true }));
app.use(cookieParser());

app.get('/api', (_req, res) => {
  res.send({ message: 'Welcome to the SpaceX backend API' });
});
app.use('/api/auth', (await import('./routes/auth.js')).default);
app.use('/api/driver/auth', (await import('./routes/driverAuth.js')).default);
app.use(
  '/api/driver/applications',
  (await import('./routes/driverApplications.js')).default,
);
app.use(
  '/api/driver/knowledge-test',
  (await import('./routes/knowledgeTest.js')).default,
);
app.use(
  '/api/userApplications',
  (await import('./routes/userApplications.js')).default,
);
app.use('/api/docs', (await import('./swagger.js')).default);

app.use((_req, res, _next) => {
  res.status(404).send({ error: 'Not Found' });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res
    .status(err.status || 500)
    .send({ error: err.message || 'Internal Server Error' });
});

const run = async () => {
  try {
    await mongoose.connect(config.mongoose.db);
    console.log('MongoDB connected');

    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  } catch (err) {
    console.error('Startup error:', err);
    process.exit(1);
  }
};

run();
