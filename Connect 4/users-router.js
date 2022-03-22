const fs = require('fs');
const express = require('express');
const app = express();
const session = require('express-session');
const usersModule = require('./javascript/usersModule.js');
const getCurrentUser = usersModule.findUser;	//req.session.userName as argument

const findUserID = usersModule.findUserID;
const findGameID = usersModule.findGameID;
const searchUsers = usersModule.searchUsers;

//Create the router
let router = express.Router();

//GET array of users
router.get("/", [queryParser, loadUsers, respondUsers]);

router.get("/:users", findUserByName);

//GET user with given id
router.get("/id/:id", [getUser, sendUser]);

router.get("/id/:id/name", getUserName);

//GET array of user id's games
router.get("/id/:id/games", getUserGames);

//GET boolean to see if the current user can access the given user
router.get("/id/:id/access", getUserAccess);

//GET the logged in user's friends array (as objects)
router.get("/currentUser/friends", getCurrentUserFriends);

//GET boolean to see if current user is friends with id
router.get("/currentUser/friends/:id", getIsFriendsWithLogged);

//GET the logged in user's requests array (as objects)
router.get("/currentUser/requests", getCurrentUserRequests);

//GET the logged in user's game invites array (as objects)
router.get("/currentUser/gameInvites", getCurrentUserGameInvites);

router.put("/currentUser", [updateParser, updateCurrentUser]);

function queryParser(req, res, next){
	const MAX_USERS = 50;

	//Max number of results to send back
	if(!req.query.limit){
		req.query.limit = 10;
	}
	if(req.query.limit > MAX_USERS){
		req.query.limit = MAX_USERS;
	}

	//page stuff here

	//If there's no name parameter
	if(!req.query.name){
		req.query.name = "";
	}

	next();
}

function loadUsers(req, res, next){
	let searchedUsers;
	if(req.query.leaderboards){
		searchedUsers = usersModule.getLeaderboard(req.query.name);
	}
	else{		
		searchedUsers = searchUsers(getCurrentUser(req.session.userName), req.query.name).map(findUserID);
	}
	searchedUsers = searchedUsers.slice(0, req.query.limit);
	res.searchedUsers = searchedUsers;
	next();
}

function respondUsers(req, res, next){
	/*res.format({
		"text/html": () => {res.status(200).send(createHTML(res.users, req))},
		"application/json": () => {res.status(200).json(res.users)}
	});*/
	res.status(200).send(JSON.stringify(res.searchedUsers));
	next();
}

function findUserByName(req, res, next){
	let username = req.params.users;

	var result = usersModule.findUser(username);

	if(result !== null){
		res.status(200).send(JSON.stringify(result));
	}
	else{
		res.status(404).send("Couldn't find user.");
	}
}

function getUser(req, res, next){
	let id = req.params.id;
	userID = Number(id);

	let foundUser = findUserID(userID);
	if(foundUser.privacy === false){
		res.foundUser = foundUser;
	}
	else{
		res.foundUser = null;
	}
	next();
}

function sendUser(req, res, next){
	if(res.foundUser != null){
		res.status(200).send(JSON.stringify(res.foundUser));
	}
	else{
		res.status(404).send("User not found!");
	}
	next();
}

//while this accesses private accounts, it only returns their name
function getUserName(req, res, next){
	var user = usersModule.findUserID(Number(req.params.id));
	if(user){
		var result = user.userName;
		res.status(200).send(result);
	}
	else{
		res.status(404).send("User not found!");
	}
}

//Returns array of games of the given user id
function getUserGames(req, res, next){	
	let id = req.params.id;
	userID = Number(id);

	let foundGames = usersModule.getUserGames(userID).map(findGameID);
	res.status(200).send(JSON.stringify({foundGames}));
}

//Returns boolean to see if the current user can access the given id
function getUserAccess(req, res, next){
	if(usersModule.canAccessUser(req.session.currentUserID, Number(req.params.id))){
		res.status(200).send("true");
	}
	else{
		res.status(200).send("false");
	}
}

