//const gamesModule = require('./gamesModule.js');

//User stuff
var userArray = [];
var userIDArray = [];
var userIDCounter = 1;

var user = class {
	constructor(userName, passWord){
		this.userName = userName;
		var password = passWord;
		this.setPassword = function(passWord) {password = passWord;}	//for if we need to change the pasword
		this.getPassword = function() {return password;}
		this.userID = userIDCounter++;
		this.friendsArray = [];			//array of user IDs
		this.requestsInbox = [];		//array of user IDs
		this.requestsOutbox = [];		//array of user IDs
		this.userGames = [];			//array of game IDs
		this.gameInviteInbox = {};		//dictionary of user ID - privacy pairs
		this.gameInviteOutbox = {};		//dictionary of user ID - privacy pairs
		this.onlineStatus = false;
		this.privacy = false;
		this.statWin = 0;
		this.statLoss = 0;
		this.statDraw = 0;
		this.statGames = 0;
	}
}

function createUser(newUsername, password){
	if(findUser(String(newUsername))){
		return null;
	}
	//Will check for valid password later with regex and stuff
	if(password == null){
		return null;
	}

	//Set values for user
	newUser = new user(newUsername, password);
	userArray.push(newUser);
	userIDArray.push(newUser.userID);
	return newUser;
}

function isValidUser(userObj){
	if(!userObj){
		return false;
	}
	if(!userObj.userName || !findUser(String(userObj.userName))){
		return false;
	}
	return true;
}

function canAccessUser(requesterID, requestedID){
	requestedUser = findUserID(requestedID);

	if(!requestedUser){
		return false;
	}

	// privacy is off or they are friends
	if(!requestedUser.privacy || requestedUser.friendsArray.includes(requesterID) || requesterID === requestedID){
		return true;
	}

	return false;
}

//provides user of the user that the logged in user is trying to access
//might change so that it returns the id ??
function getUser(requestingUser, requestedID){
	let result = findUserID(requestedID);

	//If we find the user
	if(result){
		//If their account is public
		if(!result.privacy){
			return result;
		}
		//If the requesting user can access the account (e.g. is friends with)
		else if(isValidUser(requestingUser) && canAccessUser(requestingUser.userID, requestedID)){
			return result;
		}		
	}

	return null;
}

//provides array of userIDs that match the search term and are accessible by the requester
function searchUsers(requestingUser, searchTerm){
	let results = [];

	if(!isValidUser(requestingUser)){
		//filter array so only those accessible are retrieved (nonprivate/are friends)
		results = userArray.filter(x => canAccessUser(null, x.userID) === true);
	}
	else{
		//filter array so only those accessible are retrieved (nonprivate/are friends)
		results = userArray.filter(x => canAccessUser(requestingUser.userID, x.userID) === true);
	}

	//filter again so it includes the search term
	results = results.filter(x => x.userName.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0);
	
	//map it to an array of userIDs
	results = results.map(x => x.userID);

	return results;
}

//more of a helper function for the server to find users from an array of ids
//maybe this should be merged with getUser
function findUserID(requestedID){
	for(var i = 0; i < userArray.length; i++){
		if(userArray[i].userID === requestedID){
			return userArray[i];
		}
	}
	return null;
}

//more of a helper function for the server to find users from a username
function findUser(requestedUsername){
	for(var i = 0; i < userArray.length; i++){
		if(userArray[i].userName === requestedUsername){
			return userArray[i];
		}
	}
	return null;
}

function sendFriendRequest(userIDA, userIDB){
	var userA = findUserID(userIDA);
	var userB = findUserID(userIDB);

	//If an ID does not exist
	if(!userA || !userB){
		//console.log("id doesn't exist");
		return false;
	}

	//If the IDs are the same
	if(userIDA === userIDB){
		//console.log("id is invalid");
		return false;
	}

	//If they are already friends
	if(userA.friendsArray.includes(userIDB)){
		//console.log("already friends");
		return false;
	}

	//If a request is already sent
	if(userA.requestsOutbox.includes(userIDB)){
		//console.log("request already sent");
		return false;
	}

	//add request to respective arrays
	userA.requestsOutbox.push(userIDB);
	userB.requestsInbox.push(userIDA);

	//make friends if A has already received a request from B
	if(userA.requestsInbox.includes(userIDB) && userA.requestsOutbox.includes(userIDB)){
		makeFriends(userIDA, userIDB);
	}

	return true;
}

