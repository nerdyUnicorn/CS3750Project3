module.exports = (io) => {

    let Question = require('../models/question');


//Curly Braces {} mean a dictionary object or an array with a programmed individual key.
    class roomInfo{
        constructor(name, numPlayers, numRounds, categories){
            this.name = name;
            this.numPlayers = numPlayers;
            this.players = {};
            //list of players keys to shuffle so we can have a shuffled host array
            this.playerIds = [];
            this.numRounds = numRounds;
            this.categories = categories;
            this.playerScores = {};
            this.playerLikes = {};
            this.chosenQuestion = "";
            this.roundAnswers = {};
            this.chosenAnswers = {};
            this.questionsDefinitions = [];
            this.questionsFamousPeople = [];
            this.questionsAcronyms = [];
            this.questionsMovieHeadlines = [];
            this.questionsLudicrousLaws = [];
            this.currentRound = 0;
            console.log(this);
        }
    }

    // server side in memory data structures go here
    let rooms = {};
    let users = [];

    io.sockets.on('connection', socket => {
        

	// Get username from the request object thanks to passport.socketio
        const username = socket.request.user.username;

        // do the the following on connection 
        //socket.broadcast.emit('userLoggedIn', username);
        users.push(username);

        //SET THE SOCKET'S NICKNAME TO THE CLIENT'S USERNAME
        socket.nickname = username;

/***************************************************************************************************/
/*****************--------RECIEVED MESSAGES FROM CLIENT FUNCTIONS------------------------***********/
/***************************************************************************************************/
        socket.on('getUser', (callback) => {
            io.sockets.emit('whoami', username);
        });

        socket.on('getUsers', (callback) => {
            io.to(socket.id).emit('userList', users); // only send userList to newly connected user
        });

        socket.on('getRooms', (callback) => {
            io.to(socket.id).emit('returnRooms', rooms);
        });

        //Called when 'createRoom' is emitted from a client This takes in the parameters for 
        //room name (if none create one), number of players, number of rounds, and categories to be used
        socket.on('createRoom', function(roomName, players, rounds, categories) {
            rooms[roomName] = new roomInfo(roomName, players, rounds, categories);
            joinRoom(roomName, socket);
        });

        //Called when 'joinroom' is emitted from a client with the room name calls the 
        //function joinRoom
        socket.on('joinRoom', function(room) {
            joinRoom(room, socket);
        });

        //called when 'selectQuestion' is emitted from the client who is the host when
        //they select a question from the list provided to them
        socket.on('selectedQuestion', function(room, question){
            //get the question that was chosen and find the answer in the database
            rooms[room].chosenQuestion = question;
            rooms[room].roundAnswers['correct'] = "The right answer"

            io.sockets.in(room).emit("sendSelectedQuestion", question);
        })

        //called when 'answerQuestion' is emitted from a client who has submitted his/her
        //own answer to the chosen question.
        socket.on('answerQuestion', function(room, answer){
            rooms[room].roundAnswers[socket.nickname] = answer;
            if(rooms[room].roundAnswers.length == rooms[room].playerIds.length + 1){
                io.sockets.in(room).emit('sendAnswers', rooms[room].roundAnswers);
            }
            else{
                socket.emit('waitingForAnswers');
            }
        })

        //called when 'choseAnswer' is emmitted from a client with the answer that they chose
        //Adds to the scores and then returns the chosen answers and the scores
        socket.on('choseAnswer', function(room, answer){
            rooms[room].chosenAnswers[socket.id] = answer;
            var userAnswerChosen = _.findKey(rooms[room].roundAnswers, answer);
            if (userAnswerChosen == 'correct'){
                rooms[room].playerScores[socket.nickname] += 20;
            }
            else{
                rooms[room].playerScores[userAnswerChosen] += 10;
            }

            if(rooms[room].chosenAnswers.length == rooms[room].playerIds.length){
                socket.emit('chosenAnswers', rooms[room].chosenAnswers, rooms[room].playerScores);
            }
        })


/***************************************************************************************************/
/*****************--------------------HELPER FUNCTIONS------------------------**********************/
/***************************************************************************************************/
        //called to join a room, if the room exists it joins the client to the room and 
        //emits a list of the users who have joined the game
        //If the room does not exist it emits 'noSuchRoom' to the client
        function joinRoom(room, socket){
            //Check if the room is in the list of rooms
            if(room in rooms) {
                //if the room is full already emit 'roomFull' to the client
                if(rooms[room].players.count == rooms[room].numPlayers) {
                    socket.emit('roomFull');
                    return;
                }
                //Join the room
                socket.join(room);
                //Add the player to the the players list designating the socketId as the key 
                //and the nickname (or username) as the value
                rooms[room].players[socket.id] = socket.nickname;
                //Add the socketID to the playerId's list to make a list of the keys in players
                //so we can shuffle the order we choose
                rooms[room].playerIds.push(socket.id);

                //Add the user to the playerScores and playerLikes lists
                rooms[room].playerScores[socket.nickname] = 0;
                rooms[room].playerLikes[socket.nickname] = 0;
                
                
                //If all the players have joined then start the game
                if(rooms[room].playerIds.length == rooms[room].numPlayers) {
                    startGame(room);
                }
                //if not all players have joined then send a list of those who have
                else{
                    let roomClients = io.sockets.adapter.rooms[room];
                    let roomPlayers = [];
                    for (var clientId in roomClients.sockets ) {
                        console.log('client: %s', clientId);
                        var socket = io.sockets.connected[clientId];
                        roomPlayers.push(socket.nickname);
                        console.log('User: ' + socket.nickname);
                    }
                    io.sockets.in(room).emit('joinedRoom', roomPlayers);
                }
            }
            else{
                socket.emit('noSuchRoom');
            }
        }


        //function called when all the players have joined
        function startGame(room){
            //Get questions These are just temporary questions
            //Really we need to go grab questions enough for every round from 
            //the database
            rooms[room].questionsDefinitions.push("Anatidaephobia")
            rooms[room].questionsDefinitions.push("Taradiddle")

            console.log(rooms[room].questions)
            //shuffle questions
            rooms[room].questions = shuffleArray(rooms[room].questions);
            console.log(rooms[room].questions)

            //shuffle playerIds so hosting is shuffled
            rooms[room].playerIds = shuffleArray(rooms[room].playerIds);

            //set the current round to be round 1
            rooms[room].currentRound = 1;

            //Let all the clients know we are waiting on the host to choose a question
            io.sockets.in(room).emit("waitingOnQuestion");

            //send the host a list of questions
            sendQuestionsToHost(room);
        }

        //Function to send a list of questions for the host to choose from
        function sendQuestionsToHost(room){
            //clear the round answers everytime you send new questions out (start of new round)
            rooms[room].roundAnswers = {};
            let currRound = rooms[room].currentRound;
            let tempNumPlayers = rooms[room].numPlayers;
            //This will go through the list of players each round to select a new host
            let hostId = rooms[room].playerIds[currRound % tempNumPlayers];

            //This selects the host by the id from the playerids list
            let host = io.sockets.connected[hostId];

            //Need to grab questions from specific categories here not just definition questions
            let questions = rooms[room].questionsDefinitions;

            //Questions to choose from are only sent to the new host.
            host.emit("sendQuestions", questions);
        }


        //Funtion to shuffle the contents of an array
        function shuffleArray(array) {
            for (var i = array.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var temp = array[i];
                array[i] = array[j];
                array[j] = temp;
            }
            return array;
        }
        

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
