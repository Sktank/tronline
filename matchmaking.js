var queue       = require('./queue.js'),
    websockets  = require('./server.js'),
    RBTree   = require('bintrees').RBTree;

var COUNT_DOWN_TIME = 2;
var gameState = {};

var X = 0,
    Y = 1,
    DIR = 2,
    DONE = 3;

var speed = 50;

var GROUP_SIZE = 2;

var width = 600,
    height = 400,
    pixPerBlock = 8,
    blocksX = width / pixPerBlock,
    blocksY = height / pixPerBlock;


function MatchingPool() {
    this.numRatingRooms = 0;
    this.numNormalRooms = 0;
    this.normalQueue = new queue.Queue();
    this.tree = new RBTree(function(a, b) {
        if(Object.is(a, b)) {
            return 0;
        }
        if (a && b) {
            var comp = a.score - b.score;
            if (comp == 0) {
                var timeDiff = b.time - a.time;
                if (timeDiff != 0) {
                    return timeDiff;
                }
                else {
                    return a.nonce - b.nonce;
                }
            }
            else {
                return comp;
            }
        }
        else {
            return 1;
        }
    });
}


exports.matchingPool = new MatchingPool();

exports.queueRatingUser = function(socket) {
    socket.tree.insert(socket);
    socket.queued = true;
    createTreeMatch(socket.tree, socket);
};

exports.queueNormalUser = function(socket) {
    socket.queued = true;
    socket.matchingPool.normalQueue.enqueue(socket);
    tryNormalMatch(socket.matchingPool);

}

exports.updateDirection = function(room, player, direction) {
    gameState[room]["state"][player][DIR] = direction;
}


var defaultState = {
    0 : {x: 15, y: 25, direction: 39, done: false},
    1 : {x: 60, y: 25, direction: 37, done: false}
}

defaultState = [[15,25,39,false],[60,25,37,false]];

var defaultGrid = new Array(blocksX);
for (var i = 0; i < blocksX; i++) {
    defaultGrid[i] = new Array(blocksY);
    for (var j = 0; j < blocksY; j++) {
        defaultGrid[i][j] = 0;
    }
}

function step(roomName, AIs) {
    var room = gameState[roomName];
    var state = room.state;
    var grid = room.grid;
    var count = 0,
    livingPlayer;
    for (var i = 0; i < GROUP_SIZE; i++) {
        var currentPlayerState = state[i];
        if (!currentPlayerState[DONE]) {
            var oldPlayerStateX = currentPlayerState[X],
                oldPlayerStateY = currentPlayerState[Y];

            // see which directions you can go in, dont go into a wall
            switch(currentPlayerState[DIR]) {
                case 37:
                    // left
                    currentPlayerState[X]--;
                    break;
                case 38:
                    // up
                    currentPlayerState[Y]--;
                    break
                case 39:
                    // right
                    currentPlayerState[X]++;
                    break;
                case 40:
                    // down
                    currentPlayerState[Y]++;
                    break;
            }

            if (currentPlayerState[X] >= 0 && currentPlayerState[X] < blocksX && currentPlayerState[Y] >= 0 && currentPlayerState[Y] < blocksY) {
                grid[currentPlayerState[X]][currentPlayerState[Y]] = grid[currentPlayerState[X]][currentPlayerState[Y]] + 1;
                count++;
                livingPlayer = i;
            }
            if (currentPlayerState[X] < 0 || currentPlayerState[X] >= blocksX || currentPlayerState[Y] < 0 || currentPlayerState[Y] >= blocksY || grid[currentPlayerState[X]][currentPlayerState[Y]] > 1) {
                currentPlayerState[X] = oldPlayerStateX;
                currentPlayerState[Y] = oldPlayerStateY;
                console.log("done");
                currentPlayerState[DONE] = true;
            }
        }
    }

    // send the info to client
    websockets.io.sockets.in(roomName).emit('step', state);

    if (count > 1) {
        setTimeout(function() {
            step(roomName, [0])
        }, speed);
    } else {
        websockets.io.sockets.in(roomName).emit('won', livingPlayer);
    }
}

