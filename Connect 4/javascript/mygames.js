window.addEventListener("load", function() {
	//get all tablink elements
  	var tabLinks = document.getElementsByClassName("tablink");

  	//add openTab function to each

  	tabLinks[0].addEventListener("click", function(){
  		openTab('Active Games', tabLinks[0], '#f84982');
  	});

  	tabLinks[1].addEventListener("click", function(){
  		openTab('Game History', tabLinks[1], '#f84982');
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

	var userProfileGames = [];

	//Asynchronously load logged in user's game array
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){
			getProfileGames(userProfileGames, JSON.parse(this.responseText));
		}
	};
	xhttp.open("GET", "/users/id/" + userProfile.userID + "/games", true);
	xhttp.send();
});

//asychronous method to load game array
function getProfileGames(profileGames, response){
	for(i = 0; i < response.foundGames.length; i++){
		profileGames.push(response.foundGames[i]);
	}
	//sort so that most recent games show first
	profileGames = profileGames.sort(function(a,b){
		return b.gameID - a.gameID;
	});

	loadActiveGamesData(profileGames.filter(x => x.complete === false));
	loadGameHistoryData(profileGames.filter(x => x.complete === true));
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

function loadActiveGamesData(items){
	const table = document.getElementById("activegameTable");
	items.forEach(item => {
		let row = table.insertRow();
		let opponent = row.insertCell(0);
		if(item.player1ID === userProfile.userID){		
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
		else if(item.player2ID === userProfile.userID){
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
			if(item.player1ID === userProfile.userID){
				status.innerHTML = "My turn!";
			}
			else if(item.player2ID === userProfile.userID){
				status.innerHTML = "Opponent's turn";
			}
		}
		else{
			if(item.player1ID === userProfile.userID){
				status.innerHTML = "Opponent's turn";
			}
			else if(item.player2ID === userProfile.userID){
				status.innerHTML = "My turn!";
			}
		}
		let spectate = row.insertCell(2);
		spectate.innerHTML = '<a href= \' /mygames/' + item.gameID + '\'>'+"Resume"+'</a>';
	});
}

function loadGameHistoryData(items){
	const table = document.getElementById("gamehistoryTable");
	items.forEach(item => {
		let row = table.insertRow();
		let opponent = row.insertCell(0);
		if(item.player1ID === userProfile.userID){		
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
		else if(item.player2ID === userProfile.userID){
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
		if(item.winner === userProfile.userID){
			outcome.innerHTML = "Win";
		}
		else if(item.winner === -1){
			outcome.innerHTML = "Draw";
		}
		else{
			outcome.innerHTML = "Loss";
		}
		let replay = row.insertCell(2);
		replay.innerHTML = '<a href= \' /mygames/' + item.gameID + '\'>'+"View Replay"+'</a>';
	});
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