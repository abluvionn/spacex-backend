import express from 'express';
const app = express();

app.use(express.json());

app.get('/api', (_req, res) => {
  res.json({ message: 'Welcome to the SpaceX backend API' });
});

app.use((_req, res, _next) => {
  res.status(404).json({ error: 'Not Found' });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res
    .status(err.status || 500)
    .json({ error: err.message || 'Internal Server Error' });
});

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Server listening on port ${port}`));

export default app;