//can also use the same function to decline requests
function cancelFriendRequest(userIDA, userIDB){
	var userA = findUserID(userIDA);
	var userB = findUserID(userIDB);

	//If an ID does not exist
	if(!userA || !userB){		
		//console.log("id doesn't exist");
		return false;
	}

	//Remove request from both user arrays.
	if(userA.requestsOutbox.includes(userIDB)){		
		userA.requestsOutbox.splice(userA.requestsOutbox.indexOf(userIDB), 1);
		userB.requestsInbox.splice(userB.requestsInbox.indexOf(userIDA), 1);
		return true;
	}
	else{		
		return false;
	}
}

function makeFriends(userIDA, userIDB){
	var userA = findUserID(userIDA);
	var userB = findUserID(userIDB);

	//If an ID does not exist
	if(!userA || !userB){		
		//console.log("id doesn't exist");
		return false;
	}

	//If the IDs are the same
	if(userIDA === userIDB){		
		//console.log("id is invalid");
		return false;
	}

	//If they are already friends
	if(userA.friendsArray.includes(userIDB)){
		//console.log("already friends");
		return false;
	}

	if((userA.requestsInbox.includes(userIDB) && userA.requestsOutbox.includes(userIDB)) || (userB.requestsInbox.includes(userIDA) && userB.requestsOutbox.includes(userIDA))){
		
		//we can delete friend requests now
		userA.requestsOutbox.splice(userA.requestsOutbox.indexOf(userIDB), 1);
		userB.requestsOutbox.splice(userB.requestsOutbox.indexOf(userIDA), 1);
		
		userA.requestsInbox.splice(userA.requestsInbox.indexOf(userIDB), 1);
		userB.requestsInbox.splice(userB.requestsInbox.indexOf(userIDA), 1);

		//add friends to respective arrays
		userA.friendsArray.push(userIDB);
		userB.friendsArray.push(userIDA);
		return true;
	}
	else{
		return false;
	}
}

function removeFriend(userIDA, userIDB){	
	var userA = findUserID(userIDA);
	var userB = findUserID(userIDB);

	//If an ID does not exist
	if(!userA || !userB){		
		//console.log("id doesn't exist");
		return false;
	}

	//Can only remove a friend if both are friends
	if(userA.friendsArray.includes(userIDB) && userB.friendsArray.includes(userIDA)){
		//console.log("already friends");
		userA.friendsArray.splice(userA.friendsArray.indexOf(userIDB), 1);
		userB.friendsArray.splice(userB.friendsArray.indexOf(userIDA), 1);
		return true;
	}
	//console.log("not friends in the first place");
	return false;
}

//These get functions might be redundant because the attributes aren't "private". 
//maybe that could change or these might be removed
function getUserFriends(userID){	
	var user = findUserID(userID);

	//If ID does not exist
	if(!user){		
		return null;
	}

	return user.friendsArray;
}

function getUserRequestsInbox(userID){	
	var user = findUserID(userID);

	//If ID does not exist
	if(!user){		
		return null;
	}

	return user.requestsInbox;
}

function getUserRequestsOutbox(userID){	
	var user = findUserID(userID);

	//If ID does not exist
	if(!user){		
		return null;
	}

	return user.requestsOutbox;
}

function getUserGameInviteInbox(userID){
	var user = findUserID(userID);

	//If ID does not exist
	if(!user){		
		return null;
	}

	return user.gameInviteInbox;
}

function getUserGameInviteOutbox(userID){	
	var user = findUserID(userID);

	//If ID does not exist
	if(!user){		
		return null;
	}

	return user.gameInviteOutbox;
}

function getUserGames(userID){
	var user = findUserID(userID);

	//If ID does not exist
	if(!user){		
		return null;
	}

	return user.userGames;
}

