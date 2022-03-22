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

//GET array of games
router.get("/", [queryParser, loadGames, respondGames]);

//GET boolean to see if the current user can access the given user
router.get("/:id/access", getGameAccess);

//PUT move into game id's move array
router.put("/:id/moves", putMove);

//PUT winner for game, and update completion
router.put("/:id/finished", finishGame);

router.put("/:id/forfeit", forfeitGame);

//todo
function queryParser(req, res, next){
	const MAX_GAMES = 50;

	//Max number of results to send back
	if(!req.query.limit){
		req.query.limit = 10;
	}
	if(req.query.limit > MAX_GAMES){
		req.query.limit = MAX_GAMES;
	}

	//page stuff here

	//If there's no player name parameter
	if(!req.query.player){
		req.query.player = "";
	}

	//If there's no active parameter
	if(!req.query.active){
		req.query.active = null;
	}
	else if(req.query.active === "true"){
		req.query.active = true;
	}
	else if(req.query.active === "false"){
		req.query.active = false;
	}

	//If there's no detail parameter
	if(!req.query.detail){
		req.query.detail = "summary";
	}

	next();
}

function loadGames(req, res, next){
	let searchedGames;
	searchedGames = usersModule.getGames(req.query.player, req.query.active, req.query.detail);

	searchedGames = searchedGames.slice(0, req.query.limit);
	res.searchedGames = searchedGames;
	next();
}

//todo
function respondGames(req, res, next){
	/*res.format({
		"text/html": () => {res.status(200).send(createHTML(res.users, req))},
		"application/json": () => {res.status(200).json(res.users)}
	});*/
	res.status(200).send(JSON.stringify(res.searchedGames));
	next();
}

//Returns boolean to see if the current user id can access the given game id
function getGameAccess(req, res, next){
	if(usersModule.canAccessGame(req.session.currentUserID, Number(req.params.id))){
		res.status(200).send("true");
	}
	else{
		res.status(200).send("false");
	}
	next();
}

function putMove(req, res, next){
	var foundGame = findGameID(Number(req.params.id));

	let addedMove = Number(req.query.move);

	if(!req.session.loggedIn){
		res.status(401).send("You must be logged in to do that.");
		return;
	}

	let currentUserID = req.session.currentUserID;

	if(foundGame && !foundGame.complete){
		//If the logged in player is player 1 and it is their move
		if(foundGame.recordedMoves.length % 2 == 0 && foundGame.player1ID === currentUserID){
			foundGame.recordedMoves.push(addedMove);
			res.status(200).send("Added move successfully.");
		}
		//If the logged in player is player 2 and it is their move
		else if(foundGame.recordedMoves.length % 2 == 1 && foundGame.player2ID === currentUserID){
			foundGame.recordedMoves.push(addedMove);
			res.status(200).send("Added move successfully.");
		}
		else{
			res.status(403).send("It is not your turn yet.");
		}
	}	
	else{
		res.status(403).send("The game is already over.");
	}
}

function finishGame(req, res, next){
	let winnerID = Number(req.query.winner);

	if(usersModule.setWin(Number(req.params.id), winnerID, false)){
		res.status(200).send("Game completed!");
	}
	else{
		res.status(200).send("The game ended in a draw.");
	}
}

function forfeitGame(req, res, next){
	if(usersModule.forfeitGame(Number(req.params.id), Number(req.session.currentUserID))){
		res.status(200).send("Game forfeited.");
	}
	else{
		res.status(403).send("Error forfeiting game.");
	}

	
}

//Export the router object, so it can be mounted in the store-server.js file
module.exports = router;