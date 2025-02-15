// const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const { store } = require('./config');

// store.users = store.users || [];

// passport.serializeUser((user, done) => done(null, user.id));
// passport.deserializeUser((id, done) => {
//   const user = store.users.find(u => u.id === id);
//   done(null, user);
// });

// passport.use(new GoogleStrategy({
//   clientID: process.env.GOOGLE_CLIENT_ID,
//   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//   callbackURL: '/api/auth/google/callback'
// }, (accessToken, refreshToken, profile, done) => {
//   let user = store.users.find(u => u.id === profile.id);
//   if (!user) {
//     user = { id: profile.id, displayName: profile.displayName, emails: profile.emails };
//     store.users.push(user);
//   }
//   done(null, user);
// }));
