/********** BEGIN: Network **********/
function startConnection()
{
	// game.network.socket.IO Connection
	game.network.socket = io('ws://' + game.network.host + ":" + game.network.port, { 'reconnect': false });
	console.log("Trying to connect to ws://" + game.network.host + ":" + game.network.port + "...");

// Network stuff
game.network.socket.on('connect', function()
{
    console.log("Connection established!");

    // Receive start sector
    game.network.socket.on('change_sector', function(sector, coords)
    {
        game.setSector(sector, coords);
    });

    // Receive connection number and start up time of server
    game.network.socket.on('serverData', function(data)
    {
        game.network.time = data.time;
        game.network.players = data.connected;
        chat_message(string("server_welcome1") + data.id + string("server_welcome2") + data.startTime, game.color.white);
        game.player.id = data.id;

        game.network.socket.emit('serverDataReceived');
    });

    // Receive number of connected players
    game.network.socket.on('playersOnline', function(number) { game.network.players = number; });

    // Test: Network synchronization
    game.network.socket.on('upd', function(snapshot)
    {
        console.log(JSON.stringify(snapshot));
        let i = snapshot.length;

        while (i--)
        {
            let s = snapshot[i];
            let p = game.entities.ships[id_get_index(s.id, game.entities.ships)];

            if (p !== undefined)
            {
                if (s.n  !== undefined) // Name
                {
                    p.name = s.n;

                    // Re-new name sign
                    game.createNameSign(p);
                }
                if (s.al !== undefined) // Alliance
                {
                    p.alliance = s.al;

                    game.createNameSign(p);
                }
                if (s.x  !== undefined) p.x = s.x; // X
                if (s.y  !== undefined) p.y = s.y; // Y
                if (s.m  !== undefined) p.moving = s.m; // Moving
                if (s.vx !== undefined) p.velocity.x = s.vx; // Velocity X
                if (s.vy !== undefined) p.velocity.y = s.vy; // Velocity Y
                if (s.r  !== undefined) p.rotating = s.r; // Rotating
                if (s.rs !== undefined) p.rspeed = s.rs; // Rotation speed
                if (s.a  !== undefined) p.angle = s.a; // Angle
                if (s.s  !== undefined) p.shooting = s.s; // Shooting
                if (s.mx !== undefined) p.mouseX = s.mx; // Mouse X
                if (s.my !== undefined) p.mouseY = s.my; // Mouse Y
                if (s.t  !== undefined) // Turrets
                {
                    console.log(s.t);
                    for (var j in s.t)
                    {
                        set_weapon(p, j, s.t[j]);
                    }
                }
            }
        }
    });

    // Chat message
    game.network.socket.on('chat', function(id, from, msg, color, time)
    {
        //audio_play_sound(game.sounds["snd_chat"], 1);

        var final_msg = msg;
        var final_color = color;

        // Apply emoticons
        for (var i in game.emoticons) { msg = msg.replace(new RegExp(i, "g"), game.emoticons[i]); }

        // Apply /me
        if (from)
        {
            final_msg = '<b title=' + time + '>' + from + ': </b> ' + msg;
            if (msg.charAt(0) === "/" && msg.charAt(1) === "m" && msg.charAt(2) === "e" && msg.charAt(3) === " ") final_msg = '<i>' + from + msg.substr(3) + '</i>';
        }
        else final_color = game.color.white;

        // Insert into chatlog
        chat_message(final_msg, final_color);
    });

    // Drops an item, sent by another player
    game.network.socket.on('dropItem', function(id, item, amount)
    {
        var player = game.entities.players[id_get_index(id, game.entities.players)];
        new game.Item(player.x, player.y, item, parseInt(amount), true, player);
    });

    // Create player
    game.network.socket.on('playerCreate', function(data)
    {
        console.log("game.network.socket.on: playerCreate", data);
        var new_ship = new game.Ship(data);

        if (data.turrets !== undefined)
        {
            for (var i = 0; i < data.turrets.length; i++)
            {
                set_weapon(new_ship, i, data.turrets[i]);
            }
        }

        // If received id is your own
        if (data.id === game.player.id)
        {
            // Status of connection
            game.network.connected = true;

            // Save username gotten from server into localStorage
            if (localStorage.username === undefined) localStorage.username = name;

            // Assign "game.player.ship" to yourself
            game.player.ship = new_ship;
            game.camera.target = new_ship;
            game.current.ship = new_ship;

            // Execute start... ... stuff!
            execute_start_stuff();
            game.current.sector = game.db.sectors["0-0"];
            game.setSector("0-0");

            game.network.socket.emit('playerShipReceived');

            // Send username and aliance name
            if (localStorage.username) game.network.socket.emit(12, localStorage.username);
            if (localStorage.alliance) game.network.socket.emit(13, localStorage.alliance);
        }
    });

    // When a player leaves the game, destroy its object
    game.network.socket.on('playerDestroy', function(id)
    {
        game.entities.players.splice(id_get_index(id, game.entities.players), 1);
        game.entities.ships.splice(id_get_index(id, game.entities.ships), 1);
    });

    // Server: Ping measurement
    game.network.socket.on(15, function(ping)
    {
        game.network.ping = ping;
        game.network.socket.emit(15);
    });

    game.network.socket.on('connect_failed', function(data)
    {
        console.log('connect_failed');
    });
    game.network.socket.on('connecting', function(data)
    {
        console.log('connecting');
    });
    game.network.socket.on('disconnect', function(data)
    {
        game.state = "title";
        game.network.connected = false;
        // Make GUI invisible
        document.getElementById("gui").style.visibility = "hidden";
        connection_error = true;
        console.log('disconnect');
    });
    game.network.socket.on('error', function(reason)
    {
        console.log('error');
    });
    game.network.socket.on('reconnect_failed', function(data)
    {
        console.log('reconnect_failed');
    });
    game.network.socket.on('reconnect', function(data)
    {
        console.log('reconnect');
    });
    game.network.socket.on('reconnecting', function(data)
    {
        console.log('reconnecting');
    });

    });
}
/********** END: Network **********/
