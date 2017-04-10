$(function() {
    var $rooms = $('.rooms');
    var $user = $('.userName');

    var $room = $('#room');
    var $roomName = $('#roomNameTitle');
    var $roomNamePage = $('.roomName');

    var $roomPage = $('.roomPage');
    var $startPage = $('.startPage');
    var $createRoomPage = $('.createRoomPage');
    var $chooseQuestions = $('.chooseQuestions');
    var $sendAnswerPage = $('.answerQuestion');
    var $selectAnswerPage = $('.answersPage');
    var $reviewAnswersPage = $('.reviewAnswers');
    var $endGamePage = $('.endGame')
    var $loading = $('.loading');

    var $btnNewGame = $('#newGameButton');
    var $inpDefinitions = $('#definitions');
    var $inpFamousPeople = $('#famousPeople');
    var $inpLudicrousLaws = $('#ludicrousLaws');
    var $inpAcronyms = $('#acronyms');
    var $inpMovieHeadlines = $('#movieHeadlines');
    var $inpAllCategories = $('#allCategories');

    var $startError = $('.startError');
    var $createRoomError = $('.createRoomError');

    var $btnNewRoom = $('#newRoomButton');

    var $timer = $('.timer');

    var $inpNewRoom = $('#newNameText');
    var $inpNewPlayers = $('#newPlayersText');
    var $inpNewRounds = $('#newRoundsText');

    var $btnJoinRoom = $('#joinRoomButton');
    var $inpJoinRoom = $('#joinRoomText');

    var $btnSeeRooms = $('#seeRoomsButton');

    var $btnQuestions = $('#btnQuestions');

    var $btnSendMyAnswer = $('#sendMyAnswer');
    var $inpMyAnswer = $('.myAnswer');
    var $chosenQuestion = $('.chosenQuestion');

    var $finalScores = $('.finalScores');
    var $gameWinner = $('.gameWinner');
    var $btnRestartGame = $('#restartGame');

    var $questionTitle = $('.questionTitle');

    var $roomTitle = $('.roomTitle');

    var $btnChooseAnswer = $('.selectedAnswer')

    var chooseQuestionTime = 10;
    var makeUpAnswerTime = 15;

    var intervalCountdown = null;

    //$roomPage.hide();
    $createRoomPage.hide();
    $chooseQuestions.hide();
    $sendAnswerPage.hide();
    $selectAnswerPage.hide();
    $reviewAnswersPage.hide();
    $roomNamePage.hide();
    $endGamePage.hide();
    $loading.hide();

    var socket = io();

    function newGame(){
        $startPage.hide();
        $createRoomPage.show();
    }

    function getRooms(){
        socket.emit('getRooms');
    }

    function sendQuestion(question){
        socket.emit('selectedQuestion', $room.val(), question);
    }

    function createRoom(){
        var room = $inpNewRoom.val()
        var players = $inpNewPlayers.val()
        var rounds = $inpNewRounds.val()
        var categories = [];
        if($inpAllCategories.is(':checked')){
            categories.push('Definitions', 'Famous People', 'Acronyms', 'Movie Headlines', 'Ludicrous Laws');
        }
        else{
            if($inpDefinitions.is(':checked')){
                categories.push($inpDefinitions.val());
            }
            if($inpFamousPeople.is(':checked')){
                categories.push($inpFamousPeople.val());
            }
            if($inpLudicrousLaws.is(':checked')){
                categories.push($inpLudicrousLaws.val());
            }
            if($inpMovieHeadlines.is(':checked')){
                categories.push($inpMovieHeadlines.val());
            }
            if($inpAcronyms.is(':checked')){
                categories.push($inpAcronyms.val());
            }
        }
        socket.emit('createRoom', room, players, rounds, categories);
        $room.val(room);
        //$createRoomPage.hide();
        //$startPage.show();
    }

    function joinRoom(){
        var room = $inpJoinRoom.val()
        var user = $user.val();
        $room.val(room);
        socket.emit('joinRoom', room, user)
    }

    //Not called because we don't join a room by clicking on it, we enter it in.
    socket.on('returnRooms', function (rooms) {
        $.each( rooms, function( index, value ){
            var $btnDiv = $('<button class="roomButtons"/>')
                .text(value)
            $rooms.append($btnDiv)
        });
    });

    socket.on('roomAlreadyExists', function (exampleRoom){
        $createRoomError.text('That game already exists. Try another one like ' + exampleRoom);
    });

    socket.on('createRoomErrors', function(problems){
        $createRoomError.text(problems);
    });

    socket.on('noSuchRoom', function(){
        $startError.text('There is no game with that name.');
    })

    //When you join a room you see a list of the players that have joined (and probably need to add how many are left to join).
    socket.on('joinedRoom', function(players, room) {
        $createRoomPage.hide();
        $loading.show();
        $startPage.hide();
        $room.val(room);
        $roomName.text('Your game name is ' + room);
        $roomNamePage.show();
        if(players.length < 2){
            $roomTitle.text('You joined the game! \n'+players + ' has joined the game so far.');
        }
        else{
            var playersString = ''
            for(var p in players){
                playersString = playersString + players[p] +', '
            }
            playersString = playersString.substring(0, playersString.length-2);
            $roomTitle.text('You joined the game! \n'+ playersString + ' have joined the game so far.');
        }
    });

    //called when a round is started and the host is choosing the question for the round.
    socket.on('waitingOnQuestion', function() {
        $startPage.hide();
        $endGamePage.hide();
        $createRoomPage.hide();
        $reviewAnswersPage.hide();
        $roomNamePage.hide();
        $loading.show();
        $roomTitle.text('Waiting for the host to choose a question for this round ...');
    });

    //called when a round is started and you are the host. It displays "questions" as buttons to choose from
    socket.on('sendQuestions', function(questions) {
        $startPage.hide();
        $loading.hide();
        $createRoomPage.hide();
        $endGamePage.hide();
        $reviewAnswersPage.hide();
        $chooseQuestions.show();
        $roomNamePage.hide();
        $roomTitle.text('Choose a question for this round!')
        var lastQuestion = '';
        $.each(questions, function(key, value){
            var cat = $('<h3 class="category">'+key+'</h3>');
            $chooseQuestions.append(cat);
            var btn = $('<input type="button" value="'+value+'" class="btnQuestions btn btn-success"/>');
            $chooseQuestions.append(btn);
            lastQuestion = value;
        })
        chooseQuestionCountdown(lastQuestion);
        intervalCountdown = setInterval(function() {                   
            chooseQuestionCountdown(lastQuestion);
        }, 1000);
    });
    //Helper function that allows the dynamically created buttons to have an onClick function.
    $chooseQuestions.on('click', '.btnQuestions', function(){
        socket.emit('selectedQuestion', $room.val(), this.value);
        clearInterval(intervalCountdown);
        chooseQuestionTime = 10;
        $timer.text('');
    });

    //called after a question is selected shows the question and an answer field
    socket.on('sendSelectedQuestion', function(question){
        $chooseQuestions.hide();
        $sendAnswerPage.show();
        $loading.hide();
        $chosenQuestion.text(question);
        $roomTitle.text('Make up an answer for the the question!')
        makeUpAnswerCountdown();
        intervalCountdown = setInterval(function() {                   
            makeUpAnswerCountdown();
        }, 1000);
    });

    //Called when you have submitted an answer and are waiting for the rest of the users to answer
    socket.on('waitingForAnswers', function() {
        $sendAnswerPage.hide();
        $loading.show();
        $roomTitle.text('Waiting for everyone to make up an answer ...');
    });

    //When the answers have all been submitted this is called a creats a button for all the answers submitted to choose from
    socket.on('sendAnswers', function(answers, question){
        $startPage.hide();
        $sendAnswerPage.hide();
        $loading.hide();
        $selectAnswerPage.show();
        $questionTitle.text(question);
        $roomTitle.text('Choose the answer that you think is correct!')
        var lastAnswer = '';
        $.each(answers, function(index, value){
            var btn= $('<input type="button" id="'+value+'" class="selectedAnswer btn btn-success" style="padding:25px; margin:10px;" value="'+value.toUpperCase()+'"/>');
            $selectAnswerPage.append(btn);
            lastAnswer = value;
        })
        chooseAnswerCountdown(lastAnswer);
        intervalCountdown = setInterval(function() {                   
            chooseAnswerCountdown(lastAnswer);
        }, 1000);
    });
    //Helper function to allow the dynamically created buttons to have an onclick function
    $selectAnswerPage.on('click', '.selectedAnswer', function(){
        socket.emit('choseAnswer', $room.val(), this.id);
        clearInterval(intervalCountdown);
        chooseAnswerTime = 15
        $timer.text('');
    });

    //Function called when you have selected the answer you think is right and are waiting for the other players to do the same.
    socket.on('waitingForChosenAnswers', function() {
        $selectAnswerPage.hide();
        $loading.show();
        $roomTitle.text('Waiting for everyone to pick the answer they think is right ...');
    });

    //Called when everyone has selected the answer they think is right and shows everyone's chosen answers and points
    socket.on('chosenAnswers', function(chosenAnswers, playerScores){
        $selectAnswerPage.hide();
        $reviewAnswersPage.show();
        $loading.hide();
        $roomTitle.text('This rounds results:')
        $.each(chosenAnswers, function(key, value){
            var answerChosen= $('<h3 class="userAnswers">'+key+' chose: '+value+'</>');
            $reviewAnswersPage.append(answerChosen);
        })
        $.each(playerScores, function(key, value){
            var playerScore= $('<h3 class="playerScores">'+key+' has a score of: '+value+' points</>');
            $reviewAnswersPage.append(playerScore);
        })
    });

    //called after some time of seeing answers and points to empty the "pages" of last rounds information.
    socket.on('newRound', function(){
        $( "input" ).remove( ".btnQuestions" );
        $( "input" ).remove( ".selectedAnswer" );
        $chooseQuestions.empty();
        $reviewAnswersPage.empty();
        $inpMyAnswer.val('');
        
    });

    socket.on('endGame', function(scores){
        $finalScores.empty();
        $reviewAnswersPage.hide();
        $( "input" ).remove( ".btnQuestions" );
        $( "input" ).remove( ".selectedAnswer" );
        $chooseQuestions.empty();
        $reviewAnswersPage.empty();
        $inpMyAnswer.val('');
        $endGamePage.show();
        $roomTitle.text('Game Ended!!!')
        $gameWinner.text(scores[0][0]+' won the game!!!');
        $.each(scores, function(key, value){
            var finalScore= $('<h3 class="userAnswers">'+value[0]+'\'s final score: '+value[1]+'</h3>');
            $finalScores.append(finalScore);
        })
    })

    $btnRestartGame.click(function(){
        $gameWinner.text('');
        $endGamePage.hide();
        socket.emit('restartGame', $room.val());
    })

    $btnNewGame.click(function(){
        newGame();
    });

    $btnNewRoom.click(function(){
        //$user.text("Working")
        createRoom();
    });

    $btnJoinRoom.click(function(){
        joinRoom();
    });

    $btnSeeRooms.click(function(){
        getRooms();
    })

    $btnQuestions.click(function(){
        socket.emit('selectedQuestion', $room.val(), $btnQuestions.text());
    })

    $btnSendMyAnswer.click(function(){
        socket.emit('answerQuestion', $room.val(), $inpMyAnswer.val());
        clearInterval(intervalCountdown);
        makeUpAnswerTime = 15;
        $timer.text('');
    })

    function chooseQuestionCountdown(question){
        chooseQuestionTime--;
        $timer.text('Time Remaining: ' + chooseQuestionTime);
        if(chooseQuestionTime < .1){
            clearInterval(intervalCountdown);
            chooseQuestionTime = 15;
            $timer.text('');
            socket.emit('selectedQuestion', $room.val(), question);
        }
    }

    function makeUpAnswerCountdown(){
        makeUpAnswerTime--;
        $timer.text('Time Remaining: ' + makeUpAnswerTime);
        if(makeUpAnswerTime < .1){
            clearInterval(intervalCountdown);
            makeUpAnswerTime = 15;
            $timer.text('');
            socket.emit('answerQuestion', $room.val(), 'Nothing');
        }
    }

    function chooseAnswerCountdown(answer){
        chooseAnswerTime--;
        $timer.text('Time Remaining: ' + chooseAnswerTime);
        if(chooseAnswerTime < .1){
            clearInterval(intervalCountdown);
            chooseAnswerTime = 15;
            $timer.text('');
            socket.emit('choseAnswer', $room.val(), answer);
        }
    }

});
