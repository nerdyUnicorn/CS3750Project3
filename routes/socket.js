module.exports = (io) => {

    // server side in memory data structures go here
    let users = [];
    let rooms = ["Room 1", "Room2"];

    io.sockets.on('connection', socket => {
        

	// Get username from the request object thanks to passport.socketio
        const username = socket.request.user.username;

        // do the the following on connection 
        socket.broadcast.emit('userLoggedIn', username);
        users.push(username);

        socket.on('getUser', (callback) => {
            io.sockets.emit('whoami', username);
        });

        socket.on('getUsers', (callback) => {
            io.to(socket.id).emit('userList', users); // only send userList to newly connected user
        });

        socket.on('getRooms', (callback) => {
            io.to(socket.id).emit('returnRooms', rooms);
        });

        socket.on('createRoom', function(room) {
            rooms.push(room);
            io.to(socket.id).emit('returnRooms', rooms);
        });

        // Client to Server message
        //socket.on('c2smsg', function(data, callback){
        //    var chatObject = {person: user.username, message: data};
        //    socket.broadcast.emit('s2cmsg', chatObject);
        //});

        // Notify clients the user disconnected
        // update the server side tracker
        socket.on('disconnect', socket => {
            io.sockets.emit('userLoggedOut', username);
            users.splice(users.indexOf(username),1); // remove from user tracker
        });

    });// end on connection event
};
