let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);

let player_list = {};
/*
let players = {
	uid1: {
		name: "Freddy",
		pos: {
			x: 0,
			y: 0
		},
		size: {
			width: 200,
			height: 200
		}
	},
	uid2: {
		name: "Billy Bob",
		pos: {
			x: 16,
			y: 25
		},
		size: {
			width: 200,
			height: 200
		}
	}
};
*/

app.use("/public", express.static(__dirname + "/public"));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');

});

io.on('connection', (sock) => {
	let player = {
		playerId: sock.id,
		pos: {
			x: 0,
			y: 0
		}
	};
	player_list[player.playerId] = player;
	sock.emit('init', player);
	sock.on('disconnect', () => {
		delete player_list[player.playerId];
	});

	sock.on('update_player', (data) => {
		extend_object(player, data, ["pos"]);
	});

	setInterval(() => {
		sock.emit('update_players', player_list);
	}, 20);
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

function extend_object(obj, src, whitelist) {
    for (let key in src) {
        if (src.hasOwnProperty(key) && whitelist.includes(key)) {
			if (key == "pos") {
				if (Math.abs(src[key].x - obj[key].x) > 6 ||
				    Math.abs(src[key].y - obj[key].y) > 6) {
					continue;
				}
			}
			obj[key] = src[key];
		}
    }
}

