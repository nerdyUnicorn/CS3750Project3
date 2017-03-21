module.exports = (io) => {

    // server side in memory data structures go here
    let users = [];
    let rooms = [];
    let numPlayers = [];
    let numRounds = [];

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

        socket.on('createRoom', function(room, players, rounds) {
            rooms.push(room);
            numPlayers.push(players);
            numRounds.push(rounds);
        });

        socket.on('joinRoom', function(room, user) {
            let index = rooms.indexOf(room);
            if (index != -1){
                let jroom = rooms[index];
                let jplayers = numPlayers[index];
                let jrounds = numRounds[index];
                socket.join(room);
                io.sockets.in(room).emit('joinedRoom', user + " has joined " + jroom + ". \nThere will be " + jplayers + " players and " + jrounds + " rounds.");
            }
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
