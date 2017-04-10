const mongoose = require('mongoose');

// End of Game Schema
const GameSchema = mongoose.Schema({
    GameName: {
        type: String
    },
    Winner: {
        type: String
    },
    TotalQuestions: {
        type: Number
    },
    Scores: {
        type: Object
    },
    Players: {
        type: [String]
    },
    Rounds: {
        type: Number
    },
    GameEndTime: {
        type: Date,
        default: Date.now
    },
});

const Game = module.exports = mongoose.model('Game', GameSchema);

module.exports.saveEndGame = function (newGame, callback) {
            newGame.save(callback);
}