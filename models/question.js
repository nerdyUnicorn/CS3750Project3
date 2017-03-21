const mongoose = require('mongoose');

// Question Schema
const QuestionSchema = mongoose.Schema({
    question: {
        type: String
    },
    answer: {
        type: String
    },
    category: {
        type: String
    },
    created_at: {
        type: Date,
        default: Date.now
    },
});

const Question = module.exports = mongoose.model('Question', QuestionSchema);

module.exports.addQuestion = function (newQuestion, callback) {
            newQuestion.save(callback);
}

module.exports.checkQuestion = function (questionIn, callback) {
    const question = { question: questionIn};
    Question.findOne(question, callback);
}