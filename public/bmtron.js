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
    	j;

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


	socket.on('start', function(grid, player, room, state) {
		console.log("player: " + player);
		console.log("room: " + room);
		myPlayer = player;
		myRoom = room;
		loadGrid(grid);
		$('.gameState').html('<h4>Game Found</h4>');
		$('.playerColor').html('Player Color:');
		$('.colorHolder').css('background-color', colorMap[player]);
		$('#beginGame').css('display', 'inline');
		updateGrid(state);


	    $(document).keydown(function(event) {
	    	direction = event.keyCode;
	    	if (direction === 37 || direction === 38 || direction === 39 || direction === 40) {
		    	socket.emit('updateDirection', myRoom, myPlayer, direction);	
	    	}
	    });

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

    	socket.on('step', function(state) {
			updateGrid(state);
		});

	});

	socket.on('playerLeft', function(player) {
		console.log("player " + player + " left");

		// stop the game

		// display that the other player left

		// give option to join a new game
	});

	socket.on('won', function(player) {
		console.log("player " + player + " won");

		// Put it on the screen that the player won
		$('.player-won-container').css('display', 'inline');

		colorMap[player]
		$('.player-won-container').css('background-color', colorMap[player]);
		$('.win-text').css('color', colorMap[player]);
		$('.win-text').html('Player ' + (player + 1) + ' Wins');
		setTimeout(function() {
			$('.player-won-container').css('opacity', '0.8');
		}, 0);

		// wait 5 seconds

		setTimeout(function() {
			socket.emit('newGame', myPlayer, myRoom);
		}, 5000);
		

		// $('.player-won-container').show('200');




		// add to that players score

		// if that player won, 

		// after a certain amount of time, clear it from screen

		// refresh grid

		// start new countdown

	});

	socket.on('countDown', function(time) {
		if (time === 0) {
			$('.countDown').html('Go!');
		} else {
			$('.countDown').html('Starting in ' + time);
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
					$('.gameState').html('<h4>Looking For Game...</h4>')
					var winAlertTop = 15;
				    util.setTopMiddle('svg', '.player-won-container', winAlertTop);
				    $( window ).resize(function() {
				  		util.setTopMiddle('svg', '.player-won-container', winAlertTop);
					});
					socket.emit('enterNormalGameQueue');
				}, 50);
			}, 400)
	}, 400);
		
	});

	// $('.gameState').html('<h4>Looking For Game...</h4>')
	// socket.emit('enterNormalGameQueue');
	// beginGame();

});