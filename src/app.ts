import express from 'express';
import morgan from 'morgan';
import { errorMiddleware } from './middlewares/error.middleware.js';

const app: express.Application = express();

app.use(morgan('combined'));

app.get('/', (_req, res) => {
  res.send('Hello, World!');
});

app.use(errorMiddleware);

export default app;
