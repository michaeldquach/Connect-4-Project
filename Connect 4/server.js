const express = require('express');
const app = express();
const session = require('express-session');
const usersModule = require('./javascript/usersModule.js');
const getCurrentUser = usersModule.findUser;

//Express stuff
app.set("view engine", "pug");

app.use(session({ secret: 'some secret here', cookie:{maxAge: 600000}}))

app.use(function(req, res, next){
	//Useful print statements for debugging
	//console.log(req.session);
	//console.log(req.method);
	//console.log(req.url);
	//console.log(req.get("Content-Type"));
	initialize(req, res, next);
	next();
});

//Routing
let usersRouter = require("./users-router");
app.use("/users", usersRouter);

let gamesRouter = require("./games-router");
app.use("/games", gamesRouter);

let javascriptRouter = require("./javascript-router");
app.use("/javascript", javascriptRouter);

let newGameRouter = require("./newgame-router");
app.use("/newgame", newGameRouter);

let myGamesRouter = require("./mygames-router");
app.use("/mygames", myGamesRouter);

let friendsRouter = require("./friends-router");
app.use("/friends", friendsRouter);

let communityRouter = require("./community-router");
app.use("/community", communityRouter);

//Login handling
app.post("/login", logInUser);

app.post("/logout", logOutUser);

app.post("/register", registerUser);

//Home page
//could make it so that GET current user call is made inside the dashboard page
app.get("/", (req, res, next)=> {
	if(req.session.loggedIn){
		res.render('pages/index', {online: req.session.loggedIn, user: getCurrentUser(req.session.userName)});
	}
	else{
		res.render('pages/loginLanding', {online: req.session.loggedIn});
	} 
});

app.listen(3000);
console.log("Server listening at http://localhost:3000");

function logInUser(req, res){
	if(req.session.loggedIn == true){
		res.send("You are already logged in.");
	}
	else{

		//let logUser;
		let logUserName = req.query.userName;
		let logUserPassword = req.query.password;

		let authenBool = true;

		//goes through users array
		usersModule.userArray.forEach(u => {
			//checks if usernames matches a user in the data base
			if(logUserName == u.userName && logUserPassword == u.getPassword()){

				authenBool = false;
				//create username property in session object - identifies session with specific user
				req.session.userName = logUserName;
				req.session.currentUserID = u.userID;
				req.session.loggedIn = true;
				u.onlineStatus = true;
				res.status(200).send("Login successful!");
			}
		});

		if(authenBool){
			res.status(401).send("Incorrect username or password.");
		}
	}
}

function logOutUser(req, res){
	u = getCurrentUser(req.session.userName);	
	if(u){
		u.onlineStatus = false;
	}
	req.session.destroy();
	res.status(200).send("Logged out.");
}

function registerUser(req, res){
	if(usersModule.createUser(req.query.userName, req.query.password)){
		res.status(200).send("Account created successfully!");
	}
	else{
		res.status(401).send("Failed to create account.");
	}
}

//Middleware so that all cookie sessions are initialized
function initialize(req, res, next){
	if(!req.session.initialized){
		//console.log("Initializing new session");
		req.session.initialized = true;
		req.session.loggedIn = false;
	}
	next();
}