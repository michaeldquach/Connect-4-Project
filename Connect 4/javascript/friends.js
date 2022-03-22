window.addEventListener("load", function() {
	//get all tablink elements
  	var tabLinks = document.getElementsByClassName("tablink");

  	//add openTab function to each
  	tabLinks[0].addEventListener("click", function(){
  		openTab('Friends', tabLinks[0], '#f84982');
  	});

  	tabLinks[1].addEventListener("click", function(){
  		openTab('Requests', tabLinks[1], '#f84982');
  	});

  	// Get the element with id="defaultOpen" and click on it
	document.getElementById("defaultOpen").click();

	//add searchTable function to each input field
	document.getElementById("friendsInput").addEventListener("keyup", function(){
		searchTable('friendsInput', 'friendsTable', 0);
	});

	document.getElementById("requestsInput").addEventListener("keyup", function(){
		searchTable('requestsInput', 'requestsTable', 0);
	});

	//asynchronous call to load tables
	getFriendsArray();
	getRequestsArray();
});

//asychronous method to load friend array
function getFriendsArray(){
	var profileFriends = [];

	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){
			var response = JSON.parse(this.responseText);

			for(i = 0; i < response.friendsArray.length; i++){
				profileFriends.push(response.friendsArray[i]);
			}
		
			loadFriendsData(profileFriends);
		}
	};
	xhttp.open("GET", "/users/currentUser/friends", true);
	xhttp.send();
}

//asychronous method to load requests array
function getRequestsArray(){
	var userIncomingRequests = [];
	var userOutgoingRequests = [];

	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){
			var response = JSON.parse(this.responseText);

			for(i = 0; i < response.incomingRequests.length; i++){
				userIncomingRequests.push(response.incomingRequests[i]);
			}

			for(i = 0; i < response.outgoingRequests.length; i++){
				userOutgoingRequests.push(response.outgoingRequests[i]);
			}

			loadRequestsData(userIncomingRequests, userOutgoingRequests);
		}
	};
	xhttp.open("GET", "/users/currentUser/requests", true);
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

//asynchronous put request: logged in user sends friend request to id
function sendFriendRequest(userID){
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){
			//console.log(this.response);
  			location.reload();
		}
	};
	xhttp.open("PUT", "/users/currentUser?sendrequest=" + userID, true);
	xhttp.send();
}

//asynchronous put request: logged in user declines friend request of id 
function declineFriendRequest(userID){
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){
			//console.log(this.response);
  			location.reload();
		}
	};
	xhttp.open("PUT", "/users/currentUser?declinerequest=" + userID, true);
	xhttp.send();
}

//asynchronous put request: logged in user cancels friend request to id
function cancelFriendRequest(userID){
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){
			//console.log(this.response);
  			location.reload();
		}
	};
	xhttp.open("PUT", "/users/currentUser?cancelrequest=" + userID, true);
	xhttp.send();
}

function loadFriendsData(items){
	const table = document.getElementById("friendsTable");
	items.forEach(item => {
		let row = table.insertRow();

		let username = row.insertCell(0);
		username.innerHTML = item.userName;

		let profile = row.insertCell(1);
		profile.innerHTML = '<a href= \' /community/' + item.userID + '\'>'+"View Profile"+'</a>';
		
		let invite = row.insertCell(2);
		//todo currently link doesn't actually send game invite
		//will make it direct to new game page will friend's name filled in
		invite.innerHTML = '<a href= \' /newgame?opponentID=' + item.userID + '\'>'+"Challenge!"+'</a>';
		
		let status = row.insertCell(3);
		if(item.onlineStatus){
			status.innerHTML = "Online";
		}
		else{
			status.innerHTML = "Offline";
		}
	});
}

function loadRequestsData(array1, array2){
	const table = document.getElementById("requestsTable");

	array1.forEach(item => {
		let row = table.insertRow();

		let username = row.insertCell(0);		
		//because getting profile access is an asynchronous call, we get the result with callback
		getProfileAccess(item.userID, function(result){
			if(result){
				username.innerHTML = '<a href= \' /community/' + item.userID + '\'>'+item.userName+'</a>';
			}
			else{
				username.innerHTML = item.userName;
			}
		});


		let status = row.insertCell(1);
		status.innerHTML = "Incoming";
		
		let action1 = row.insertCell(2);
		var acceptLink = document.createElement('a');
		acceptLink.innerHTML = "Accept";
		acceptLink.style.textDecoration = "underline";

		acceptLink.addEventListener('click', function(){
  		sendFriendRequest(item.userID);
  		});

		action1.append(acceptLink);
		
		let action2 = row.insertCell(3);

		var declineLink = document.createElement('a');
		declineLink.innerHTML = "Decline";
		declineLink.style.textDecoration = "underline";

		declineLink.addEventListener('click', function(){
  		declineFriendRequest(item.userID);
  		});

		action2.append(declineLink);
	});

	array2.forEach(item => {
		let row = table.insertRow();
		
		let username = row.insertCell(0);			
		//because getting profile access is an asynchronous call, we get the result with callback
		getProfileAccess(item.userID, function(result){
			if(result){
				username.innerHTML = '<a href= \' /community/' + item.userID + '\'>'+item.userName+'</a>';
			}
			else{
				username.innerHTML = item.userName;
			}
		});

		let status = row.insertCell(1);
		status.innerHTML = "Pending";
		
		let action1 = row.insertCell(2);
		
		let action2 = row.insertCell(3);

		var cancelLink = document.createElement('a');
		cancelLink.innerHTML = "Cancel";
		cancelLink.style.textDecoration = "underline";

		cancelLink.addEventListener('click', function(){
  			cancelFriendRequest(item.userID);
  		});

		action2.append(cancelLink);
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