//returns array of ALL users sorted by win rate
//todo make this an array of ids later
function getLeaderboard(searchTerm){
	return userArray.sort(function(a,b){
		return (b.statWin/b.statGames) - (a.statWin/a.statGames);
	}).filter(x => x.userName.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0);
}

//todo separate this into a separate module

//Games stuff
var globalGames = [];	//these could be sorted sets to be faster
var openInvites = {};	//add people open to playing anyone into a pool and match them
var gameIDCounter = 1;
var game = class {
	constructor(userA, userB, privacy){
		this.gameID = gameIDCounter++;
		this.player1ID = userA.userID;
		this.player1 = userA.userName;
		this.player2ID = userB.userID;
		this.player2 = userB.userName;
		this.recordedMoves = [];
		this.privacy = privacy;	//either 0 - public, 1 - friends only, or 2 - private
		this.winner = -2;	//-1 when draw
		this.complete = false;
		this.forfeit = false;
	}
}

function createNewGame(userA, userB, privacy){	
	newGame = new game(userA, userB, privacy);

	userA.userGames.push(newGame.gameID);
	userB.userGames.push(newGame.gameID);
	globalGames.push(newGame);

	//console.log("just made a game");
	return newGame;
}

//helper function to complete a given game and declare a winner/loser
function finishGame(gameID, winningPlayer, losingPlayer){
	var finishedGame = findGameID(gameID);

	finishedGame.winner = winningPlayer.userID;
	finishedGame.complete = true;

	winningPlayer.statWin++;
	winningPlayer.statGames++;

	losingPlayer.statLoss++;
	losingPlayer.statGames++;
}

function canAccessGame(requesterID, requestedGameID){
	requestedGame = findGameID(requestedGameID);
	requester = findUserID(requesterID);

	if(!requestedGame){
		return false;
	}

	//if it's a public game or if the requester is one of the players
	if(requestedGame.privacy === 0 || requestedGame.player1ID === requesterID || requestedGame.player2ID === requesterID){
		return true;
	}
	//if the game is friends only and the requester is a friend
	else if(requestedGame.privacy === 1 && requester && (requester.friendsArray.includes(requestedGame.player1ID) || requester.friendsArray.includes(requestedGame.player2ID))){
		return true;
	}

	return false;
}

//more of a helper function for the server to make an array of games from an array of ids
function findGameID(gameID){
	for(var i = 0; i < globalGames.length; i++){
		if(gameID === globalGames[i].gameID){
			return globalGames[i];
		}
	}
	return null;
}

function createGameInvite(userIDA, userIDB, privacy){
	var userA = findUserID(userIDA);
	var userB = findUserID(userIDB);

	//If sender's ID does not exist
	if(!userA){
		//console.log("id doesn't exist");
		return false;
	}	

	//If the IDs are the same
	if(userIDA === userIDB){
		//console.log("id is invalid");
		return false;
	}

	//If they've already been invited and the privacy settings match
		//note: this means that if another invite is sent with different privacy settings, the old invite is overwritten
	if(userIDB in userA.gameInviteOutbox && userA.gameInviteOutbox[userIDB] === privacy){
		//console.log("already invited");
		return false;
	}	

	//if user is searching for an open match (id of -1 means open match)
		//note: additional invites will overwrite the old invite in the pool
	if(userIDB === -1){
		userA.gameInviteOutbox[-1] = privacy;
		openInvites[userIDA] = privacy;		//add an invite to the open pool
		matchOpenGames(privacy);					//check to see if a match is available
	}
	//otherwise a invitee is specified
	else{
		userA.gameInviteOutbox[Number(userIDB)] = privacy;
		userB.gameInviteInbox[Number(userIDA)] = privacy;
	}

	//create a game if A has already received a request from B	
	//accepting a game invite will create a game invite in the other direction, thus creating the game
	if(userIDB in userA.gameInviteInbox && userIDB in userA.gameInviteOutbox && userA.gameInviteInbox[userIDB] === userA.gameInviteOutbox[userIDB]){
		//flip a coin to see who goes first
		if(Math.floor(Math.random() * 2) === 0){
			createNewGame(userA, userB, privacy);
		}
		else{
			createNewGame(userB, userA, privacy);
		}

		//we can delete game invites now
		delete userA.gameInviteOutbox[userIDB];
		delete userB.gameInviteOutbox[userIDA];

		delete userA.gameInviteInbox[userIDB];
		delete userB.gameInviteInbox[userIDA];
		//console.log("just made a game");
	}

	return true;
}

