const fs = require('fs');
const express = require('express');
const app = express();

//Create the router
let router = express.Router();

router.get("/:id", queryParser);

function queryParser(req, res, next){
	let id = req.params.id;
	let fileName = "javascript/" + id;
	if(fs.existsSync(fileName)){
		let data = fs.readFileSync(fileName);
		res.status(200).send(data);
	}
	else{
		res.status(500).send("Couldn't find script.");
	}
}

//Export the router object, so it can be mounted in the store-server.js file
module.exports = router;