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

module.exports.getDefinitions = function(callback) {
   /* Question.aggregate([{ 
        $match: {
            category: 'Definitions'
        }},{
            $sample: {
            size: Number() 
        }
    }],*/
    Question.find({
            category: 'Definitions'
    },
    function (err, result) {
        if (err) {
            console.log(err);
            return;
        }
        console.log(result);
        callback(result);} 
        
    );
}

module.exports.getAcronyms = function(callback) {
    Question.find({
            category: 'Acronyms'
    },
    function (err, result) {
        if (err) {
            console.log(err);
            return;
        }
        console.log(result);
        callback(result);} 
    );
}
module.exports.getFamousPeople = function(callback) {
    Question.find({
            category: 'Famous People'
    },
    function (err, result) {
        if (err) {
            console.log(err);
            return;
        }
        console.log(result);
        callback(result);} 
    );
}
module.exports.getLudicrousLaws = function(callback) {
    Question.find({
            category: 'Ludicrous Laws'
    },
    function (err, result) {
        if (err) {
            console.log(err);
            return;
        }
        console.log(result);
        callback(result);} 
    );
}
module.exports.getMovieHeadlines = function(callback) {
    Question.find({
            category: 'Movie Headlines'
    },
    function (err, result) {
        if (err) {
            console.log(err);
            return;
        }
        console.log(result);
        callback(result);} 
    );
}

module.exports.checkQuestion = function (questionIn, callback) {
    const question = { question: questionIn};
    Question.findOne(question, callback);
}