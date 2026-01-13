import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import config from './config.js';

const app = express();

app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.get('/api', (_req, res) => {
  res.send({ message: 'Welcome to the SpaceX backend API' });
});

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
