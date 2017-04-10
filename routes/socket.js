module.exports = (io) => {

    let Question = require('../models/question');

    var definitionQuestions = {}
    var famousPeopleQuestions = {}
    var acronymQuestions = {}
    var movieHeadlineQuestions = {}
    var ludicrousLawsQuestions = {}

    //set up the function to get all quesetions from mongoose then call it when the server starts
    function getQuestions(){
        Question.getDefinitions(setDefinitions);
        Question.getFamousPeople(setFamousPeople);
        Question.getAcronyms(setAcronyms);
        Question.getMovieHeadlines(setMovieHeadlines);
        Question.getLudicrousLaws(setLudicrousLaws);
    }
    getQuestions();

    function setDefinitions(results){
        definitionQuestions = results;
    }

    function setFamousPeople(results){
        famousPeopleQuestions = results;
    }

    function setAcronyms(results){
        acronymQuestions = results;
    }

    function setMovieHeadlines(results){
        movieHeadlineQuestions = results;
    }

    function setLudicrousLaws(results){
        ludicrousLawsQuestions = results;
    }

    //refresh the question bank every 500 seconds
    var refreshQuestionBank = null
    refreshQuestionBank = setInterval(function() {                   
        getQuestions();
    }, 500000);


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
            this.questionsAnswersDefinitions = {};
            this.questionsAnswersFamousPeople = {};
            this.questionsAnswersAcronyms = {};
            this.questionsAnswersMovieHeadlines = {};
            this.questionsAnswersLudicrousLaws = {};
            this.roundQuestions = {};
            this.currentRound = 0;
            //console.log(this);
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
            roomName.trim();
            players.trim();
            rounds.trim();
            var problems = ''
            if(isNaN(players) || isNaN(parseInt(players))){
                problems = problems + 'Number of players must contain a number.\n';
            }
            if(Number(players) > 10 || Number(players) < 1){
                problems = problems + 'Number of players must be less than 10. \n';
            }
            if(isNaN(rounds) || isNaN(parseInt(rounds))){
                problems = problems + 'Number of rounds must contain a number.\n';
            }
            if(Number(rounds) > 10 || Number(rounds) < 1){
                problems = problems + 'Number of rounds must be less than 10. \n';
            }
            if(categories.length < 1){
                problems = problems + 'You must select at least 1 category';
            }
            
            if(problems != ''){
                socket.emit('createRoomErrors', problems);
                problems = '';
                return;
            }
            if(Object.keys(rooms).includes(roomName)){
                var safeRoomName = false;
                var exampleRoom = '';
                while(!safeRoomName){
                    exampleRoom = makeid();
                    if(!Object.keys(rooms).includes(exampleRoom)){
                        safeRoomName = true;
                    }
                }
                socket.emit('roomAlreadyExists', exampleRoom);
            }
            else{
                if(roomName == null || roomName == ""){
                    var safeRoomName = false;
                    var exampleRoom = '';
                    while(!safeRoomName){
                        exampleRoom = makeid();
                        if(!Object.keys(rooms).includes(exampleRoom)){
                            safeRoomName = true;
                        }
                    }
                    roomName = exampleRoom;
                }
                rooms[roomName] = new roomInfo(roomName, players, rounds, categories);
                joinRoom(roomName, socket);
            }
        });

        function makeid()
        {
            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

            for( var i=0; i < 5; i++ )
                text += possible.charAt(Math.floor(Math.random() * possible.length));

            return text;
        }

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

            rooms[room].roundAnswers['correct'] = rooms[room].roundQuestions[question];

            io.sockets.in(room).emit("sendSelectedQuestion", question);
        })

        //called when 'answerQuestion' is emitted from a client who has submitted his/her
        //own answer to the chosen question.
        socket.on('answerQuestion', function(room, answer){
            rooms[room].roundAnswers[socket.nickname] = answer;
            
            if(Object.keys(rooms[room].roundAnswers).length == rooms[room].playerIds.length + 1){
                var tempAnswers = []
                for (var key in rooms[room].roundAnswers){
                    tempAnswers.push(rooms[room].roundAnswers[key]);
                }
                tempAnswers = shuffleArray(tempAnswers);
                io.sockets.in(room).emit('sendAnswers', tempAnswers, rooms[room].chosenQuestion);
            }
            else{
                socket.emit('waitingForAnswers');
            }
        })

        //Timer interval for starting a new round
        var interval = null;

        //called when 'choseAnswer' is emmitted from a client with the answer that they chose
        //Adds to the scores and then returns the chosen answers and the scores
        socket.on('choseAnswer', function(room, answer){
            rooms[room].chosenAnswers[socket.nickname] = answer;
            for (var key in rooms[room].roundAnswers){
                if(rooms[room].roundAnswers[key] == answer){
                    if (key == 'correct'){
                        rooms[room].playerScores[socket.nickname] += 20;
                        console.log("Chose the right answer!")
                    }
                    else{
                        rooms[room].playerScores[key] += 10;                        console.log("Chose the wrong answer!")
                    }
                }
            }

            if(Object.keys(rooms[room].chosenAnswers).length == rooms[room].playerIds.length){
                io.sockets.in(room).emit('chosenAnswers', rooms[room].chosenAnswers, rooms[room].playerScores);
                console.log(rooms[room].chosenAnswers);
                interval = setInterval(function() {
                    newRound(room);
                }, 10000);
            }
            else{
                socket.emit('waitingForChosenAnswers')
            }
        })

        socket.on('restartGame', function(room){
            rooms[room].questionsAnswersDefinitions = {};
            rooms[room].questionsDefinitions = [];
            rooms[room].questionsAnswersMovieHeadlines = {};
            rooms[room].questionsMovieHeadlines = [];
            rooms[room].questionsAnswersFamousPeople = {};
            rooms[room].questionsFamousPeople = [];
            rooms[room].questionsAnswersAcronyms = {};
            rooms[room].questionsAcronyms = [];
            rooms[room].questionsAnswersLudicrousLaws = {};
            rooms[room].questionsLudicrousLaws = [];

            for(key in rooms[room].playerScores){
                rooms[room].playerScores[key] = 0;
            }

            startGame(room);
        });

        //clear out the game info object elements that need to be and update the round.
        function newRound(room){
            clearInterval(interval);
            rooms[room].roundAnswers = {};
            rooms[room].chosenAnswers = {};
            console.log(rooms[room].chosenAnswers);
            console.log(rooms[room].roundAnswers);
            rooms[room].chosenQuestion = "";
            rooms[room].currentRound++;
         

            if(rooms[room].currentRound > rooms[room].numRounds){
                endGame(room);
            }
            else{
                io.sockets.in(room).emit('newRound');
                startRound(room);
            }
        }


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
                if(Object.keys(rooms[room].players).count == rooms[room].numPlayers) {
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
                    io.sockets.in(room).emit('joinedRoom', roomPlayers, room);
                }
            }
            else{
                socket.emit('noSuchRoom');
            }
        }


        //function called when all the players have joined
        function startGame(room){
            //Get questions from the database
            for (var cat in rooms[room].categories){
                if(rooms[room].categories[cat] == 'Definitions'){
                    var defs = shuffleArray(definitionQuestions);
                    var i = 0;
                    for(i = 0; i < Number(rooms[room].numRounds); i++){
                        rooms[room].questionsAnswersDefinitions[defs[i].question] = defs[i].answer;
                        rooms[room].questionsDefinitions.push(defs[i].question);
                    }
                }
                else if(rooms[room].categories[cat] == 'Movie Headlines'){
                    var defs = shuffleArray(movieHeadlineQuestions);
                    var i = 0;
                    for(i = 0; i < Number(rooms[room].numRounds); i++){
                        rooms[room].questionsAnswersMovieHeadlines[defs[i].question] = defs[i].answer;
                        rooms[room].questionsMovieHeadlines.push(defs[i].question);
                    }
                }
                else if(rooms[room].categories[cat] == 'Famous People'){
                    var defs = shuffleArray(famousPeopleQuestions);
                    var i = 0;
                    for(i = 0; i < Number(rooms[room].numRounds); i++){
                        rooms[room].questionsAnswersFamousPeople[defs[i].question] = defs[i].answer;
                        rooms[room].questionsFamousPeople.push(defs[i].question);
                    }
                }
                else if(rooms[room].categories[cat] == 'Acronyms'){
                    var defs = shuffleArray(acronymQuestions);
                    var i = 0;
                    for(i = 0; i < Number(rooms[room].numRounds); i++){
                        rooms[room].questionsAnswersAcronyms[defs[i].question] = defs[i].answer;
                        rooms[room].questionsAcronyms.push(defs[i].question);
                    }
                }
                else if(rooms[room].categories[cat] == 'Ludicrous Laws'){
                    var defs = shuffleArray(ludicrousLawsQuestions);
                    var i = 0;
                    for(i = 0; i < Number(rooms[room].numRounds); i++){
                        rooms[room].questionsAnswersLudicrousLaws[defs[i].question] = defs[i].answer;
                        rooms[room].questionsLudicrousLaws.push(defs[i].question);
                    }
                }
            }


            //shuffle playerIds so hosting is shuffled
            rooms[room].playerIds = shuffleArray(rooms[room].playerIds);

            //set the current round to be round 1
            rooms[room].currentRound = 1;

            startRound(room);
        }

        //function called to start a new round
        function startRound(room){
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
            let questions = {};

            for (var cat in rooms[room].categories){
                if(rooms[room].categories[cat] == 'Definitions'){
                    let q = rooms[room].questionsDefinitions[currRound - 1];
                    questions['Definitions'] = q;
                    rooms[room].roundQuestions[q] = rooms[room].questionsAnswersDefinitions[q];
                }
                else if(rooms[room].categories[cat] == 'Movie Headlines'){
                    let q = rooms[room].questionsMovieHeadlines[currRound - 1];
                    questions['Movie Headlines'] = q;
                    rooms[room].roundQuestions[q] = rooms[room].questionsAnswersMovieHeadlines[q];
                }
                else if(rooms[room].categories[cat] == 'Famous People'){
                    let q = rooms[room].questionsFamousPeople[currRound - 1];
                    questions['Famous People'] = q;
                    rooms[room].roundQuestions[q] = rooms[room].questionsAnswersFamousPeople[q];
                }
                else if(rooms[room].categories[cat] == 'Acronyms'){
                    let q = rooms[room].questionsAcronyms[currRound - 1];
                    questions['Acronyms'] = q;
                    rooms[room].roundQuestions[q] = rooms[room].questionsAnswersAcronyms[q];
                }
                else if(rooms[room].categories[cat] == 'Ludicrous Laws'){
                    let q = rooms[room].questionsLudicrousLaws[currRound - 1];
                    questions['Ludicrous Laws'] = q;
                    rooms[room].roundQuestions[q] = rooms[room].questionsAnswersLudicrousLaws[q];
                }
            }

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

        function endGame(room){
            
            let Game = require('../models/game');

            var items = Object.keys(rooms[room].playerScores).map(function(key) {
                return [key, rooms[room].playerScores[key]];
            });

            var finalScores = items.sort(function(first, second) {return second[1] - first[1];});

            var dbGameName = rooms[room].name;
            var dbWinner = finalScores[0][0];
            var dbNumQuestions = rooms[room].numRounds;
            
            var dbScores = JSON.stringify(rooms[room].playerScores);


            var dbPlayers = Object.keys(rooms[room].playerScores);
            var dbNumRounds = rooms[room].numRounds;

            const newGame = new Game({
                GameName: dbGameName,
                Winner: dbWinner,
                TotalQuestions: dbNumQuestions,
                Scores: dbScores,
                Players: dbPlayers,
                Rounds: dbNumRounds
            });

            Game.saveEndGame(newGame);

            /******************************!!!!!!!!!@@@@@@@@########$$$$$$$$$$%%%%%%%%%%%%%%%%%^^^^^^^^^^^^^^^^&&&&&&&&&&&&&&&&&&&&&&&&&&&&
             * ******************************!!!!!!!!!@@@@@@@@########$$$$$$$$$$%%%%%%%%%%%%%%%%%^^^^^^^^^^^^^^^^&&&&&&&&&&&&&&&&&&&&&&&&&&&&
             * ******************************!!!!!!!!!@@@@@@@@########$$$$$$$$$$%%%%%%%%%%%%%%%%%^^^^^^^^^^^^^^^^&&&&&&&&&&&&&&&&&&&&&&&&&&&&
             * ******************************!!!!!!!!!@@@@@@@@########$$$$$$$$$$%%%%%%%%%%%%%%%%%^^^^^^^^^^^^^^^^&&&&&&&&&&&&&&&&&&&&&&&&&&&&
             * ******************************!!!!!!!!!@@@@@@@@########$$$$$$$$$$%%%%%%%%%%%%%%%%%^^^^^^^^^^^^^^^^&&&&&&&&&&&&&&&&&&&&&&&&&&&&
                        THIS IS WHERE WE NEED TO SAVE THE GAME INFORMATION ALL THE VARIABLES NEEDED ARE CREATED BELOW
                        var dbRoomName = rooms[room].name;
                        var dbWinner = finalScores[0][0];
                        var dbNumQuestions = rooms[room].numRounds;
                        var dbScores = rooms[room].playerScores;
                        var dbPlayers = Object.keys(rooms[room].playerScores);
                        var dbNumRounds = rooms[room].numRounds;
                        var dbDateTime = new Date();
            ******************************!!!!!!!!!@@@@@@@@########$$$$$$$$$$%%%%%%%%%%%%%%%%%^^^^^^^^^^^^^^^^&&&&&&&&&&&&&&&&&&&&&&&&&&&&
            ******************************!!!!!!!!!@@@@@@@@########$$$$$$$$$$%%%%%%%%%%%%%%%%%^^^^^^^^^^^^^^^^&&&&&&&&&&&&&&&&&&&&&&&&&&&&
            ******************************!!!!!!!!!@@@@@@@@########$$$$$$$$$$%%%%%%%%%%%%%%%%%^^^^^^^^^^^^^^^^&&&&&&&&&&&&&&&&&&&&&&&&&&&&
            ******************************!!!!!!!!!@@@@@@@@########$$$$$$$$$$%%%%%%%%%%%%%%%%%^^^^^^^^^^^^^^^^&&&&&&&&&&&&&&&&&&&&&&&&&&&&
            *****************************!!!!!!!!!@@@@@@@@########$$$$$$$$$$%%%%%%%%%%%%%%%%%^^^^^^^^^^^^^^^^&&&&&&&&&&&&&&&&&&&&&&&&&&&&*/
            io.sockets.in(room).emit('endGame', finalScores);
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