//can also use the same function to decline requests
function cancelGameInvite(userIDA, userIDB, privacy){
	var userA = findUserID(userIDA);
	var userB = findUserID(userIDB);

	//If a sender ID does not exist
	if(!userA){		
		//console.log("id doesn't exist");
		return false;
	}

	//check if we're cancelling an open invite
	if(userIDB === -1 && userIDA in openInvites && openInvites[userIDA] === privacy){
		delete openInvites[userIDA];	//remove it from the pool if we are
		delete userA.gameInviteOutbox[-1];	
		return true;
	}
	//Remove request from both user arrays.
	if(userIDB != -1 && userIDB in userA.gameInviteOutbox && userA.gameInviteOutbox[userIDB] === privacy && userIDA in userB.gameInviteInbox && userB.gameInviteInbox[userIDA] === privacy){		
		delete userA.gameInviteOutbox[userIDB];		
		delete userB.gameInviteInbox[userIDA];
		return true;
	}
	else{
		//console.log("request does not exist");		
		return false;
	}
}

//helper function to match and create a game between two people looking to play against random opponents
function matchOpenGames(privacy){
	var ids = [];

	if(Object.keys(openInvites).length < 2){
		//console.log("not enough invites");
		return false;
	}
	else{
		for(var key in openInvites){
			if(openInvites[key] === privacy){
				//console.log(key);
				ids.push(key);
			}
		}
		//we can increase this number so that more invites are added to the pool
		//this makes it so that games matched more "randomly", and less on a first-come first-served basis
		if(ids.length < 2){
			return false;
		}

		//pick two random indices in ids to match with each other
		var id1, id2;

		id1 = Math.floor(Math.random() * ids.length);
		id2 = Math.floor(Math.random() * ids.length);

		//make sure we don't pick the same user to match with themselves
		while(id2 === id1){
			id2 = Math.floor(Math.random() * ids.length);
		}

		var userA = findUserID(Number(ids[id1]));
		var userB = findUserID(Number(ids[id2]));

		//we can create a new game between the two, with the given privacy setting
		createNewGame(userA, userB, privacy);

		//we can delete game invites now
		delete userA.gameInviteOutbox[Number(ids[id2])];
		delete userB.gameInviteOutbox[Number(ids[id1])];

		//get rid of the invite to public now
		delete userA.gameInviteOutbox[-1];
		delete userB.gameInviteOutbox[-1];

		delete userA.gameInviteInbox[Number(ids[id2])];
		delete userB.gameInviteInbox[Number(ids[id1])];

		delete openInvites[Number(ids[id1])];
		delete openInvites[Number(ids[id2])];
	}
}

//add move function
function addMove(move, gameID, userID){
	game = findGameID(gameID);

	if(!game){
		return false;
	}

	//if it's player 1's move (even moves), and you are player 1
	if(userID === game.player1ID && game.recordedMoves.length % 2 === 0){
		game.recordedMoves.push(move);
		return true;
	}
	//other wise if it's player 2's move (odd moves), and you are player 2
	else if(userID === game.player2ID && game.recordedMoves.length % 2 === 1){
		game.recordedMoves.push(move);
		return true;
	}
	return false;
}

//returns array of games according to query
function getGames(userString, active, detail){
	//filter only public games
	let result = globalGames.filter(x => x.privacy === 0);

	//filter by userstring
	result = result.filter(x => x.player1.toLowerCase().indexOf(userString.toLowerCase()) >= 0 || x.player2.toLowerCase().indexOf(userString.toLowerCase()) >= 0);

	//filter by completion
	if(active === null){
		//No need to filter by completion state
	}
	else{
		result = result.filter(x => x.complete !== active);
	}
	
	if(detail === "full"){
		return result;
	}
	else{
		//Map game objects to game summary objects
		result = result.map(x => summarizeGame(x));
		return result;
	}
}