function tryNormalMatch(pool) {
    var queue = pool.normalQueue
    var numQueueActiveInactive = queue.hasQueued(GROUP_SIZE)
    // check if 4 people are in the queue, if they are take them all off and start
    console.log("trying match");
    if (numQueueActiveInactive) {

        console.log(numQueueActiveInactive)
        var room = 'normal-' + pool.numNormalRooms,
            i,
            j;
        pool.numNormalRooms = pool.numNormalRooms + 1;

        // set up an empty grid
        var defaultGrid = new Array(blocksX);
        for (i = 0; i < blocksX; i++) {
            defaultGrid[i] = new Array(blocksY);
            for (j = 0; j < blocksY; j++) {
                defaultGrid[i][j] = 0;
            }
        }

        // add obsticles to grid
        for (i = 29; i < 47; i++) {
            for (j = 14; j < 35; j++) {
                defaultGrid[i][j] = 1;
            }
        }

        // add grid to global list
        gameState[room] = {};
        gameState[room]["state"] = JSON.parse(JSON.stringify(defaultState));
        gameState[room]["grid"] = defaultGrid;

        // send grid to players and start game
        var playerNum = 0;
        for (var i = 0; i < numQueueActiveInactive; i++) {
            var socket = queue.dequeue();
            if (socket.queued) {
                socket.join(room);
                socket.room = room;
                socket.player = playerNum;
                socket.queued = false;
                socket.matched = true;
                socket.emit('start', defaultGrid, playerNum, room, gameState[room]["state"]);
                playerNum++;
            }
        }
        startCountdown(room, COUNT_DOWN_TIME);
    }
}

function startCountdown(room, timeLeft) {
    if (timeLeft === 0) {
        step(room);
        websockets.io.sockets.in(room).emit('countDown', timeLeft);
    }
    else {
        websockets.io.sockets.in(room).emit('countDown', timeLeft);
        setTimeout(function() {
            startCountdown(room, timeLeft - 1);
        }, 1000);
    }
}


exports.leaveRoom = function(socket) {
    gameState[socket.room]["state"][socket.player][DONE] = true;
    delete socket.room;
    delete socket.player;
}

function createTreeMatch(tree, socket) {
    var tit=tree.iterator(), item;
    console.log("=========entire=========");
    while((item = tit.next()) !== null) {
        console.log(item.score + "," + item.time);
    }
//    console.log("========upperbound=========");
//    console.log("current score is: " + socket.score);
    var it = tree.lowerBound(socket);
    var next = it.next();
    console.log(next);
    var timeDiff;

    if (next) {
        // set timer for next
        updateTimer(socket, next);

    }

    // fix previous timer
    var lit = tree.lowerBound(socket);
    var prev = lit.prev();
    if (prev) {
        console.log("the previous thinggy is, " + prev.score + "," + prev.time);
        clearTimeout(prev.timer);
        updateTimer(prev, socket);
    }
}

function updateTimer(current, next) {
    console.log("current score is: " + current.score);
    console.log("next score is: " + next.score);
    console.log("score diff is: " + (next.score - current.score));
    console.log("time is: " + SPEED * (current.time - next.time));
    console.log("numerator is: " + ((next.score - current.score) - Math.abs(SPEED * (current.time - next.time))));
    console.log("denominator is: " + (2 * SPEED));
    var timeDiff = ((next.score - current.score) - Math.abs(SPEED * (current.time - next.time))) / (2 * SPEED);
    console.log(timeDiff);
    if (timeDiff < 0) timeDiff = 0;
    current.timer = setTimeout(function() {
        checkAndMatch(current, next);
    }, timeDiff);
}

function checkAndMatch(current, next) {

    // set up room
    var room = 'rating-' + current.matchingPool.numRatingRooms;
    current.matchingPool.numRatingRooms = current.matchingPool.numRatingRooms + 1;

    //check if already been matched
    if (!current.matched && !next.matched && current.queued && next.queued) {
        current.matched = true;
        next.matched = true;
    }
    else {
        console.log("shit happened, fuck");
        return null;
    }

    // put match in its own room
    current.join(room);
    next.join(room);
    current.room = room;
    next.room = room;


    //set up guids for rating

    //compose the topic infos

    websockets.io.sockets.in(room).emit('start', room);

    // update tree

    // update timers
    exports.updateTimersAfterRemove(current, next);

    //remove nodes from tree
    var tree = current.tree;
    tree.remove(current);
    tree.remove(next);
    current.queued = false;
    next.queued = false;
    delete current.tree;
    delete next.tree;

}

exports.updateTimersAfterRemove = function(first, second) {
    var first = first,
        second = second;

    if (!second) {
        second = first;
    }
    var it = first.tree.upperBound(first);
    var prev = it.prev();
    it = first.tree.lowerBound(second);
    var next = it.next();
    if (prev) {
        clearTimeout(prev.timer);
    }
    if (prev && next) {
        updateTimer(prev, next);
    }
};