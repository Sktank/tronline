/**
 * Created with PyCharm.
 * User: spencertank
 * Date: 4/6/14
 * Time: 4:58 PM
 * To change this template use File | Settings | File Templates.
 */


module.exports = function(server, io) {

// =========================================================
//                        Sockets
// =========================================================

    io.sockets.on('connection', function (socket) {

        // add user to language queue

        var matchmaking  = require('./matchmaking.js'),
            maxValue = 9007199254740992;

        socket.on('enterNormalGameQueue', function() {
            // take yourself out of any previous rooms
            if (socket.room) {
                socket.leave(socket.room);
                delete socket.room;
                delete socket.player;
            }

            socket.matched = false;
            socket.queued = false;
            socket.matchingPool = matchmaking.matchingPool;
            matchmaking.queueNormalUser(socket);
        });

        socket.on('enterRatingGameQueue', function(score) {
            socket.score = score;
            socket.time = new Date().getTime();
            socket.matched = false;
            socket.queued = false;
            socket.connected = true;
            socket.nonce = Math.floor(Math.random()*maxValue) + 1;
            socket.matchingPool = matchmaking.matchingPool;
            socket.tree = matchmaking.matchingPool.tree;

            //create the current profile or make a new one
            // var anonProfile = anonUser.processUser(guid);
            //TODO: use profile to inform decision


            matchmaking.queueUser(socket);
        });

        socket.on('newGame', function(room) {
            matchmaking.newGame(room);
        })

        socket.on('updateDirection', function(room, player, direction) {
            matchmaking.updateDirection(room, player, direction);
        });


        socket.on('message', function (message) {
            var room = message.room;
            var data = message.data;
            socket.broadcast.to(room).emit('message', data);

        });


        socket.on('disconnect', function() {
            console.log("disconnecting");
            if (typeof socket.room != 'undefined' && typeof socket.player != 'undefined') {
                console.log("player has a room and player number");
                // tell other players that you left
                socket.broadcast.to(socket.room).emit('playerLeft', socket.player);
                socket.leave(socket.room);

                // update server info for room
                matchmaking.leaveRoom(socket);
            }

            socket.connected = false;
            socket.queued = false;
            socket.matched = false;
        })
    });
};


