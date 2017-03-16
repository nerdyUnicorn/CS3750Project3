$(function() {
    var $rooms = $('.rooms');
    var $user = $('.userName');
    var $roomPage = $('.roomPage');
    var $startPage = $('.startPage');

    var $btnNewRoom = $('#newRoomButton');
    var $inpNewRoom = $('#newRoomText');

    var $btnJoinRoom = $('#joinRoomButton');
    var $inpJoinRoom = $('#joinRoomText');

    var $btnSeeRooms = $('#seeRoomsButton');

    var $roomTitle = $('.roomTitle');

    $roomPage.hide();

    var socket = io();

    //document.onload = getRooms();

    function getRooms(){
        socket.emit('getRooms');
    }

    function createRoom(){
        var room = $inpNewRoom.val()
        socket.emit('createRoom', room)
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