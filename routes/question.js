var express = require('express');
var router = express.Router();

const ensureAuthenticated = require('../lib/auth').ensureAuthenticated;

let Question = require('../models/question');

//get the add question page
router.get('/add', (req, res, next) => {
    Question.getQuestions((err, questions) => {
        if(err){
            res.send(err);
        }
        res.render('add', {
            questions: questions
        });
    });
});

//send the information to save in the db
router.post('/add', (req, res, next) => {
    const questionIn = req.body.question;
    const answer = req.body.answer;
    const category = req.body.category;
   
    req.checkBody('questionIn', 'Question field is required').notEmpty();
    req.checkBody('answer', 'Answer field is required').notEmpty();

    let errors = req.validationErrors();

    if (errors){
        req.flash('error_msg', "Neither field may be blank");
        res.redirect('/question/add');
    } else {

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
    }
});

//get the edit page by the question id
router.get('/edit/:id', (req, res, next) => {
    Question.getQuestionById(req.params.id, (err, question) => {
        if (err) throw err;
        else{
            res.render('edit', {
             title: 'Edit Question',
             question: question
            });
        }
    })
    
});

//save the update to the question
router.post('/edit/:id', (req, res, next)=> {
    let question = new Question();
    const query = {_id: req.params.id}
    const update = {question: req.body.question, answer: req.body.answer, category: req.body.category}

    req.checkBody('question', 'Question field is required').notEmpty();
    req.checkBody('answer', 'Answer field is required').notEmpty();

    let errors = req.validationErrors();

    if (errors){
        req.flash('error_msg', "Neither field may be blank");
        res.redirect('/question/edit/'+query._id);
    }
    else{
        Question.updateQuestion(query, update, {}, (err, question) => {
            if(err) throw err;
            req.flash('success_msg', 'Question is updated.');
            res.redirect('/question/edit/'+question._id);
        });
    }
})

module.exports = router;