function setWin(gameID, winnerID){
	var game = findGameID(gameID);

	if(game.complete === false){
		if(checkWin(game, winnerID)){
			if(game.player1ID === winnerID){
				finishGame(gameID, findUserID(winnerID), findUserID(game.player2ID));
				return true;
			}
			else{
				finishGame(gameID, findUserID(winnerID), findUserID(game.player1ID));
				return true;
			}
		}
		//if the game is complete, but is a draw
		else if(game.recordedMoves.length == 42){
			drawGame(game, findUserID(game.player1ID), findUserID(game.player2ID));
		}
	}
	return false;
}

//only the logged in session's id gets passed. thus you must be logged in to forfeit your own game, and you can only forfeit your own game.
function forfeitGame(gameID, loserID){
	var game = findGameID(gameID);
	var winner;
	var loser;
	var found;

	if(game && game.complete === false){
		if(game.player1ID === loserID){
			winner = findUserID(game.player2ID);
			loser = findUserID(loserID);
			finishGame(gameID, winner, loser);
			game.forfeit = true;
			return true;		
		}
		else if(game.player2ID === loserID){
			winner = findUserID(game.player1ID);
			loser = findUserID(loserID);
			finishGame(gameID, winner, loser);
			game.forfeit = true;
			return true;		
		}
	}
	return false;
}

//validates on the server side that someone won the game
function checkWin(game, winnerID){
	var gameRow = []

	//Create empty 2d array
	for(let i = 0; i < 7; i++){
		var gameCol = [];
		gameRow.push(gameCol);
	}

	//add moves to that array
	for(let i = 0; i < game.recordedMoves.length; i++){
		//just making sure that it actually fits in the array
		if(game.recordedMoves[i] >= 0 && game.recordedMoves[i] < 7){
			//if player 1 made this move
			if(i % 2 == 0){
				//checking that the column still has room
				if(gameRow[game.recordedMoves[i]].length < 6){
					//console.log("Player 1's move: column " + game.recordedMoves[i]);
					gameRow[game.recordedMoves[i]].push(game.player1ID);
				}
			}
			//player 2 made this move
			else{				
				//checking that the column still has room
				if(gameRow[game.recordedMoves[i]].length < 6){
					//console.log("Player 2's move: column " + game.recordedMoves[i]);
					gameRow[game.recordedMoves[i]].push(game.player2ID);
				}
			}
		}
	}

	// Check for horizontal win
    for (let j = 0; j < 3 ; j++ ){
        for (let i = 0; i < 7; i++){
            if (gameRow[i][j] == winnerID && gameRow[i][j+1] == winnerID && gameRow[i][j+2] == winnerID && gameRow[i][j+3] == winnerID){
                return true;
            }           
        }
    }
    // Check for vertical win
    for (let i = 0; i < 4 ; i++ ){
        for (let j = 0; j < 6; j++){
            if (gameRow[i][j] == winnerID && gameRow[i+1][j] == winnerID && gameRow[i+2][j] == winnerID && gameRow[i+3][j] == winnerID){
                return true;
            }           
        }
    }
    // Check for ascending diagonal win 
    for (let i = 3; i < 7; i++){
        for (let j = 0; j < 3; j++){
            if (gameRow[i][j] == winnerID && gameRow[i-1][j+1] == winnerID && gameRow[i-2][j+2] == winnerID && gameRow[i-3][j+3] == winnerID)
                return true;
        }
    }
    // Check for descending diagonal win
    for (let i = 3; i < 7; i++){
        for (let j = 3; j < 6; j++){
            if (gameRow[i][j] == winnerID && gameRow[i-1][j-1] == winnerID && gameRow[i-2][j-2] == winnerID && gameRow[i-3][j-3] == winnerID)
                return true;
        }
    }
    return false;
}

function drawGame(game, player1, player2){
	game.winner = -1;	//indicates draw
	game.complete = true;

	player1.statDraw++;
	player2.statDraw++;
	player1.statGames++;
	player2.statGames++;
}

