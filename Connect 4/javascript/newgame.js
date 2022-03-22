var opponentSelect = document.createElement("select");
var spectatorSelect = document.createElement("select");
var matchButton = document.getElementById("matchbutton");
//get all tablink elements
var tabLinks = document.getElementsByClassName("tablink");
var matchTable = document.getElementById("matchTable");
var invitesTable = document.getElementById("invitesTable");
var invitesInput = document.getElementById("invitesInput");

window.addEventListener("load", function() {	
  	//add openTab function to each
  	tabLinks[0].addEventListener("click", function(){
  		openTab('NewMatch', tabLinks[0], '#f84982');
  	});

  	tabLinks[1].addEventListener("click", function(){
  		openTab('Invites', tabLinks[1], '#f84982');
  	});

  	var matchTableRow = matchTable.insertRow(1);
  	var opponentCell = matchTableRow.insertCell(0);
  	opponentCell.appendChild(opponentSelect);

  	opponentSelect.style.width = "250px";

  	var opponentPublic = document.createElement('option');
  	opponentPublic.value = -1;
  	opponentPublic.text = "Open to Public";
  	opponentSelect.add(opponentPublic);

  	var opponentSeparator = document.createElement('option');
  	opponentSeparator.value = "none";
  	opponentSeparator.text = "Or select from Friends:";
  	opponentSeparator.disabled = true;
  	opponentSelect.add(opponentSeparator);

  	getFriendOptions();

  	var spectatorCell = matchTableRow.insertCell(1);
  	spectatorCell.appendChild(spectatorSelect);

  	spectatorSelect.style.width = "250px";

  	var spectatorPublic = document.createElement('option');
  	spectatorPublic.value = 0;
  	spectatorPublic.text = "Public";
  	spectatorSelect.add(spectatorPublic);

  	var spectatorFriends = document.createElement('option');
  	spectatorFriends.value = 1;
  	spectatorFriends.text = "Friends Only";
  	spectatorSelect.add(spectatorFriends);

  	var spectatorPrivate = document.createElement('option');
  	spectatorPrivate.value = 2;
  	spectatorPrivate.text = "Private";
  	spectatorSelect.add(spectatorPrivate);

	matchButton.addEventListener("click", function(){
		createGameInvite(opponentSelect.value, spectatorSelect.value);
	});

	getGameInvitesArray();

	invitesInput.addEventListener("keyup", function(){
		searchTable('invitesInput', 'invitesTable', 0);
	});

	// Get the element with id="defaultOpen" and click on it
	document.getElementById("defaultOpen").click();
});

function createGameInvite(opponents, spectators){
	sendGameInvite(opponents, spectators);
}

//grab array of friend names/ids
function getFriendOptions(){
	var profileFriends = {};

	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){
			var response = JSON.parse(this.responseText);

			for(i = 0; i < response.friendsArray.length; i++){
				profileFriends[response.friendsArray[i].userName] = response.friendsArray[i].userID;
			}			
			addFriendOptions(profileFriends);
		}
	};
	xhttp.open("GET", "/users/currentUser/friends", true);
	xhttp.send();
}

function addFriendOptions(friends){
	for(var friendName in friends){
		var opponentFriend = document.createElement('option');
  		opponentFriend.value = friends[friendName];

  		//Select this option if it matches the given id
  		if(Number(opponentID) === friends[friendName]){
  			opponentFriend.selected = true;
  		}

  		opponentFriend.text = friendName;
  		opponentSelect.add(opponentFriend);
	}
}

//asychronous method to load game invites array
function getGameInvitesArray(){
	var userIncomingGameInvites = {};
	var userOutgoingGameInvites = {};

	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){
			var response = JSON.parse(this.responseText);

			userIncomingGameInvites = response.incomingGameInvites;
			userOutgoingGameInvites = response.outgoingGameInvites;

			loadGameInvitesData(userIncomingGameInvites, userOutgoingGameInvites);
		}
	};
	xhttp.open("GET", "/users/currentUser/gameInvites", true);
	xhttp.send();
}

