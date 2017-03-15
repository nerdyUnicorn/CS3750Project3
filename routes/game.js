var express = require('express');
var router = express.Router();

const ensureAuthenticated = require('../lib/auth').ensureAuthenticated;

// Game Page
router.get('/', ensureAuthenticated, (req, res, next) => {
    var params = {title: "Game Page", user: req.user.username}
    res.render('game', params);
});

module.exports = router;