function getCurrentUserFriends(req, res, next){
	let friendsArray = usersModule.getUserFriends(req.session.currentUserID).map(findUserID);
	res.status(200).send(JSON.stringify({friendsArray}));
}

function getCurrentUserRequests(req, res, next){
	let incomingRequests = usersModule.getUserRequestsInbox(req.session.currentUserID).map(findUserID);
	let outgoingRequests = usersModule.getUserRequestsOutbox(req.session.currentUserID).map(findUserID);
	res.status(200).send(JSON.stringify({incomingRequests: incomingRequests, outgoingRequests: outgoingRequests}));
}

function getCurrentUserGameInvites(req, res, next){	
	let incomingGameInvites = usersModule.getUserGameInviteInbox(req.session.currentUserID);
	let outgoingGameInvites = usersModule.getUserGameInviteOutbox(req.session.currentUserID);
	res.status(200).send(JSON.stringify({incomingGameInvites: incomingGameInvites, outgoingGameInvites: outgoingGameInvites}));
}

//Returns boolean to see if the current user can access the given id
function getIsFriendsWithLogged(req, res, next){
	let id = req.params.id;
	let userID = Number(id);

	if(req.session.userName && getCurrentUser(req.session.userName).friendsArray.includes(userID)){
		res.status(200).send("true");
	}
	else{
		res.status(200).send("false");
	}
}

//We might put more parameters in here that we'd like to update on the current user
function updateParser(req, res, next){	
	if(req.query.privacy === "true"){
		req.query.privacy = true;
	}
	else if(req.query.privacy === "false"){
		req.query.privacy = false;
	}
	if(req.query.sendrequest != null){
	}
	if(req.query.cancelrequest != null){
	}

	next();
}

function updateCurrentUser(req, res, next){
	if(req.session.loggedIn){
		let currentUser = getCurrentUser(req.session.userName);

		if(req.query.privacy != null){
			currentUser.privacy = req.query.privacy;
			res.status(200).send("Updated privacy settings.");
		}

		//handle friend requests
		if(req.query.sendrequest != null){
			usersModule.sendFriendRequest(currentUser.userID, Number(req.query.sendrequest));
			res.status(200).send("Friend request sent.");
		}
		if(req.query.declinerequest != null){			
			usersModule.cancelFriendRequest(Number(req.query.declinerequest), currentUser.userID);
			res.status(200).send("Friend request declined.");
		}
		if(req.query.cancelrequest != null){			
			usersModule.cancelFriendRequest(currentUser.userID, Number(req.query.cancelrequest));
			res.status(200).send("Friend request cancelled.");
		}
		if(req.query.removefriend != null){
			usersModule.removeFriend(currentUser.userID, Number(req.query.removefriend));
			res.status(200).send("Friend removed.");
		}

		//handle game invites
		if(req.query.sendgameinvite != null){
			if(usersModule.createGameInvite(currentUser.userID, Number(req.query.sendgameinvite), Number(req.query.spectatormode))){
				res.status(200).send("Game invite sent.");
			}
			else{
				res.status(404).send("Failed to send invite. Previous invite still pending.");
			}
		}
		if(req.query.declinegameinvite != null){		
			if(usersModule.cancelGameInvite(Number(req.query.declinegameinvite), currentUser.userID, Number(req.query.spectatormode))){
				res.status(200).send("Game invite declined.");
			}
			else{
				res.status(404).send("Failed to decline invite.");
			}
		}
		if(req.query.cancelgameinvite != null){			
			if(usersModule.cancelGameInvite(currentUser.userID, Number(req.query.cancelgameinvite), Number(req.query.spectatormode))){
				res.status(200).send("Game invite cancelled.");
			}
			else{
				res.status(404).send("Failed to decline invite.");
			}
		}
	}
	else{
		res.status(401).send("You must be logged in to do that.");
	}
}

//Export the router object, so it can be mounted in the store-server.js file
module.exports = router;