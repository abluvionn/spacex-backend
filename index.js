import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import mongoose from 'mongoose';
import config from './config.js';

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(upload.none());

app.get('/api', (_req, res) => {
  res.send({ message: 'Welcome to the SpaceX backend API' });
});
app.use('/api/auth', (await import('./routes/auth.js')).default);
app.use(
  '/api/applications',
  (await import('./routes/applications.js')).default
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
