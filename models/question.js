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

module.exports.getQuestions = function(callback){
    Question.find(callback).sort([['question', 'ascending']]);
}

//get single question
module.exports.getQuestionById = function(id, callback){
    Question.findById(id, callback);
}


module.exports.updateQuestion = function (query, update, options, callback) {
    Question.findOneAndUpdate(query, update, options, callback);
}