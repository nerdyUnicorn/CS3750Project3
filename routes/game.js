var express = require('express');
var router = express.Router();

const ensureAuthenticated = require('../lib/auth').ensureAuthenticated;

// Game Page
router.get('/', ensureAuthenticated, (req, res, next) => {
    res.render('game');
});

module.exports = router;