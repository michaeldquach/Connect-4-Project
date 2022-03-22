window.addEventListener("load", function() {	
	//get all tablink elements
  	var tabLinks = document.getElementsByClassName("tablink");

  	//add openTab function to each
  	tabLinks[0].addEventListener("click", function(){
  		openTab('Statistics', tabLinks[0], '#f84982');
  	});

  	tabLinks[1].addEventListener("click", function(){
  		openTab('Active Games', tabLinks[1], '#f84982');
  	});

  	tabLinks[2].addEventListener("click", function(){
  		openTab('Game History', tabLinks[2], '#f84982');
  	});

  	getIsFriendsWithLogged(function(result){
		if(result){
			tabLinks[3].innerText = 'Unfriend';
  			tabLinks[3].addEventListener("click", function(){
  				sendRemoveFriend();
  				location.reload();
  			});
		}
		else{
			tabLinks[3].innerText = 'Add Friend';
  			tabLinks[3].addEventListener("click", function(){
  				sendFriendRequest();
  				location.reload();
  			});
		}
	});	

  	// Get the element with id="defaultOpen" and click on it
	document.getElementById("defaultOpen").click();

	//add searchTable function to each input field
	document.getElementById("gameactiveInput").addEventListener("keyup", function(){
		searchTable('gameactiveInput', 'activegameTable', 0);
	});

	document.getElementById("gamehistoryInput").addEventListener("keyup", function(){
		searchTable('gamehistoryInput', 'gamehistoryTable', 0);
	});

	var profileGames = [];

	//Asynchronously load profile's game array
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){
			getProfileGames(profileGames, JSON.parse(this.responseText));
		}
	};
	xhttp.open("GET", "/users/id/" + playerProfile.userID + "/games", true);
	xhttp.send();

	//Load the current user's profile stats
	loadStatisticsData(playerProfile);
});

function loadStatisticsData(item){
	const table = document.getElementById("statisticsTable");
	let row = table.insertRow();

	let games = row.insertCell(0);
	games.innerHTML = item.statGames;

	let wins = row.insertCell(1);
	wins.innerHTML = item.statWin;

	let losses = row.insertCell(2);
	losses.innerHTML = item.statLoss;

	let draws = row.insertCell(3);
	draws.innerHTML = item.statDraw;

	let winrate = row.insertCell(4);
	if(item.statGames != 0){
		winrate.innerHTML = (item.statWin/item.statGames * 100).toFixed(2);
	}
	else{
		winrate.innerHTML = "N/A";
	}
}

function loadActiveGamesData(items){
	const table = document.getElementById("activegameTable");
	items.forEach(item => {
		let row = table.insertRow();

		let opponent = row.insertCell(0);
		if(item.player1ID === playerProfile.userID){		
			//because getting profile access is an asynchronous call, we get the result with callback
			getProfileAccess(item.player2ID, function(result){
				if(result){
					opponent.innerHTML = '<a href= \' /community/' + item.player2ID + '\'>'+item.player2+'</a>';
				}
				else{
					opponent.innerHTML = item.player2;
				}
			});		
		}
		else if(item.player2ID === playerProfile.userID){
			//because getting profile access is an asynchronous call, we get the result with callback
			getProfileAccess(item.player1ID, function(result){
				if(result){
					opponent.innerHTML = '<a href= \' /community/' + item.player1ID + '\'>'+item.player1+'</a>';
				}
				else{
					opponent.innerHTML = item.player1;
				}
			});		
		}

		//determine who's move it is
		let status = row.insertCell(1);
		if(item.recordedMoves.length % 2 === 0){
			//console.log(item.recordedMoves.length);
			if(item.player1ID === playerProfile.userID){
				status.innerHTML = "Playing turn";
			}
			else if(item.player2ID === playerProfile.userID){
				status.innerHTML = "Opponent's turn";
			}
		}
		else{
			//console.log(item.recordedMoves.length);
			if(item.player1ID === playerProfile.userID){
				status.innerHTML = "Opponent's turn";
			}
			else if(item.player2ID === playerProfile.userID){
				status.innerHTML = "Playing turn";
			}
		}

		let spectate = row.insertCell(2);
		getGameAccess(item.gameID, function(result){
			if(result){
				spectate.innerHTML = '<a href= \' /mygames/' + item.gameID + '\'>'+"View Game"+'</a>';
			}
			else{
				spectate.innerHTML = "Private";
			}
		});
	});
}

