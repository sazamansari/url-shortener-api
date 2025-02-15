import express from 'express';
// const passport = require('passport');
// const session = require('express-session');
// require('./auth/passport-setup');
import useragent from 'express-useragent';

const app = express();

app.use(express.json());
app.use(useragent.express());
// app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));
// app.use(passport.initialize());
// app.use(passport.session());

import urlRoutes from './routes/urlRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
// import authRoutes from './routes/authRoutes.js';

app.get('/', (req, res) => {
  res.send('URL Shortener API');
});

app.use('/api/url', urlRoutes);
app.use('/api/analytics', analyticsRoutes);
// app.use('/api/auth', authRoutes);

app.listen(3000, () => console.log('Server running on port 3000'));
