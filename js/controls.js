// Event listeners: Mouse
game.mouse =
{
    item:
    {
        drag: false,
        hold: null
    },
    x: 0,
    y: 0,
    x_last: 0,
    y_last: 0,
    isDown: [],
    isUp: [],
    left: 0,
    middle: 1,
    right: 2,
    wheel: 0
};

window.addEventListener("mousemove",  function(e)
{
    game.mouse.x = e.clientX;
    game.mouse.y = e.clientY;
}, false);

window.addEventListener("mousedown",  function(e)
{
    game.mouse.isDown[e.button] = true;
    game.mouse.isUp[e.button] = false;
}, false);

window.addEventListener("mouseup",    function(e)
{
    game.mouse.isDown[e.button] = false;
    game.mouse.isUp[e.button] = true;
}, false);

window.addEventListener('mousewheel', function(e)
{
    if (document.activeElement === game.canvas)
    {
        // Save mouse wheel data
        game.mouse.wheel = e.wheelDelta;

        // Zoom
        if (game.mouse.wheel < 0)
        {
            game.zoom -= 0.1;

            if (game.zoom < 0.5)
            {
                game.zoom = 0.5;
            }
        }
        else
        {
            game.zoom += 0.1;

            if (game.zoom > 2)
            {
                game.zoom = 2;
            }
        }
    }
}, false); // Chrome
window.addEventListener('DOMMouseScroll', function(e)
{
    if (document.activeElement === game.canvas)
    {
        // Save mouse wheel data
        game.mouse.wheel = e.detail;

        // Zoom
        if (game.mouse.wheel < 0)
        {
            game.zoom -= 0.1;

            if (game.zoom < 0.5)
            {
                game.zoom = 0.5;
            }
        }
        else
        {
            game.zoom += 0.1;

            if (game.zoom > 2)
            {
                game.zoom = 2;
            }
        }
    }
}, false); // Firefox



// Event listeners: Keyboard
window.addEventListener('keydown', function(e)
{
    game.keyboard.isDown[e.keyCode] = true;
    game.keyboard.isUp[e.keyCode] = false;
}, true);
window.addEventListener('keyup',   function(e)
{
    game.keyboard.isDown[e.keyCode] = false;
    game.keyboard.isUp[e.keyCode] = true;
}, true);

// Keyboard charcodes
game.keyboard =
{
    isDown: [],
    isUp: [],
    bspace: 8,
    tab   : 9,
    enter : 13,
    shift : 16,
    ctrl  : 17,
    alt   : 18,
    pause : 19,
    caps  : 20,
    escape: 27,
    space : 32,

    pgup  : 33,
    pgdn  : 34,
    end   : 35,
    home  : 36,

    up    : 38,
    down  : 40,
    left  : 37,
    right : 39,

    zero  : 48,
    one   : 49,
    two   : 50,
    three : 51,
    four  : 52,
    five  : 53,
    six   : 54,
    seven : 55,
    eight : 56,
    nine  : 57,

    a     : 65,
    b     : 66,
    c     : 67,
    d     : 68,
    e     : 69,
    f     : 70,
    g     : 71,
    h     : 72,
    i     : 73,
    j     : 74,
    k     : 75,
    l     : 76,
    m     : 77,
    n     : 78,
    o     : 79,
    p     : 80,
    q     : 81,
    r     : 82,
    s     : 83,
    t     : 84,
    u     : 85,
    v     : 86,
    w     : 87,
    x     : 88,
    y     : 89,
    z     : 90,

    f1    : 112,
    f2    : 113,
    f3    : 114,
    f4    : 115,
    f5    : 116,
    f6    : 117,
    f7    : 118,
    f8    : 119,
    f9    : 120,
    f10   : 121,
    f11   : 122,
    f12   : 123,

    comma : 188,
    dash  : 189,
    period: 190
};

