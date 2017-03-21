var express = require('express');
var router = express.Router();

const ensureAuthenticated = require('../lib/auth').ensureAuthenticated;

let Question = require('../models/question');

router.get('/add', (req, res, next) => {
    res.render('add');
});

router.post('/add', (req, res, next) => {
    const questionIn = req.body.question;
    const answer = req.body.answer;
    const category = req.body.category;

   
    Question.checkQuestion(questionIn, (err, question) =>{
        if (err) throw err;
    if (question != null) {
        req.flash('error_msg', "Question already exists.");
        res.redirect('/question/add');
    } 
    else {
        const newQuestion = new Question({
        question: questionIn,
        answer: answer,
        category: category });
        
            Question.addQuestion(newQuestion, (err, question)=> {
                if (err) throw err;
                req.flash('success_msg', 'Question is added.');
                res.redirect('/question/add');
            });
    }
    });
    
});

module.exports = router;