function loadGameInvitesData(incomingInvites, outgoingInvites){
	const table = invitesTable;

	Object.keys(incomingInvites).forEach(key => {
		let row = table.insertRow();

		let username = row.insertCell(0);
		
		getIDName(key, function(result){
			username.innerHTML = result;
		});

		let spectatormode = row.insertCell(1);
		if(incomingInvites[key] === 0){
			spectatormode.innerHTML = "Public";
		}
		else if(incomingInvites[key] === 1){
			spectatormode.innerHTML = "Friends Only";
		}
		else if(incomingInvites[key] === 2){
			spectatormode.innerHTML = "Private";
		}

		let status = row.insertCell(2);
		status.innerHTML = "Incoming";

		let action1 = row.insertCell(3);

		var acceptLink = document.createElement('a');
		acceptLink.innerHTML = "Accept";
		acceptLink.style.textDecoration = "underline";

		acceptLink.addEventListener('click', function(){
  			sendGameInvite(key, incomingInvites[key]);
  		});

		action1.append(acceptLink);
		
		let action2 = row.insertCell(4);

		var cancelLink = document.createElement('a');
		cancelLink.innerHTML = "Decline";
		cancelLink.style.textDecoration = "underline";

		cancelLink.addEventListener('click', function(){
  			declineGameInvite(key, incomingInvites[key]);
  		});

		action2.append(cancelLink);
	});

	Object.keys(outgoingInvites).forEach(key => {
		let row = table.insertRow();

		let username = row.insertCell(0);
		if(Number(key) === -1){
			username.innerHTML = "Open to Public";
		}
		else{
			getIDName(key, function(result){
				username.innerHTML = result;
			});
		}

		let spectatormode = row.insertCell(1);
		if(outgoingInvites[key] === 0){
			spectatormode.innerHTML = "Public";
		}
		else if(outgoingInvites[key] === 1){
			spectatormode.innerHTML = "Friends Only";
		}
		else if(outgoingInvites[key] === 2){
			spectatormode.innerHTML = "Private";
		}

		let status = row.insertCell(2);
		status.innerHTML = "Pending";

		let action1 = row.insertCell(3);
		
		let action2 = row.insertCell(4);

		var cancelLink = document.createElement('a');
		cancelLink.innerHTML = "Cancel";
		cancelLink.style.textDecoration = "underline";

		cancelLink.addEventListener('click', function(){
  			cancelGameInvite(key, outgoingInvites[key]);
  		});

		action2.append(cancelLink);
	});
}

//asynchronous put request: logged in user sends game invite to id
function sendGameInvite(userID, spectatormode){
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){
			//console.log(this.response);
			alert(this.response);
  			location.reload();
		}
		else if(this.readyState == 4 && this.status == 403){
			alert(this.response);
		}
	};
	xhttp.open("PUT", "/users/currentUser?sendgameinvite=" + userID + "&spectatormode=" + spectatormode, true);
	xhttp.send();
}

//asynchronous put request: logged in user declines game invite of id 
function declineGameInvite(userID, spectatormode){
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){
			//console.log(this.response);
			//alert(this.response);
  			location.reload();
		}
		else if(this.readyState == 4 && this.status == 403){
			alert(this.response);
		}
	};
	xhttp.open("PUT", "/users/currentUser?declinegameinvite=" + userID + "&spectatormode=" + spectatormode, true);
	xhttp.send();
}

//asynchronous put request: logged in user cancels game invite to id
function cancelGameInvite(userID, spectatormode ){
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){
			//console.log(this.response);
			//alert(this.response);
  			location.reload();
		}
		else if(this.readyState == 4 && this.status == 403){
			alert(this.response);
		}
	};
	xhttp.open("PUT", "/users/currentUser?cancelgameinvite=" + userID + "&spectatormode=" + spectatormode, true);
	xhttp.send();
}

//asynchronous get request to get the username from an id
function getIDName(userID, callback){
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){
			var result = this.responseText;

			if(callback){
				callback(result);
			}
		}
	};
	xhttp.open("GET", "/users/id/" + userID + "/name", true);
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