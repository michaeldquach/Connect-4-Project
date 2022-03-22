window.addEventListener("load", function() {
	if(document.URL.includes("newgame")){
		document.getElementById("pagetitle").innerText = "Create a new game";
	}
	else if(document.URL.includes("mygames")){
		document.getElementById("pagetitle").innerText = "My Games";
		if(typeof game !== 'undefined'){
			document.getElementById("pagetitle").innerText = "Match - " + game.player1 + " vs " + game.player2;
		}
	}
	else if(document.URL.includes("friends")){
		document.getElementById("pagetitle").innerText = "My Friends";
	}
	else if(document.URL.includes("community")){
		document.getElementById("pagetitle").innerText = "Community";
		if(typeof playerProfile !== 'undefined'){
			document.getElementById("pagetitle").innerText = "Community - " + playerProfile.userName;
		}
	}
	else{	
		document.getElementById("pagetitle").innerText = "My Profile";
		if(typeof userProfile !== 'undefined'){
			document.getElementById("pagetitle").innerText = "My Profile - " + userProfile.userName;
		}		
	}

	var submitType;

	document.getElementById("login-form").addEventListener("submit", function(){
		if(submitType === "register"){
			register();
			return false;
		}
		else{
			login();
			return false;
		}
	});

	document.getElementById("close-button").addEventListener("click", function(){
		document.getElementById('id01').style.display='none';
	});

	document.getElementById("registerButton").addEventListener("click", function(){
		submitType = "register";
	});

	if(online){
		document.getElementById("logButton").innerText = "Log out";
	}
	else{
		document.getElementById("logButton").innerText = "Log in";		
	}

	document.getElementById("logButton").addEventListener("click", function(){
		if(online){
			logout();
		}
		else{
			document.getElementById('id01').style.display= 'block';
		}
	});

	if(!online){
		document.getElementById("logButton").click();
	}
});

function login(){
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){
			alert(this.response);
			location.reload();
		}
		else if(this.readyState == 4 && this.status == 401){
			alert(this.response);
			location.reload();
		}
	};
	//todo not send password in PLAIN TEXT OMG
	xhttp.open("POST", "/login?userName=" + document.getElementById("userName").value + "&password=" + document.getElementById("password").value, true);
	xhttp.send();
}

function logout(){
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){
			alert(this.response);
			location.reload();
		}
		else if(this.readyState == 4 && this.status == 401){
			alert(this.response);
			location.reload();
		}
	};
	//todo not send password in PLAIN TEXT OMG
	xhttp.open("POST", "/logout", true);
	xhttp.send();

}

//can use regex to check username and password fields to see if they're valid inputs
function register(){
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){
			alert(this.response);
			location.reload();
		}
		else if(this.readyState == 4 && this.status == 401){
			alert(this.response);
			location.reload();
		}
	};
	//todo not send password in PLAIN TEXT OMG
	xhttp.open("POST", "/register?userName=" + document.getElementById("userName").value + "&password=" + document.getElementById("password").value, true);
	xhttp.send();	
}