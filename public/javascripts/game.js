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
        socket.emit('createRoom', room, players, rounds)
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

    socket.on('joinedRoom', function(userMessage) {
            $startPage.hide();
            $roomPage.show();
            $roomTitle.text(userMessage);
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