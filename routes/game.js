var express = require('express');
var router = express.Router();

const ensureAuthenticated = require('../lib/auth').ensureAuthenticated;

// Game Page
router.get('/', ensureAuthenticated, (req, res, next) => {
    res.render('game');
});


router.get('/end', ensureAuthenticated, (req, res, next) => {


res.render('end');

});

router.post('/end', ensureAuthenticated, (req, res, next) => {
    const roomName = req.body.roomName;
    const scores = req.body.scores;
    const whoPlayed = req.body.whoPlayed;
    const whoWon = req.body.whoWon;
    const numOfQuestions = req.body.numOfQuestions;
    const scoresForPlayer = req.body.scoresForPlayer;
    const numOfRounds = req.body.numOfRounds;

   

    const newGame = new newGame({
        roomName: roomName,
        scores: scores,
        whoPlayed: whoPlayed,
        whoWon: whoWon,
        numOfQuestions: numOfQuestions,
        scoresForPlayer: scoresForPlayer,
        numOfRounds: numOfRounds
    });

     game.saveGame(newGame);
});
module.exports = router;
