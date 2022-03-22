const express = require('express');
const app = express();
const session = require('express-session');
const usersModule = require('./javascript/usersModule.js');
const getCurrentUser = usersModule.findUser;

//Create the router
let router = express.Router();

router.get("", (req, res, next)=> {
	if(req.session.loggedIn){
		//todo make my games page when no game is loaded
		res.render('pages/mygames', {online: req.session.loggedIn, user: getCurrentUser(req.session.userName)}); 
	}
	else{
		res.render('pages/loginLanding', {online: req.session.loggedIn});
	} 
});

router.get("/:id", findGame);

function findGame(req, res, next){
	let id = req.params.id;
	gameID = Number(id);
	let game = usersModule.findGameID(gameID);
	if(game){
		if(usersModule.canAccessGame(req.session.currentUserID, gameID)){
			//console.log(req.session.currentUserID);
			let loggedUserID = req.session.currentUserID;
			res.render('pages/match', {online: req.session.loggedIn, game: game, loggedUserID: loggedUserID, user: getCurrentUser(req.session.userName)});
		}
		else{
			res.status(500).send("You do not have permission to access this game due to its privacy settings.");
		}
	}
	else{
		res.status(404).send("Game with this id does not exist");
	}
}

//Export the router object, so it can be mounted in the store-server.js file
module.exports = router;