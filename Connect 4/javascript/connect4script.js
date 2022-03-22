var gameRow = [];

for(let i = 0; i < 7; i++){
	var gameCol = [];
	gameRow.push(gameCol);
}

var currentPlayerID;

var isPlaying = false;

var forfeitButton = document.getElementById("forfeit");

var gameBoard = document.getElementById("board");

var replayBoard = document.getElementById("replayBoard");

var replayForward = document.getElementById("replayForward");

var replayBackward = document.getElementById("replayBackward");

var exitReplay = document.getElementById("exitReplay");

var replayMoveNumber = 0;

document.addEventListener('DOMContentLoaded', () => {
	if(game){
		setLabels();

		readRecordedMoves(game.recordedMoves.length, gameRow);

		displayBoard(gameRow, gameBoard);

		if(game.complete === false){

			if(checkWin("R")){
				declareWinner(game.player1ID);
			}
			else if(checkWin("B")){
				declareWinner(game.player2ID);
			}
			else if(game.recordedMoves.length == 42){
				declareWinner(game.player1ID);	//we're declaring a draw
			}

		}
	}

	if(user !== null){
		if(user.userID === game.player1ID || user.userID === game.player2ID){
			//console.log("They are playing");
			isPlaying = true;
		}
	}

	if(!isPlaying || game.complete){
		forfeitButton.style.display = "none";
	}

	forfeitButton.addEventListener('click', function(){
		forfeit();
	});

	replayBoard.style.display = "none";
	replayForward.style.display = "none";
	replayBackward.style.display = "none";
	exitReplay.style.display = "none";

	if(game.complete){

		replayForward.style.display = "block";

		replayForward.addEventListener('click', function(){
			if(replayMoveNumber < game.recordedMoves.length){
				replayMoveNumber++;
				replay(replayMoveNumber, replayBoard);
			}
		});

		replayBackward.style.display = "block";

		replayBackward.addEventListener('click', function(){
			if(replayMoveNumber > 0){
				replayMoveNumber--;
				replay(replayMoveNumber, replayBoard);
			}
		});

		exitReplay.style.display = "block";

		exitReplay.addEventListener('click', function(){
			gameBoard.style.display = "block";
			replayBoard.style.display = "none";
			document.getElementById("viewingreplay").innerText = "";
		});
	}
});

function setLabels(){
	if(game.complete == false){
		if(game.recordedMoves.length % 2 == 0){
			currentPlayerID = game.player1ID;
			document.getElementById("current-player").innerText = "The current player is " + game.player1;
		}
		else{
			currentPlayerID = game.player2ID;
			document.getElementById("current-player").innerText = "The current player is " + game.player2;			
		}
	}
	else{
		if(game.winner === game.player1ID){
			document.getElementById("current-player").innerText = "The match has finished. The winner is " + game.player1 + ".";	
		}
		else if(game.winner === game.player2ID){
			document.getElementById("current-player").innerText = "The match has finished. The winner is " + game.player2 + ".";	
		}
		else if(game.winner === -1){
			document.getElementById("current-player").innerText = "The match has finished. The game was a draw.";				
		}
	}
}

//Reads recordedMoves array from game object, and adds to the game array
function readRecordedMoves(numMoves, grid){
	for(let i = 0; i < numMoves; i++){
		//just making sure that it actually fits in the array
		if(game.recordedMoves[i] >= 0 && game.recordedMoves[i] < 7){
			//if player 1 made this move
			if(i % 2 == 0){
				//checking that the column still has room
				if(grid[game.recordedMoves[i]].length < 6){
					//console.log("Player 1's move: column " + game.recordedMoves[i]);
					grid[game.recordedMoves[i]].push("R");
				}
			}
			//player 2 made this move
			else{				
				//checking that the column still has room
				if(grid[game.recordedMoves[i]].length < 6){
					//console.log("Player 2's move: column " + game.recordedMoves[i]);
					grid[game.recordedMoves[i]].push("B");
				}
			}
		}
	}
}

