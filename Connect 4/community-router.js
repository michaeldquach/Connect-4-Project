const express = require('express');
const app = express();
const session = require('express-session');
const usersModule = require('./javascript/usersModule.js');
const getCurrentUser = usersModule.findUser;

//Create the router
let router = express.Router();

router.get("", (req, res, next)=> {	res.render('pages/community', {online: req.session.loggedIn}); });

router.get("/:id", findUserProfile);

function findUserProfile(req, res, next){
	let id = req.params.id;
	userID = Number(id);
	let found = usersModule.getUser(getCurrentUser(req.session.userName), userID);
	if(found){
		res.render('pages/communityProfile', {online: req.session.loggedIn, user: found});
	}
	else{
		res.status(403).send("You do not have permission to access this profile due to their privacy settings.");
	}
}

//Export the router object, so it can be mounted in the store-server.js file
module.exports = router;