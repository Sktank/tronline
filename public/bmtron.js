var socket = io.connect();
$(function() {
    var width = 600,
        height = 400,
        pixPerBlock = 8,
    	blocksX = width / pixPerBlock,
    	blocksY = height / pixPerBlock,
    	myPlayer,
    	myRoom,
    	i,
    	j,
    	menuUp = false,
    	winAlertTop = 15,
    	score={'0':0, '1':0},
    	playerLeft = false;

    var X = 0,
	    Y = 1,
	    DIR = 2,
	    DONE = 3;

    var colorMap = {
	    0 : "red",
	    1 : "green"
	}

    var svg = d3.select(".gridContainer").insert("svg", "div")
            .attr("width", width)
            .attr("height", height);

    var container = svg.append("rect")
            .attr("width", width)
            .attr("height", height)

    // util.setMiddle("svg");


    function loadGrid(grid) {
    	var width = grid.length,
    		length = grid[0].length
    	for (i = 0; i < width; i++) {
	        for (j = 0; j < length; j++) {
	        	if (grid[i][j] == 1) {
	        		svg.insert("rect")
		                .attr("x", i * pixPerBlock)
		                .attr("y", j * pixPerBlock)
		                .attr("width", pixPerBlock)
		                .attr("height", pixPerBlock)
		                .style("fill", "white")
	        	}
	        }
	    }
    }

    function moveGameInfoUp() {
    	menuUp = true;
    	// hide game info
    	if (!playerLeft) {
	    	$('.gameInfoContainer').css('display', 'none');
    	} else {
    		$('.win-text').html('Opponent Left');
    	}
    	$('.player-won-container').css('width', '250px');
    	// set it back to top
    	util.setTopMiddle('svg', '.gameInfoContainer', winAlertTop);


    }

    function setGameInfoStyle(style) {
    	if (style == 'meta') {
    		menuUp = false
    		$('.player-won-container').css('background-color', 'rgb(112, 195, 210)');
    		$('.player-won-container').css('opacity', '0.8');
    		$('.win-text').css('color', 'white');
    		util.setMiddle('svg', '.gameInfoContainer');
    	}
    }

    function updateGrid(state) {
	    	for (var player in state) {
			  if (state.hasOwnProperty(player)) {
			    if (!state[player][DONE]) {
			    	svg.insert("rect")
		                .attr("x", state[player][X] * pixPerBlock)
		                .attr("y", state[player][Y] * pixPerBlock)
		                .attr("width", pixPerBlock)
		                .attr("height", pixPerBlock)
		                .style("fill", colorMap[player])
			    } else {
			    	svg.insert("rect")
		                .attr("x", state[player][X] * pixPerBlock)
		                .attr("y", state[player][Y] * pixPerBlock)
		                .attr("width", pixPerBlock)
		                .attr("height", pixPerBlock)
		                .style("fill", "orange")
			    }
			  }
			}
	    }


	socket.on('start', function(grid, player, room, state) {
		console.log("player: " + player);
		console.log("room: " + room);
		myPlayer = player;
		myRoom = room;
		loadGrid(grid);
		$('.gameSidebar').css('display', 'inline');
		$('.playerColor').html('Your Color:');
		$('.colorHolder').css('background-color', colorMap[player]);
		$('#beginGame').css('display', 'inline');
		$('.findNewGameBtn').css('display', 'none');
		$('#score0').html('0');
		$('#score1').html('0');
		updateGrid(state);


	    $(document).keydown(function(event) {
	    	direction = event.keyCode;
	    	if (direction === 37 || direction === 38 || direction === 39 || direction === 40) {
		    	socket.emit('updateDirection', myRoom, myPlayer, direction);	
	    	}
	    });

    	socket.on('step', function(state) {
    		if (!playerLeft) {
    			updateGrid(state);
    		}
		});

	});

	socket.on('playerLeft', function(player) {
		console.log("player " + player + " left");

		// stop the game
		playerLeft = true;

		// display that the other player left

		// give option to join a new game
	});

	socket.on('won', function(player) {
		console.log("player " + player + " won");

		if (playerLeft) {
			$('.win-text').html('Opponent Left');
			// display button to join new game
			$('.findNewGameBtn').css('display', 'block');
			$('.gameInfoContainer').css('display', 'inline');
			return;
		}

		$('.gameInfoContainer').css('display', 'inline');
		// Put it on the screen that the player won



		if (player != null && !playerLeft) {
			score[player]++;
			console.log(score)
			console.log('#score' + player)
			console.log(score[player] + '')
			$('#score' + player).html(score[player] + '');
			$('.player-won-container').css('background-color', colorMap[player]);
			// $('.win-text').css('color', colorMap[player]);
			$('.win-text').html('');
			if (score[player] < 5) {
				setTimeout(function() {
					socket.emit('newGame', myRoom);
				}, 3000);
			} else {
				if (player == myPlayer) {
					$('.win-text').html('You Win');
				} else {
					$('.win-text').html('Player ' + (player + 1) + ' Wins');
				}
				$('.findNewGameBtn').css('display', 'block');
			}
		} else {
			$('.win-text').html('Tie');
			setTimeout(function() {
				socket.emit('newGame', myRoom);
			}, 3000);
		}

		setTimeout(function() {
			$('.player-won-container').css('opacity', '0.8');
		}, 0);




		// wait 5 seconds
		

	});

	socket.on('startNewGame', function(grid, state) {
		// black out the current board
		svg.selectAll("rect").remove();
		loadGrid(grid);
		updateGrid(state);
	});

	socket.on('countDown', function(time) {
		setGameInfoStyle('meta')
		if (time === 0) {
			moveGameInfoUp()
		} else if (time > 5) {
			$('.player-won-container').css('width', '200px');
			$('.win-text').html('Prepare for Battle');
		} else {
			$('.player-won-container').css('width', '50px');
			$('.win-text').html(time);
		} 
	});



	$('.tron-title').animate({
		'opacity': 1,
    	'padding-top': "+=15"
	}, 500);
	setTimeout(function() {
		$('.tron-btn').addClass('shown');
	}, 500);

	$('.tron-btn').click(function() {
		$('.tron-btn').addClass('tron-btn-clicked')
		setTimeout(function() {

			$('.tron-title').addClass('tron-btn-clicked-title');
			setTimeout(function() {
				$('.tron-title-container').hide();
				$('.game').css('display', 'block');
				setTimeout(function() {
					$('.game').addClass('viewGame');
				    util.setMiddle('svg', '.gameInfoContainer');
					$('.win-text').html('Searching')
				    $( window ).resize(function() {
				    	if (menuUp) {
					  		util.setTopMiddle('svg', '.gameInfoContainer', winAlertTop);
				    	} else {
				    		util.setMiddle('svg', '.gameInfoContainer');
				    	}
					});
					socket.emit('enterNormalGameQueue');
				}, 50);
			}, 400)
	}, 400);
		
	});

	$('.findNewGameBtn').click(function() {
		// reset game parameters
		myPlayer = '';
    	myRoom = '';
    	menuUp = false;
    	score = {'0':0, '1':0};
    	playerLeft = false;

    	// reset layout
    	$('.gameSidebar').css('display', 'none');

    	svg.selectAll("rect").remove();
    	setGameInfoStyle('meta')
		$('.win-text').html('Searching');


		socket.emit('enterNormalGameQueue');
	})

	// $('.gameState').html('<h4>Looking For Game...</h4>')
	// socket.emit('enterNormalGameQueue');
	// beginGame();

});