let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);

let player_list = {};

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
		},
		speed: 6
	};
	player_list[player.playerId] = player;
	sock.emit('init', player);
	sock.on('disconnect', () => {
		delete player_list[player.playerId];
	});

	// sock.on('update_player', (data) => {
		// extend_object(player, data, ["pos"]);
	// });
	
	sock.on('key_press', (data) => {
		console.log("hm");
		console.log(data);
		for (let i = 0; i < data.length; i++) {
			switch (data[i]) {
				case "right":
					player.pos.x += player.speed;
					break;
				case "left":
					player.pos.x -= player.speed;
					break;
				case "up":
					player.pos.y -= player.speed;
					break;
				case "down":
					player.pos.y += player.speed;
					break;
				// default:
					// TODO: handle invalid keys
					// break;
			}
		}
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

