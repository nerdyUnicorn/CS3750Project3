const mongoose = require('mongoose');
    const gameschema = mongoose.Schema({
            roomName: {
                type: String
            },
            whoPlayed: {
                type: [String]
            },
            whoWon: {
                type: String
            },
            numOfQuestions: {
                type: int
            },
            scoresForPlayer: {
                type: [int]
            },
            numOfRounds: {
                type: int
            },
            Created_at: {
                type: Date,
                default: Date.now
            },
    })
    
    module.exports.saveGame = function (newGame, callback){
        newGame.save(callback);
    }

    