const express = require('express');
const passport = require('passport');
const session = require('express-session');
require('./passport-setup');
const useragent = require('express-useragent');
const app = express();

app.use(express.json());
app.use(useragent.express());
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

const urlRoutes = require('./routes/urlRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const authRoutes = require('./routes/authRoutes');

app.get('/', (req, res) => {
  res.send('URL Shortener API');
});

app.use('/api/url', urlRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/auth', authRoutes);

app.listen(3000, () => console.log('Server running on port 3000'));
