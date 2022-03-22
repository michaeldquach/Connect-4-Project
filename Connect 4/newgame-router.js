const express = require('express');
const app = express();
const session = require('express-session');
const usersModule = require('./javascript/usersModule.js');
const getCurrentUser = usersModule.findUser;

//Create the router
let router = express.Router();

router.get("", (req, res, next)=> {	
	if(req.session.loggedIn){	
		var opponentID = -1;
		if(req.query.opponentID){
			opponentID = req.query.opponentID;
		}
		res.render('pages/newgame', {opponentID: opponentID, online: req.session.loggedIn}); 
	}
	else{
		res.render('pages/loginLanding', {online: req.session.loggedIn});
	} 
});

//Export the router object, so it can be mounted in the store-server.js file
module.exports = router;