//Map game objects to summarized game objects
function summarizeGame(game){
	var summary;
	summary = (({gameID, player1, player2, complete}) => ({gameID, player1, player2, complete}))(game);
	
	if(game.complete){		
		summary.recordedMoves = game.recordedMoves.length;

		if(game.winner === game.player1ID){
			summary.winner = game.player1;
		}
		else{
			summary.winner = game.player2;
		}

		summary.forfeit = game.forfeit;
	}
	return summary;
}

//Initializing example data
var p1 = createUser("BestPlayer123", "testpassword");
p1.onlineStatus = true;
p1.statWin = 20;
p1.statLoss = 10;
p1.statGames = 30;
p1.privacy = true;

var p2 = createUser("NoobStomper", "testpassword");
p2.onlineStatus = true;
p2.statWin = 17;
p2.statLoss = 13;
p2.statGames = 30;

var p3 = createUser("WorstPlayer456", "differentpassword");

var p4 = createUser("SomeOtherPlayer", "testpassword");
p4.privacy = true;
p4.onlineStatus = true;

var p5 = new createUser("konnektor", "testpassword");
p5.statWin = 10;
p5.statLoss = 20;
p5.statGames = 30;

sendFriendRequest(p1.userID, p2.userID);	//p1 sends a friend req to p2
sendFriendRequest(p2.userID, p1.userID);	//p2 sends a friend req to p1, now they're friends
sendFriendRequest(p1.userID, p4.userID);
sendFriendRequest(p1.userID, p5.userID);	
sendFriendRequest(p3.userID, p1.userID);	
//by the end p1 should be friends with p2, a sent req to p4 and p5, and a pending req from p3

createGameInvite(p1.userID, p3.userID, 0);	//p1 invites p3 to play a public game
createGameInvite(p3.userID, p1.userID, 0);	//p3 invites p1 to play a public game. a game will start

createGameInvite(p1.userID, -1, 0);		//p1 wants a public random match
createGameInvite(p3.userID, -1, 0);		//p3 wants a public random match. p3 matches with p1
createGameInvite(p2.userID, -1, 0);		//p1 wants a random match. overwrites old invite
createGameInvite(p4.userID, -1, 0);		//p4 wants a random match. p4 matches with p1

createGameInvite(p1.userID, p3.userID, 0);	//p1 invites p3 to play a public game
createGameInvite(p1.userID, p5.userID, 1);	//p1 invites p5 to play a public game
createGameInvite(p1.userID, p2.userID, 2);	//p1 invites p2 to play a public game
createGameInvite(p4.userID, p1.userID, 2);	//p1 invites p2 to play a public game

createGameInvite(p1.userID, -1, 2);

//creating some games
g1 = createNewGame(p1, p2, 0);
g2 = createNewGame(p1, p3, 2);
g3 = createNewGame(p5, p1, 1);
g4 = createNewGame(p4, p1, 0);
g5 = createNewGame(p1, p2, 0);
g5.recordedMoves.push(7);

g6 = createNewGame(p1, p4, 2);
g7 = createNewGame(p2, p1, 1);
g8 = createNewGame(p3, p1, 0);
g9 = createNewGame(p1, p2, 0);
g10 = createNewGame(p5, p2, 2);
g11 = createNewGame(p4, p2, 2);

//completing some games
finishGame(g6.gameID, p1, p4);
finishGame(g7.gameID, p2, p1);
finishGame(g8.gameID, p1, p3);
finishGame(g9.gameID, p2, p1);
finishGame(g11.gameID, p4, p2);

module.exports = {
	user,
	userArray,
	createUser,
	isValidUser,
	canAccessUser,
	getUser,
	searchUsers,
	findUserID,
	findUser,
	sendFriendRequest,
	cancelFriendRequest,
	makeFriends,
	removeFriend,
	getUserFriends,
	getUserRequestsInbox,
	getUserRequestsOutbox,
	getUserGameInviteInbox,
	getUserGameInviteOutbox,
	getUserGames,
	getLeaderboard,

	game,
	createNewGame,
	finishGame,
	canAccessGame,
	findGameID,
	getGames,
	createGameInvite,
	cancelGameInvite,
	setWin,
	forfeitGame
}