$(function() {
    var $rooms = $('.rooms');
    var $user = $('.userName');

    var $room = $('#room');

    var $roomPage = $('.roomPage');
    var $startPage = $('.startPage');
    var $createRoomPage = $('.createRoomPage');
    var $chooseQuestions = $('.chooseQuestions');
    var $sendAnswerPage = $('.answerQuestion');
    var $selectAnswerPage = $('.answersPage');
    var $reviewAnswersPage = $('.reviewAnswers');

    var $btnNewGame = $('#newGameButton');

    var $btnNewRoom = $('#newRoomButton');

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

    var $questionTitle = $('.questionTitle');

    var $roomTitle = $('.roomTitle');

    var $btnChooseAnswer = $('.selectedAnswer')

    $roomPage.hide();
    $createRoomPage.hide();
    $chooseQuestions.hide();
    $sendAnswerPage.hide();
    $selectAnswerPage.hide();
    $reviewAnswersPage.hide();

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
        socket.emit('createRoom', room, players, rounds, "Definitions");
        $room.val(room);
        $createRoomPage.hide();
        $startPage.show();
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

    //When you join a room you see a list of the players that have joined (and probably need to add how many are left to join).
    socket.on('joinedRoom', function(players) {
        $startPage.hide();
        $roomPage.show();
        $roomTitle.text(players);
    });

    //called when a round is started and the host is choosing the question for the round.
    socket.on('waitingOnQuestion', function() {
        $startPage.hide();
        $roomPage.show();
        $reviewAnswersPage.hide();
        $roomTitle.text('Waiting for question to be chosen');
    });

    //called when a round is started and you are the host. It displays "questions" as buttons to choose from
    socket.on('sendQuestions', function(questions) {
        $startPage.hide();
        $roomPage.hide();
        $reviewAnswersPage.hide();
        $chooseQuestions.show();
        $.each(questions, function(index, value){
            var btn= $('<input type="button" value="'+value+'" class="btnQuestions"/>');
            $chooseQuestions.append(btn);
        })
    });
    //Helper function that allows the dynamically created buttons to have an onClick function.
    $chooseQuestions.on('click', '.btnQuestions', function(){
        socket.emit('selectedQuestion', $room.val(), this.value);
    });

    //called after a question is selected shows the question and an answer field
    socket.on('sendSelectedQuestion', function(question){
        $chooseQuestions.hide();
        $roomPage.hide();
        $sendAnswerPage.show();
        $chosenQuestion.text(question);
    });

    //Called when you have submitted an answer and are waiting for the rest of the users to answer
    socket.on('waitingForAnswers', function() {
        $sendAnswerPage.hide();
        $roomPage.show();
        $roomTitle.text('Waiting for answers to be submitted');
    });

    //When the answers have all been submitted this is called a creats a button for all the answers submitted to choose from
    socket.on('sendAnswers', function(answers, question){
        $startPage.hide();
        $sendAnswerPage.hide();
        $roomPage.hide();
        $selectAnswerPage.show();
        $questionTitle.text(question);
        $.each(answers, function(index, value){
            var btn= $('<input type="button" value="'+value+'" class="selectedAnswer"/>');
            $selectAnswerPage.append(btn);
        })
    });
    //Helper function to allow the dynamically created buttons to have an onclick function
    $selectAnswerPage.on('click', '.selectedAnswer', function(){
        socket.emit('choseAnswer', $room.val(), this.value);
    });

    //Function called when you have selected the answer you think is right and are waiting for the other players to do the same.
    socket.on('waitingForChosenAnswers', function() {
        $selectAnswerPage.hide();
        $roomPage.show();
        $roomTitle.text('Waiting for answers to be chosen');
    });

    //Called when everyone has selected the answer they think is right and shows everyone's chosen answers and points
    socket.on('chosenAnswers', function(chosenAnswers, playerScores){
        $selectAnswerPage.hide();
        $roomPage.hide();
        $reviewAnswersPage.show();
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
        $reviewAnswersPage.empty();
        $inpMyAnswer.val('');
        
    });

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
    })

});