// Simple HOWTO by Dax Kelson
//
// To protect a route, at the top of the route add the line 
// const ensureAuthenticated = require('../lib/auth').ensureAuthenticated;
// then insert a new second parameter to router.get(), eg:
// router.get('/uri', ensureAuthenticated, (req, res, next) => {
//
// If you need to call a passport function directly, then at the top
// of the file use:
// const passport = require('../lib/auth').passport;

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

let User = require('../models/user');

// Local Passport Strategy
passport.use(new LocalStrategy((username, password, done) => {

    User.getUserByUsername(username, (err, user) => {
        if (err) throw err;

        if (!user) {
            return done(null, false, {
                message: 'Username or password does not match'
            });
        }

        User.comparePassword(password, user.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
                return done(null, user);
            } else {
                return done(null, false, {
                    message: 'Username or password does not match'
                });
            }
        });
    });
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.getUserById(id, (err, user) => {
        done(err, user);
    });
});

// Access Control
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash('error', 'You are not authorized to view that page')
        res.redirect('/users/login');
    }
}

module.exports.ensureAuthenticated = ensureAuthenticated;
module.exports.passport = passport;