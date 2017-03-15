$(function() {
    var $rooms = $('.rooms');
    var $user = $('.user');
    var $startPage = $('.start');
    var $createRoomPage = $('.createRoom');

    var $btnNewRoom = $('#newRoomButton');
    var $inpNewRoom = $('#newRoomText');

    var $btnSeeRooms = $('#seeRoomsButton');

    $createRoomPage.hide();

    var socket = io();

    //document.onload = getRooms();

    function getRooms(){
        socket.emit('getRooms');
    }

    function createRoom(){
        var room = $inpNewRoom.val()
        socket.emit('createRoom', room)
    }

    socket.on('returnRooms', function (rooms) {
        $.each( rooms, function( index, value ){
            var $btnDiv = $('<button class="roomButtons"/>')
                .text(value)
            $rooms.append($btnDiv)
        });
    });

    $btnNewRoom.click(function(){
        $user.text("Working")
        createRoom();
    });

    $btnSeeRooms.click(function(){
        getRooms();
    })



});