const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
require('dotenv').config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3999/auth/google/callback",
    passReqToCallback: true,
},

    function (request, accessToken, refreshToken, profile, done) {
        // console.log(request);
        // console.log(accessToken);
        // console.log(refreshToken);
        // console.log(profile);
        // console.log(done);
        return done(null, profile,request,accessToken,refreshToken);
    }));

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});