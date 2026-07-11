const path = require('path');
const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const bouquetsRouter = require('./routes/bouquets.routes');
const formsRouter = require('./routes/orders.routes');
const feedbacksRouter = require('./routes/feedbacks.routes');
const setupSwagger = require('./docs/swagger');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.use(cors({ origin: env.clientOrigin === '*' ? true : env.clientOrigin }));
app.use(express.json());
app.use('/photos', express.static(path.join(process.cwd(), 'public/photos')));

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'flora-backend' });
});

app.use('/api/bouquets', bouquetsRouter);
app.use('/api/feedbacks', feedbacksRouter);
app.use('/api', formsRouter);
setupSwagger(app);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
