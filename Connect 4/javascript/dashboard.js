window.addEventListener("load", function() {
	//get all tablink elements
  	var tabLinks = document.getElementsByClassName("tablink");

  	//add openTab function to each
  	tabLinks[0].addEventListener("click", function(){
  		openTab('Statistics', tabLinks[0], '#f84982');
  	});

  	tabLinks[1].addEventListener("click", function(){
  		openTab('Settings', tabLinks[1], '#f84982');
  	});

  	// Get the element with id="defaultOpen" and click on it
	document.getElementById("defaultOpen").click();

	document.getElementById("privacySwitch").addEventListener("click", function(){
		putPrivacy(document.getElementById("privacySwitch").checked);
	});

	//load the logged in user's stats
	loadStatisticsData(userProfile);

	//Load the user's privacy setting
	document.getElementById("privacySwitch").checked = userProfile.privacy;
});

function putPrivacy(boolean){
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){
			//console.log("cool beans");
		}
	};
	xhttp.open("PUT", "/users/currentUser?privacy=" + boolean, true);
	xhttp.send();
}

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