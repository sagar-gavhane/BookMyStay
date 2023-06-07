require('dotenv').config({ path: './src/.env' });
const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');

const authRoutes = require('./routes/auth-routes');
const userRoutes = require('./routes/user-routes');
const roomRoutes = require('./routes/room-routes');
const bookingRoutes = require('./routes/booking-routes');

const app = express();
const port = 3000;

app.use(helmet());
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', (_, res) => res.send('..'));
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', roomRoutes);
app.use('/api', bookingRoutes);

process.on('uncaughtException', (error) => {
  // eslint-disable-next-line no-console
  console.log('Uncaught exception occured. Stopping App because of', error);
  process.exit(0);
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`App is listening on port ${port}`);
});
