$(function() {
    var $rooms = $('.rooms');
    var $user = $('.userName');

    var $roomPage = $('.roomPage');
    var $startPage = $('.startPage');
    var $createRoomPage = $('.createRoomPage');

    var $btnNewGame = $('#newGameButton');

    var $btnNewRoom = $('#newRoomButton');

    var $inpNewRoom = $('#newNameText');
    //check that  these are numeric
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

// check for numeric here
    function createRoom(){
        var room = $inpNewRoom.val()
        var players = $inpNewPlayers.val()
        var rounds = $inpNewRounds.val()
        socket.emit('createRoom', room, players, rounds)
        $createRoomPage.hide();
        $startPage.show();
    }

    function joinRoom(){
        var room = $inpJoinRoom.val().trim();
        var user = $user.val();
        var  ex= socket.emit('checkRoom', room);
        if(ex){
            socket.emit('joinRoom', room, user);
        } else{
            alert("This room does not exist");
        }
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