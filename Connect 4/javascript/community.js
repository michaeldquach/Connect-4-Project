window.addEventListener("load", function() {
	//get all tablink elements
  	var tabLinks = document.getElementsByClassName("tablink");

  	//add openTab function to each
  	tabLinks[0].addEventListener("click", function(){
  		openTab('Players', tabLinks[0], '#f84982');
  	});

  	tabLinks[1].addEventListener("click", function(){
  		openTab('Leaderboards', tabLinks[1], '#f84982');
  	});

  	// Get the element with id="defaultOpen" and click on it
	document.getElementById("defaultOpen").click();

	//add searchTable function to each input field
	document.getElementById("playersInput").addEventListener("keyup", function(){
		searchPlayerTable('playersInput', 'playersTable');
	});

	document.getElementById("leaderboardInput").addEventListener("keyup", function(){
		searchLeaderboardsTable('leaderboardInput', 'leaderboardTable');
	});

	//load the tables
	searchPlayerTable('playersInput', 'playersTable');
	searchLeaderboardsTable('leaderboardInput', 'leaderboardTable');
});

function loadPlayerData(items){
	const table = document.getElementById("playersTable");
	var rowCount = table.rows.length;

	//delete old rows of the table
	for(var i = rowCount-1; i > 0; i--){
		table.deleteRow([i]);
	}

	items.forEach(item => {
		let row = table.insertRow();
		let username = row.insertCell(0);
		username.innerHTML = item.userName;

		let profile = row.insertCell(1);
		profile.innerHTML = '<a href= \' /community/' + item.userID + '\'>'+"View Profile"+'</a>';

		let status = row.insertCell(2);
		if(item.onlineStatus){
			status.innerHTML = "Online";
		}
		else{
			status.innerHTML = "Offline";
		}
	});
}

function loadLeaderboardData(items){
	const table = document.getElementById("leaderboardTable");
	var x = 1;
	var rowCount = table.rows.length;

	//deletes old rows of the table
	for(var i = rowCount-1; i > 0; i--){
		table.deleteRow([i]);
	}

	items.forEach(item => {
		let row = table.insertRow();
		let rank = row.insertCell(0);
		rank.innerHTML = x++;

		let username = row.insertCell(1);
		username.innerHTML = item.userName;

		let wins = row.insertCell(2);
		wins.innerHTML = item.statWin;

		let losses = row.insertCell(3);
		losses.innerHTML = item.statLoss;

		let draws = row.insertCell(4);
		draws.innerHTML = item.statDraw;

		let profile = row.insertCell(5);

		//because getting profile access is an asynchronous call, we get the result with callback
		getProfileAccess(item.userID, function(result){
			if(result){
				profile.innerHTML = '<a href= \' /community/' + item.userID + '\'>'+"View Profile"+'</a>';
			}
			else{
				profile.innerHTML = "Private";
			}
		});
		
		let status = row.insertCell(5);
		if(item.onlineStatus){
			status.innerHTML = "Online";
		}
		else{
			status.innerHTML = "Offline";
		}
	});
}

//Asynchronous get request to get player array
function searchPlayerTable(inputID, tableID){
    var input, filter, table, tr, td, i, txtValue;

    var input = document.getElementById(inputID);
    var filter = input.value.toUpperCase();
    var table = document.getElementById(tableID);
	
	let tableQuery = "table=" + tableID;
	let searchQuery = input.value.toLowerCase();

	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){
			var result = [];
			var response = JSON.parse(this.responseText);

    		for(i = 0; i < response.length; i++){
    			result.push(response[i]);
    		}

    		loadPlayerData(result);
		}
	};
	xhttp.open("GET", "/users?name=" + searchQuery, true);
	xhttp.send();
}

//Asynchronous get request to get leaderboard array
function searchLeaderboardsTable(inputID, tableID){
    var input, filter, table, tr, td, i, txtValue;

    var input = document.getElementById(inputID);
    var filter = input.value.toUpperCase();
    var table = document.getElementById(tableID);

	let searchQuery = input.value.toLowerCase();
	
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){
			var result = [];
			var response = JSON.parse(this.responseText);

			for(i = 0; i < response.length; i++){
    			result.push(response[i]);
    		}
		
    		loadLeaderboardData(result);
		}
	};
	xhttp.open("GET", "/users?leaderboards=true&name=" + searchQuery, true);
	xhttp.send();
}

//asynchronous get request to see if the current user can access the requested id
//they can get the link if they're a friend or if the profile is not private
function getProfileAccess(userID, callback){
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){
			var result;
			if(this.responseText === "false"){
				result = false;
			}
			else if(this.responseText === "true"){
				result = true;
			}
			if(callback){
				callback(result);
			}
		}
	};
	xhttp.open("GET", "/users/id/" + userID + "/access", true);
	xhttp.send();
}
	
function openTab(pageName,elmnt,color) {
  	var i, tabcontent, tablinks;
  	tabcontent = document.getElementsByClassName("tabcontent");
  	  	
  	for (i = 0; i < tabcontent.length; i++) {
  	  	tabcontent[i].style.display = "none";
  	}
		
  	tablinks = document.getElementsByClassName("tablink");
  	
  	for (i = 0; i < tablinks.length; i++) {
  	  	tablinks[i].style.backgroundColor = "";
  	}
  	  	
  	document.getElementById(pageName).style.display = "block";
  	elmnt.style.backgroundColor = color;
}