//shows last 5 games completed by this player
function loadGameHistoryData(items){
	const table = document.getElementById("gamehistoryTable");
	items.forEach(item => {
		let row = table.insertRow();

		let opponent = row.insertCell(0);
		if(item.player1ID === playerProfile.userID){		
			//because getting profile access is an asynchronous call, we get the result with callback
			getProfileAccess(item.player2ID, function(result){
				if(result){
					opponent.innerHTML = '<a href= \' /community/' + item.player2ID + '\'>'+item.player2+'</a>';
				}
				else{
					opponent.innerHTML = item.player2;
				}
			});		
		}
		else if(item.player2ID === playerProfile.userID){
			//because getting profile access is an asynchronous call, we get the result with callback
			getProfileAccess(item.player1ID, function(result){
				if(result){
					opponent.innerHTML = '<a href= \' /community/' + item.player1ID + '\'>'+item.player1+'</a>';
				}
				else{
					opponent.innerHTML = item.player1;
				}
			});		
		}

		let outcome = row.insertCell(1);
		if(item.winner === playerProfile.userID){
			outcome.innerHTML = "Win";
		}
		else if(item.winner === -1){
			outcome.innerHTML = "Draw";
		}
		else{
			outcome.innerHTML = "Loss";
		}

		let replay = row.insertCell(2);
		getGameAccess(item.gameID, function(result){
			if(result){
				replay.innerHTML = '<a href= \' /mygames/' + item.gameID + '\'>'+"View Replay"+'</a>';
			}
			else{
				replay.innerHTML = "Private";
			}
		});	
	});
}

function getIsFriendsWithLogged(callback){
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
	xhttp.open("GET", "/users/currentUser/friends/" + playerProfile.userID, true);
	xhttp.send();
} 

//asychronous method to load game array
function getProfileGames(profileGames, response){
	var numHistoryItems = 5;	//max items to show up in history

	for(i = 0; i < response.foundGames.length; i++){
		profileGames.push(response.foundGames[i]);
	}
	profileGames = profileGames.sort(function(a,b){
		return b.gameID - a.gameID;
	});
	loadActiveGamesData(profileGames.filter(x => x.complete === false));
	loadGameHistoryData(profileGames.filter(x => x.complete === true).slice(0, numHistoryItems));
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

//asynchronous get request to see if the current user can access the requested id
//they can get the link if they're a friend or if the profile is not private
function getGameAccess(gameID, callback){
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
	xhttp.open("GET", "/games/" + gameID + "/access", true);
	xhttp.send();
}

//asynchronous put request: logged in user sends friend request to id of profile page
function sendFriendRequest(){
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){
			//console.log(this.response);
		}
		else if(this.readyState == 4 && this.status == 401){
			alert(this.response);
		}
	};
	xhttp.open("PUT", "/users/currentUser?sendrequest=" + playerProfile.userID, true);
	xhttp.send();
}

//asynchronous put request: logged in user sends friend request to id of profile page
function sendRemoveFriend(){
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){
			//console.log(this.response);
		}
	};
	xhttp.open("PUT", "/users/currentUser?removefriend=" + playerProfile.userID, true);
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

function searchTable(inputID, tableID, column){
    var input, filter, table, tr, td, i, txtValue;

    input = document.getElementById(inputID);
    filter = input.value.toUpperCase();
    table = document.getElementById(tableID);
    tr = table.getElementsByTagName('tr');
  
    for(i = 0; i < tr.length; i++){
        td = tr[i].getElementsByTagName("td")[column];
        if(td){
            txtValue = td.textContent || td.innerText
            if(txtValue.toUpperCase().indexOf(filter) > -1){
                tr[i].style.display = "";
            }
            else{
                tr[i].style.display = "none";
            }
        }
    }
}