//lmao i'll do this later
function checkWin(player){

	// Check for horizontal win
    for (let j = 0; j < 3 ; j++ ){
        for (let i = 0; i < 7; i++){
            if (gameRow[i][j] == player && gameRow[i][j+1] == player && gameRow[i][j+2] == player && gameRow[i][j+3] == player){
                return true;
            }           
        }
    }
    // Check for vertical win
    for (let i = 0; i < 4 ; i++ ){
        for (let j = 0; j < 6; j++){
            if (gameRow[i][j] == player && gameRow[i+1][j] == player && gameRow[i+2][j] == player && gameRow[i+3][j] == player){
                return true;
            }           
        }
    }
    // Check for ascending diagonal win 
    for (let i = 3; i < 7; i++){
        for (let j = 0; j < 3; j++){
            if (gameRow[i][j] == player && gameRow[i-1][j+1] == player && gameRow[i-2][j+2] == player && gameRow[i-3][j+3] == player)
                return true;
        }
    }
    // Check for descending diagonal win
    for (let i = 3; i < 7; i++){
        for (let j = 3; j < 6; j++){
            if (gameRow[i][j] == player && gameRow[i-1][j-1] == player && gameRow[i-2][j-2] == player && gameRow[i-3][j-3] == player)
                return true;
        }
    }
    return false;
}

function displayBoard(grid, board){
	//const table = document.getElementById("board");
	table = board;

	table.style.border = "100 px";
	//table.style.borderCollapse = "collapse";
	table.style.borderSpacing = "0 px";
	table.style.margin = "0 auto";
	table.style.padding = "0 px";

	for(let rowNum = 5; rowNum >= 0; rowNum--){
		let row = table.insertRow();

		for(let colNum = 0; colNum < 7; colNum++){

			let boardSpace = row.insertCell(colNum);

			//todo append circles instead of changing inner text
			if(grid[colNum][rowNum]){
				if(grid[colNum][rowNum] === "R"){
					var redCircle = document.createElement("img");
					redCircle.src = "../../javascript/red.png";
					redCircle.style.display = "block";
					boardSpace.appendChild(redCircle);
				}
				else{
					var blueCircle = document.createElement("img");
					blueCircle.src = "../../javascript/blue.png";
					blueCircle.style.display = "block";
					boardSpace.appendChild(blueCircle);
				}
				//boardSpace.innerText = grid[colNum][rowNum];
			}
			else{
				//boardSpace.innerText = "+";
				var empty = document.createElement("img");
				empty.src = "../../javascript/empty.png";
				empty.style.display = "block";
				boardSpace.appendChild(empty);
			}
			boardSpace.style.backgroundColor = "#ced7e0";
			if(board == gameBoard){
				boardSpace.addEventListener("click", function(){
					clickColumn(colNum);
				});
			}
		}
	}
}

function clickColumn(colNum){
	if(isPlaying){
		if(gameRow[colNum].length >= 6){
			alert("Invalid move: not enough space!");
		}
		else{
			//todo check if it's currently the logged in user's turn, currently it does this in the server
			addMove(colNum);
		}
	}
}

//asynchronous put request to add move to game
function addMove(colNum){
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){
			//console.log(this.response);
  			location.reload();
		}
		else if(this.readyState == 4){
			alert(this.response);
		}
	};
	xhttp.open("PUT", "/games/" + game.gameID + "/moves/" + "?move=" + colNum, true);
	xhttp.send();
}

function declareWinner(winnerID){
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){
			//console.log(this.response);
			alert(this.response);
  			location.reload();
		}
		else if(this.readyState == 4){
			alert(this.response);
		}
	};
	xhttp.open("PUT", "/games/" + game.gameID + "/finished?winner=" + winnerID, true);
	xhttp.send();
}

function forfeit(){
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){
			//console.log(this.response);
			alert(this.response);
  			location.reload();
		}
		else if(this.readyState == 4){
			//alert(this.response);
		}
	};
	xhttp.open("PUT", "/games/" + game.gameID + "/forfeit", true);
	xhttp.send();	
}

function replay(moveNumber, board){
	if(game.complete === true){
		if(moveNumber <= game.recordedMoves.length && moveNumber >= 0){

			var replayGrid = [];
			while(board.rows.length){
				board.deleteRow(0);
			}

			for(let i = 0; i < 7; i++){
				var replayGridCol = [];
				replayGrid.push(replayGridCol);
			}

			gameBoard.style.display = "none";
			board.style.display = "block";
			board.style.margin = "0 auto";

			readRecordedMoves(moveNumber, replayGrid);
			displayBoard(replayGrid, board);

			board.style.display = "initial";
			board.style.margin = "0 auto";

			document.getElementById("viewingreplay").innerText = "	Viewing Replay";
		}
	}
}