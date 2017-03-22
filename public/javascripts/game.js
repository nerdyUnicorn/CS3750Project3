$(function() {
    var $rooms = $('.rooms');
    var $user = $('.userName');

    var $roomPage = $('.roomPage');
    var $startPage = $('.startPage');
    var $createRoomPage = $('.createRoomPage');

    var $btnNewGame = $('#newGameButton');

    var $btnNewRoom = $('#newRoomButton');

    var $inpNewRoom = $('#newNameText');
    var $inpNewPlayers = $('#newPlayersText');
    var $inpNewRounds = $('#newRoundsText');

    var $btnJoinRoom = $('#joinRoomButton');
    var $inpJoinRoom = $('#joinRoomText');

    var $btnSeeRooms = $('#seeRoomsButton');

    var $roomTitle = $('.roomTitle');

    $roomPage.hide();
    $createRoomPage.hide();

    var socket = io();

    function newGame(){
        $startPage.hide();
        $createRoomPage.show();
    }

    function getRooms(){
        socket.emit('getRooms');
    }

    function createRoom(){
        var room = $inpNewRoom.val()
        var players = $inpNewPlayers.val()
        var rounds = $inpNewRounds.val()
        socket.emit('createRoom', room, players, rounds, "Definitions");
        $createRoomPage.hide();
        $startPage.show();
    }

    function joinRoom(){
        var room = $inpJoinRoom.val()
        var user = $user.val();
        socket.emit('joinRoom', room, user)
    }

    socket.on('returnRooms', function (rooms) {
        $.each( rooms, function( index, value ){
            var $btnDiv = $('<button class="roomButtons"/>')
                .text(value)
            $rooms.append($btnDiv)
        });
    });

    socket.on('joinedRoom', function(players) {
        $startPage.hide();
        $roomPage.show();
        $roomTitle.text(players);
    });

    socket.on('sendAnswers', function(answers){
        $startPage.hide();
        $roomPage.show();
        $roomTitle.text(JSON.stringify(answers));
    });

    socket.on('waitingOnQuestion', function() {
        $startPage.hide();
        $roomPage.show();
        $roomTitle.text('Waiting for question to be chosen');
    });

    socket.on('sendQuestions', function(questions) {
        $startPage.hide();
        $roomPage.show();
        $roomTitle.text(questions);
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



});