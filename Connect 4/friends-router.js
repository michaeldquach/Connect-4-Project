const express = require('express');
const app = express();
const session = require('express-session');
const usersModule = require('./javascript/usersModule.js');
const getCurrentUser = usersModule.findUser;	//req.session.userName as argument

//Create the router
let router = express.Router();

router.get("", (req, res, next)=> {
	if(req.session.loggedIn){
		res.render('pages/friends', {online: req.session.loggedIn, currentUser: getCurrentUser(req.session.userName)}); 
	}
	else{
		res.render('pages/loginLanding', {online: req.session.loggedIn});
	}
});

//Export the router object, so it can be mounted in the store-server.js file
module.exports = router;