function controls()
{
    // Reset mouse buttons
    for (var i in game.mouse.isUp) { if (game.mouse.isUp[i]) game.mouse.isUp[i] = false; }

    // Controls only work if canvas is actived
    if (document.activeElement === game.canvas)
    {

    // Test: Trade window at the base
    if (game.player.ship.on_station)
    {
        if (game.keyboard.isDown[game.keyboard.c])
        {
            game.keyboard.isDown[game.keyboard.c] = false;
            //shipEquipment(); // test
            if (game.settings.sound === true) audio_play_sound(game.sounds["snd_gui_close"]);
            if (! trading) trading = true;
            else trading = false;
        }
    } else { trading = false; }

    // Game controls
    if (! game.keyboard.isDown[game.keyboard.shift]) // Only if Shift is not pressed
    {
        // Moving
        if (game.keyboard.isDown[game.keyboard.w] || game.keyboard.isDown[game.keyboard.up] || game.mouse.isDown[game.mouse.right] === true)
        {
            if (game.player.ship.moving !== 1)
            {
                if (! singleplayer) game.network.socket.emit(2);
                game.player.ship.moving = 1;
            }
        }
        else if (game.keyboard.isDown[game.keyboard.s] || game.keyboard.isDown[game.keyboard.down])
        {
            if (game.player.ship.moving !== -1)
            {
                if (! singleplayer) game.network.socket.emit(3);
                game.player.ship.moving = -1;
            }
        }
        if (! game.keyboard.isDown[game.keyboard.w] && ! game.keyboard.isDown[game.keyboard.up] && ! game.keyboard.isDown[game.keyboard.s] && ! game.keyboard.isDown[game.keyboard.down])
        {
            if (game.player.ship.moving !== 0)
            {
                if (! singleplayer) game.network.socket.emit(4);
                game.player.ship.moving = 0;
            }
        }

        // Rotating
        if (game.keyboard.isDown[game.keyboard.a] || game.keyboard.isDown[game.keyboard.left])
        {
            if (game.player.ship.rotating !== -1)
            {
                if (! singleplayer) game.network.socket.emit(5);
                game.player.ship.rotating = -1;
            }
        }
        else if (game.keyboard.isDown[game.keyboard.d] || game.keyboard.isDown[game.keyboard.right])
        {
            if (game.player.ship.rotating !== 1)
            {
                if (! singleplayer) game.network.socket.emit(6);
                game.player.ship.rotating = 1;
            }
        }
        if (! game.keyboard.isDown[game.keyboard.a] && ! game.keyboard.isDown[game.keyboard.left] && ! game.keyboard.isDown[game.keyboard.d] && ! game.keyboard.isDown[game.keyboard.right])
        {
            if (game.player.ship.rotating !== 0)
            {
                if (! singleplayer) game.network.socket.emit(7);
                game.player.ship.rotating = 0;
            }
        }
    }

    // Test: Sector map
    if (game.keyboard.isDown[game.keyboard.period])
    {
        game.keyboard.isDown[game.keyboard.period] = false;
        sectorMap();
    }

    // Shooting bullets: Mouse
    if (! game.player.ship.on_station && ! game.mouse.over_gui)
    {
        if (game.mouse.isDown[game.mouse.left] === true || game.keyboard.isDown[game.keyboard.space])
        {
            // Send shoot signal
            if (! game.player.ship.shooting)
            {
                if (! singleplayer) game.network.socket.emit(0);
                game.player.ship.shooting = 1;
            }

            // Send mouse coordinates
            let mx = rounded(game.mouse.x + game.camera.x);
            let my = rounded(game.mouse.y + game.camera.y);

            if (mx !== game.mouse.x_last && my !== game.mouse.y_last)
            {
                game.mouse.x_last = mx;
                game.mouse.y_last = my;

                if (! singleplayer)
                {
                    game.network.socket.emit(8, mx, my);
                }
            }

            if (mx !== game.mouse.x_last)
            {
                game.mouse.x_last = mx;

                if (! singleplayer)
                {
                    game.network.socket.emit(9, mx);
                }
            }

            if (my !== game.mouse.y_last)
            {
                game.mouse.y_last = my;

                if (! singleplayer)
                {
                    game.network.socket.emit(10, my);
                }
            }
        }
        else
        {
            // Send shoot signal
            if (game.player.ship.shooting)
            {
                if (! singleplayer) game.network.socket.emit(1);
                game.player.ship.shooting = 0;
            }
        }

        // Shooting rockets
        if (game.mouse.isDown[game.mouse.right] && ! game.mouse.over_gui)
        {
            //game.mouse.isDown[game.mouse.right] = false;

            if (game.cargoCount("needle") > 0)
            {
                game.cargoRemove(game.player.ship, "needle", 1, true)
                new game.Rocket(game.player.ship, game.mouse.x + game.camera.x, game.mouse.y + game.camera.y, "needle");

                // Add shot to statistics
                game.player.rockets_fired += 1;
            }
        }
    }

    // Gate jump
    if (game.keyboard.isDown[game.keyboard.j])
    {
        game.keyboard.isDown[game.keyboard.j] = false;

        let g = game.getNearest(game.player.ship, game.entities.gates);

        if (singleplayer)
        {
            game.setSector(g.destination.sector, { x: g.destination.x, y: g.destination.y });
        }

        // Send sector travel
        else game.network.socket.emit(16);
    }

    // Reset zoom
    if (game.mouse.isDown[game.mouse.middle] === true)
    {
        game.mouse.isDown[game.mouse.middle] = false;
        game.zoom = 1;
    }

    // New GUI system

    // Test: Box inventory
    if (game.keyboard.isDown[game.keyboard.f])
    {
        game.keyboard.isDown[game.keyboard.f] = false;

        if (! inventory) inventory = true;
        else inventory = false;
    }

    // Debug mode
    else if (game.keyboard.isDown[game.keyboard.p])
    {
        game.keyboard.isDown[game.keyboard.p] = false;
        if (game.debug === true) game.debug = false;
        else game.debug = true;
    }

    // Main menu
    if (game.keyboard.isDown[game.keyboard.escape])
    {
        game.keyboard.isDown[game.keyboard.escape] = false;
        if (main_menu === false)
        {
            if (game.settings.sound === true) audio_play_sound(game.sounds["snd_gui_open"]);
            main_menu = true;
        }
        else
        {
            if (game.settings.sound === true) audio_play_sound(game.sounds["snd_gui_close"]);
            main_menu = false;
        }
    }
    }

    // If chat box is active
    if (game.keyboard.isDown[game.keyboard.enter])
    {
        game.keyboard.isDown[game.keyboard.enter] = false;
		/*
        if (document.activeElement === chat_input)
        {
            document.getElementById('chat_window').style.bottom = "0px";
            document.getElementById('chat_div').style.visibility = "hidden";
            document.getElementById('channel_select').style.visibility = "hidden";
            document.getElementById('chat_emoticons').style.visibility = "hidden";
            document.getElementById('chat_emoticons_activator').style.visibility = "hidden";
            document.getElementById('chat_input').style.visibility = "hidden";

            document.getElementById('weaponInfo').style.bottom = "112px";

            send_chat(channel_select.value, chat_input.value);
            chat_input.value = "";

            game.canvas.focus();
        }
        else
        {
            document.getElementById('chat_window').style.bottom = "22px";
            document.getElementById('chat_div').style.visibility = "visible";
            document.getElementById('channel_select').style.visibility = "visible";
            document.getElementById('chat_emoticons_activator').style.visibility = "visible";
            document.getElementById('chat_input').style.visibility = "visible";

            document.getElementById('weaponInfo').style.bottom = "134px";

            chat_input.focus();
        }
		*/
    }

    // If chat is active, make it possible to leave it with ESC
    if (document.activeElement === chat_input)
    {
        if (game.keyboard.isDown[game.keyboard.escape])
        {
            game.keyboard.isDown[game.keyboard.escape] = false;
            chat_input.value = "";
            document.getElementById('chat_window').style.bottom = "0px";
            document.getElementById('chat_div').style.visibility = "hidden";
            document.getElementById('channel_select').style.visibility = "hidden";
            document.getElementById('chat_emoticons').style.visibility = "hidden";
            document.getElementById('chat_emoticons_activator').style.visibility = "hidden";
            document.getElementById('chat_input').style.visibility = "hidden";

            document.getElementById('weapons').style.bottom = "102px";

            game.canvas.focus();
        }
    }

    // Test: Console log infos
    if (game.keyboard.isDown[game.keyboard.shift])
    {
        if (game.keyboard.isDown[game.keyboard.one])
        {
            game.keyboard.isDown[game.keyboard.shift] = false;
            game.keyboard.isDown[game.keyboard.one] = false;

            for (var i in game.db.items)
            {
                var item = game.db.items[i];
                var shots = 1000 / item.rate;
                var edmg = rounded(shots * item.edmg);
                var kdmg = rounded(shots * item.kdmg);

                if (item.type === "gun")
                {
                    console.log("> " + string("item_" + item.token));
                    console.log("Schildschaden (pro Schuss: " + item.edmg + ", pro Sekunde: " + edmg + ")");
                    console.log("Hüllenschaden (pro Schuss: " + item.kdmg + ", pro Sekunde: " + kdmg + ")");
                    console.log("Schüsse pro Sekunde: " + shots);
                    console.log("Schussgeschwindigkeit: " + item.mspeed + " m/s");
                    console.log("__________________________________________________");
                }
            }
        }
    }
}
