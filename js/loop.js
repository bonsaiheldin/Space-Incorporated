/********** BEGIN: Logic **********/
game.update = function(delta)
{
    game.time.delta = delta / 1000;

    // Reset resolution when window size changes
    if (game.camera.w !== window.innerWidth) { game.canvas.width = game.camera.w = window.innerWidth; }
    if (game.camera.h !== window.innerHeight) { game.canvas.height = game.camera.h = window.innerHeight; }

    // Keep track of mouse position
    game.player.ship.mouseX = game.mouse.x + game.camera.x;
    game.player.ship.mouseY = game.mouse.y + game.camera.y;

    if (game.network.connected)
    {
        // Draw gates
        var i = game.entities.gates.length;
        while (i--)
        {
            let e = game.entities.gates[i];
            e.update();
        }

        // Draw stations
        i = game.entities.stations.length;
        while (i--)
        {
            let e = game.entities.stations[i];
            e.update();
        }

        // Draw asteroids
        i = game.entities.asteroids.length;
        while (i--)
        {
            let e = game.entities.asteroids[i];
            e.update();
        }

        // Draw items
        i = game.entities.items.length;
        while (i--)
        {
            let e = game.entities.items[i];
            e.update();
        }

        // Draw ships
        i = game.entities.ships.length;
        while (i--)
        {
            let e = game.entities.ships[i];
            e.update();
        }

        // Draw particles
        i = game.entities.particles.length;
        while (i--)
        {
            let e = game.entities.particles[i];
            e.update();
        }

        // Draw bullets
        i = game.entities.bullets.length;
        while (i--)
        {
            let e = game.entities.bullets[i];
            e.update();
        }

        // Set camera view to camera target
        game.camera.x = game.camera.target.x - (game.camera.w / 2);
        game.camera.y = game.camera.target.y - (game.camera.h / 2);
        game.camera.w = window.innerWidth / game.zoom;
        game.camera.h = window.innerHeight / game.zoom;

        let cx = game.camera.x;
        let cy = game.camera.y;
        let cw = game.camera.w;
        let ch = game.camera.h;

        // Correct camera view when reaching sector ends
	    let sh = game.current.sector.size / 2;

        if (cx >= sh - cw) game.camera.x = sh - cw;
        if (cy >= sh - ch) game.camera.y = sh - ch;
        if (cx <= -sh) game.camera.x = -sh;
        if (cy <= -sh) game.camera.y = -sh;

        // Reset mouse stuff
        game.mouse.over_gui = false;

        // Game controls: Check for mouse and keyboard input
        controls();
    }

    //setTimeout(game.update, 16.666666667);
};

/********** END: Logic **********/

/********** BEGIN: Drawing **********/
game.render = function(timestamp)
{
    // Time based animation
    //game.time.delta = (timestamp - game.time.before) / 1000;

    // Clear the game canvas
    cc.clearRect(0, 0, game.camera.w, game.camera.h);

    if (game.state === "logo")
    {
        bonsaiheldin[0].render();
    }

    else if (game.state === "title")
    {
        // Show game logo
        game.drawSprite(game.sprites["spr_logo"], game.camera.w / 2, 240);

        game.drawButton("", game.camera.x + (game.camera.w / 2) - 30, game.camera.y + 360, null, 0);

        if (allResourcesLoaded)
        {
            game.drawButton(string("game_start_sp"), game.camera.x + (game.camera.w / 2) - 40, game.camera.y + 360, function()
            {
                start_singleplayer();
            });

            /*
            game.drawButton(string("game_start_mp"), game.camera.x + (game.camera.w / 2) - 38, game.camera.y + 390, function()
            {
                if (audio_is_playing(game.sounds["bgm_title"])) { audio_stop(game.sounds["bgm_title"]) };
                game.state = "game";
                startConnection();
            });

            if (game.keyboard.isDown[game.keyboard.enter])
            {
                game.keyboard.isDown[game.keyboard.enter] = false;
                if (audio_is_playing(game.sounds["bgm_02"])) { audio_stop(game.sounds["bgm_02"]) };
                audio_play_sound(game.sounds["snd_gui_open"], 1);
                game.state = "game";
                startConnection();
            }
            */
        }

        game.drawButton(string("game_licenses"), game.camera.x + (game.camera.w / 2) - 32, game.camera.y + 540, function() { window.location = "credits.txt" });

        // Loading bar
        if (resourcesLoaded < resourcesToLoad)
        {
            game.drawText(string("game_loading"), game.camera.w / 2, game.camera.y + 500, "bold 24pt Arial", game.color.white, "center", true);
        }
        else
        {
            game.drawText(string("game_loaded"), game.camera.w / 2, game.camera.y + 500, "bold 24pt Arial", game.color.white, "center", true);
        }

        var s = (resourcesLoaded / resourcesToLoad) * 196;
        if (s > 255) s = 255;
        game.drawRectangle((game.camera.w / 2) - 128, (game.camera.y + 380) + 60, s + 4, 32, "rgba(255, 255, 255, 0.25)");
        game.drawRectangle((game.camera.w / 2) - 126, (game.camera.y + 380) + 62, s, 28, "rgba(255, 255, 255, 0.5)");
    }

    // Game
    if (allResourcesLoaded && game.state === "game")
    {

    // If connection established without error
    if (game.network.connected)
    {
        // Camera viewport: Start
        cc.save();
        cc.setTransform(game.zoom, 0, 0, game.zoom, -(game.zoom-1)*game.canvas.width/2, -(game.zoom-1)*game.canvas.height/2);

        // Move the camera
        if (screen_shaking) cc.translate(irandom_range(-game.camera.x - 3, -game.camera.x + 3), irandom_range(-game.camera.y - 3, -game.camera.y + 3));
        else cc.translate(-game.camera.x, -game.camera.y);

        // Draw stars
        let viewWh = game.camera.w / 2;
        let viewHh = game.camera.h / 2;
        game.drawSprite(game.sprites["spr_stars01"], viewWh + (game.camera.x / 1.05), viewHh + (game.camera.y / 1.05));
        game.drawSprite(game.sprites["spr_stars02"], viewWh + (game.camera.x / 1.1), viewHh + (game.camera.y / 1.1));

        // Draw gates
        var i = game.entities.gates.length;
        while (i--)
        {
            let e = game.entities.gates[i];
            if (e) e.render();
        }

        // Draw stations
        i = game.entities.stations.length;
        while (i--)
        {
            let e = game.entities.stations[i];
            if (e) e.render();
        }

        // Draw asteroids
        i = game.entities.asteroids.length;
        while (i--)
        {
            let e = game.entities.asteroids[i];
            if (e) e.render();
        }

        // Draw items
        i = game.entities.items.length;
        while (i--)
        {
            let e = game.entities.items[i];
            if (e) e.render();
        }

        // Draw ships
        i = game.entities.ships.length;
        while (i--)
        {
            let e = game.entities.ships[i];
            if (e) e.render();
        }

        // Draw particles
        i = game.entities.particles.length;
        while (i--)
        {
            let e = game.entities.particles[i];
            if (e) e.render();
        }

        // Draw bullets
        i = game.entities.bullets.length;
        while (i--)
        {
            let e = game.entities.bullets[i];
            if (e) e.render();
        }

        // Draw ship names above everything else
        i = game.entities.ships.length;
        while (i--)
        {
            let e = game.entities.ships[i];

            if (game.settings.names)
            {
                game.drawSprite(e.nameSign, e.x, e.y + (e.h / 1.5));
            }

            if (game.settings.hullbars)
            {
                if (e.show_hull)
                {
                    if (game.camera.inside(e))
                    {
                        game.drawBars(e);
                    }
                }
            }
        }

        // Draw indicators (with arrows and icons towards objects)
        if (game.player.ship.cargo.container.indicator)
        {
            if (game.settings.indicator.stations) game.drawIndicators(game.entities.stations);
            if (game.settings.indicator.gates)    game.drawIndicators(game.entities.gates);
            if (game.settings.indicator.ships)    game.drawIndicators(game.entities.ships);
            if (game.settings.indicator.items)    game.drawIndicators(game.entities.items);
        }

        // Main menu
        if (main_menu)
        {
            // Box
            game.drawWindow(400, 100, game.camera.w - 800, 340, string("settings_title"), function() { main_menu = false }); // Window

            game.drawText(string("sidebar_settings_desc"), game.camera.x + game.camera.w / 2, game.camera.y + 140, "normal 12px Arial", game.color.white, "center", true);

            var setting = game.sprites["spr_gui_settings_off"];

            // General
            game.drawText(string("settings_general"), game.camera.x + game.camera.w / 2 - 160, game.camera.y + 190, "bold 12px Arial", game.color.white, "left", true);

            if (game.settings.names) { setting = game.sprites["spr_gui_settings_on"] } else { setting = game.sprites["spr_gui_settings_off"] }
            game.drawSprite(setting, game.camera.x + game.camera.w / 2 - 160, game.camera.y + 210);
            game.drawButton(string("settings_general_names"), game.camera.x + game.camera.w / 2 - 150, game.camera.y + 200, function() { if (! game.settings.names) { game.settings.names = true; localStorage.names = true; } else { game.settings.names = false; localStorage.names = false; } }, 90);

            if (game.settings.hullbars) { setting = game.sprites["spr_gui_settings_on"] } else { setting = game.sprites["spr_gui_settings_off"] }
            game.drawSprite(setting, game.camera.x + game.camera.w / 2 - 160, game.camera.y + 240);
            game.drawButton(string("settings_general_hulls"), game.camera.x + game.camera.w / 2 - 150, game.camera.y + 230, function() { if (! game.settings.hullbars) { game.settings.hullbars = true; localStorage.hullbars = true; } else { game.settings.hullbars = false; localStorage.hullbars = false; } }, 90);

            if (game.settings.particles) { setting = game.sprites["spr_gui_settings_on"] } else { setting = game.sprites["spr_gui_settings_off"] }
            game.drawSprite(setting, game.camera.x + game.camera.w / 2 - 160, game.camera.y + 270);
            game.drawButton(string("settings_general_particles"), game.camera.x + game.camera.w / 2 - 150, game.camera.y + 260, function() { if (! game.settings.particles) { game.settings.particles = true; localStorage.particles = true; } else { game.settings.particles = false; localStorage.particles = false; } }, 90);

            // Sounds
            game.drawText(string("settings_audio"), game.camera.x + game.camera.w / 2 - 160, game.camera.y + 300, "bold 12px Arial", game.color.white, "left", true);

            if (game.settings.music) { setting = game.sprites["spr_gui_settings_on"] } else { setting = game.sprites["spr_gui_settings_off"] }
            game.drawSprite(setting, game.camera.x + game.camera.w / 2 - 160, game.camera.y + 320);
            game.drawButton(string("settings_audio_music"), game.camera.x + game.camera.w / 2 - 150, game.camera.y + 310, function() { if (! game.settings.music) { game.settings.music = true; localStorage.music = true; audio_play_music(game.sounds[game.current.sector.music]) } else { game.settings.music = false; localStorage.music = false; audio_stop(game.sounds[game.current.sector.music]) } }, 90);

            if (game.settings.sound) { setting = game.sprites["spr_gui_settings_on"] } else { setting = game.sprites["spr_gui_settings_off"] }
            game.drawSprite(setting, game.camera.x + game.camera.w / 2 - 160, game.camera.y + 350);
            game.drawButton(string("settings_audio_sounds"), game.camera.x + game.camera.w / 2 - 150, game.camera.y + 340, function() { if (! game.settings.sound) { game.settings.sound = true; localStorage.sound = true; } else { game.settings.sound = false; localStorage.sound = false; } }, 90);

            // Indicator
            game.drawText(string("settings_indicator"), game.camera.x + game.camera.w / 2 + 50, game.camera.y + 190, "bold 12px Arial", game.color.white, "left", true);

            if (game.settings.indicator.ships) { setting = game.sprites["spr_gui_settings_on"] } else { setting = game.sprites["spr_gui_settings_off"] }
            game.drawSprite(setting, game.camera.x + game.camera.w / 2 + 50, game.camera.y + 210);
            game.drawButton(string("settings_indicator_ships"), game.camera.x + game.camera.w / 2 + 60, game.camera.y + 200, function() { if (! game.settings.indicator.ships) { game.settings.indicator.ships = true } else { game.settings.indicator.ships = false } }, 90);

            if (game.settings.indicator.stations) { setting = game.sprites["spr_gui_settings_on"] } else { setting = game.sprites["spr_gui_settings_off"] }
            game.drawSprite(setting, game.camera.x + game.camera.w / 2 + 50, game.camera.y + 235);
            game.drawButton(string("settings_indicator_stations"), game.camera.x + game.camera.w / 2 + 60, game.camera.y + 225, function() { if (! game.settings.indicator.stations) { game.settings.indicator.stations = true } else { game.settings.indicator.stations = false } }, 90);

            if (game.settings.indicator.gates) { setting = game.sprites["spr_gui_settings_on"] } else { setting = game.sprites["spr_gui_settings_off"] }
            game.drawSprite(setting, game.camera.x + game.camera.w / 2 + 50, game.camera.y + 260);
            game.drawButton(string("settings_indicator_gates"), game.camera.x + game.camera.w / 2 + 60, game.camera.y + 250, function() { if (! game.settings.indicator.gates) { game.settings.indicator.gates = true } else { game.settings.indicator.gates = false } }, 90);

            if (game.settings.indicator.items) { setting = game.sprites["spr_gui_settings_on"] } else { setting = game.sprites["spr_gui_settings_off"] }
            game.drawSprite(setting, game.camera.x + game.camera.w / 2 + 50, game.camera.y + 285);
            game.drawButton(string("settings_indicator_items"), game.camera.x + game.camera.w / 2 + 60, game.camera.y + 275, function() { if (! game.settings.indicator.items) { game.settings.indicator.items = true } else { game.settings.indicator.items = false } }, 90);

            // Language
            game.drawText(string("settings_language"), game.camera.x + game.camera.w / 2 + 50, game.camera.y + 300, "bold 12px Arial", game.color.white, "left", true);

            game.drawButton(string("settings_language_de"), game.camera.x + game.camera.w / 2 + 60, game.camera.y + 310, function() { game.language = "de" }, 90);
            game.drawButton(string("settings_language_en"), game.camera.x + game.camera.w / 2 + 60, game.camera.y + 340, function() { game.language = "en" }, 90);

            // Welcome screen
            game.drawButton(string("welcome_open"), game.camera.x + game.camera.w / 2 - 80, game.camera.y + 380, function() { main_menu = false; welcome_screen = true; }, 160);

            // Accept and close menu
            game.drawButton(string("settings_close"), game.camera.x + game.camera.w / 2 - 45, game.camera.y + 410, function() { main_menu = false }, 90);
        }

        // Trade with base
        if (game.player.ship.on_station && ! trading)
        {
            game.drawText(string("trade_press_c") + string("station_" + game.getNearest(game.player.ship, game.entities.stations).type) + string("trade_press_c2"), game.camera.x + game.camera.w / 2, game.camera.y + game.camera.h - 140, "bold 30px Arial", game.color.white, "center", true);
        }

        if (game.player.ship.on_station && trading)
        {
            game.drawWindow(game.camera.w / 2 + 140, game.camera.h / 2 - 180, 491, 430, "Terraner Ausrüstungsdock", function() { trading = false });

            // Display credits
            game.drawRectangle(game.camera.x + game.camera.w / 2 + 432, game.camera.y + game.camera.h / 2 - 35, 100, 20, "rgba(63, 63, 63, 0.5)");
            game.drawSprite(game.sprites["spr_credits"], game.camera.x + game.camera.w / 2 + 522, game.camera.y + game.camera.h / 2 - 25); // Ship
            game.drawText(money(game.player.credits), game.camera.x + game.camera.w / 2 + 512, game.camera.y + game.camera.h / 2 - 25, "normal 12px Arial", game.color.white, "right", true);

            // Display own ship
            game.drawSprite(game.player.ship.sprite, game.camera.x + game.camera.w / 2 + 270, game.camera.y + game.camera.h / 2 - 90, false, game.player.ship.w * 2); // Ship

            // Display turrets
            var tmax = game.player.ship.turrets_max;
            for (var i = 0; i < tmax; i++)
            {
                if (game.player.ship.turrets[i]) game.drawSprite(game.player.ship.turrets[i].sprite, game.camera.x + game.camera.w / 2 + 270 + lengthdir_x(game.player.ship["wep"+i+"d"] * 2, game.player.ship["wep"+i+"a"]), game.camera.y + game.camera.h / 2 - 90 + lengthdir_y(game.player.ship["wep"+i+"d"] * 2, game.player.ship["wep"+i+"a"]), false, game.player.ship.turret[i].w * 2);
                game.drawText(i, game.camera.x + game.camera.w / 2 + 255 + lengthdir_x(game.player.ship["wep"+i+"d"] * 2, game.player.ship["wep"+i+"a"]), game.camera.y + game.camera.h / 2 - 90 + lengthdir_y(game.player.ship["wep"+i+"d"] * 2, game.player.ship["wep"+i+"a"]), "bold 14px Arial", "#00ff00", "center", true);
            }

            // Display trade buttons
            game.drawText(string("trade_upgrades"), game.camera.x + game.camera.w / 2 + 150, game.camera.y + game.camera.h / 2 + 10, "bold 13px Arial", "#abc7ff", "left", true);

            // Shield
            game.drawText("Schild: " + game.player.ship.shield.points_max / 1000 + " MJ", game.camera.x + game.camera.w / 2 + 150, game.camera.y + game.camera.h / 2 + 30, "normal 11px Arial", game.color.white, "left", true);
            game.drawButton("25 MJ (500 Cr)", game.camera.x + game.camera.w / 2 + 240, game.camera.y + game.camera.h / 2 + 20, function() { if (game.player.credits >= 250) { game.creditsRemove(250); game.player.ship.shield.points = game.player.ship.shield.points_max = 25000; game.addTradepoints(50); } }, 100);
            game.drawButton("50 MJ (1 500 Cr)", game.camera.x + game.camera.w / 2 + 340, game.camera.y + game.camera.h / 2 + 20, function() { if (game.player.credits >= 1000) { game.creditsRemove(1000); game.player.ship.shield.points = game.player.ship.shield.points_max = 50000; game.addTradepoints(150); } }, 100);
            game.drawButton("125 MJ (5 000 Cr)", game.camera.x + game.camera.w / 2 + 440, game.camera.y + game.camera.h / 2 + 20, function() { if (game.player.credits >= 2500) { game.creditsRemove(2500); game.player.ship.shield.points = game.player.ship.shield.points_max = 125000; game.addTradepoints(500); } }, 100);

            // Gravidar
            var scanner = "Simplex";
            switch (game.player.ship.gravidar)
            {
                case 2000: scanner = "Duplex"; break;
                case 4000: scanner = "Triplex"; break;
                case 6000: scanner = "Quadruplex"; break;
            }
            game.drawText("Scanner: " + scanner, game.camera.x + game.camera.w / 2 + 150, game.camera.y + game.camera.h / 2 + 52, "normal 11px Arial", game.color.white, "left", true);
            game.drawButton("Duplex (300 Cr)", game.camera.x + game.camera.w / 2 + 260, game.camera.y + game.camera.h / 2 + 42, function() { if (game.player.credits >= 300) { game.creditsRemove(300); game.player.ship.gravidar = 2000; game.addTradepoints(30); } }, 100);
            game.drawButton("Triplex (800 Cr)", game.camera.x + game.camera.w / 2 + 360, game.camera.y + game.camera.h / 2 + 42, function() { if (game.player.credits >= 700) { game.creditsRemove(700); game.player.ship.gravidar = 4000; game.addTradepoints(70); } }, 100);
            game.drawButton("Quadruplex (2000 Cr)", game.camera.x + game.camera.w / 2 + 460, game.camera.y + game.camera.h / 2 + 42, function() { if (game.player.credits >= 1200) { game.creditsRemove(1200); game.player.ship.gravidar = 6000; game.addTradepoints(120); } }, 110);

            // Buy weapons
            game.drawText(string("trade_gun"), game.camera.x + game.camera.w / 2 + 145, game.camera.y + game.camera.h / 2 + 75, "bold 13px Arial", "#abc7ff", "left", true);
            var slots = Object.keys(game.db.ships[game.player.ship.ship].weapons.slots).length;
            for (var i = 0; i < slots; i++)
            {
                var type = "-";
                var turret = game.player.ship.turrets[i];
                if (turret !== undefined && turret.type !== null) { type = turret.type; }

                game.drawText(i + ": " + type.toUpperCase(), game.camera.x + game.camera.w / 2 + 150, game.camera.y + game.camera.h / 2 + 100 + (i*20), "normal 11px Arial", game.color.white, "left", true);

                for (var j in game.db.ships[game.player.ship.ship].weapons.compatible)
                {
                    var weapon = game.db.ships[game.player.ship.ship].weapons.compatible[j];
                    game.drawButton(game.db.items[weapon].token.toUpperCase() +  " (" + game.db.items[weapon].price + " Cr)", game.camera.x + game.camera.w / 2 + 190 + (j * 80), game.camera.y + game.camera.h / 2 + 90 + (i*20), function()
                    {
                        if (game.player.credits >= game.db.items[weapon].price && cargo_check_space(weapon))
                        {
                            game.creditsRemove(game.db.items[weapon].price);
                            if (turret.type !== null && game.player.ship.turrets[i])
                            {
                                game.cargoRemove(game.player.ship, turret.type, 1, true);
                            }
                            game.cargoAdd(game.player.ship, weapon, 1, true);
                            change_weapon(i, weapon);
                            game.addTradepoints(game.db.items[weapon].price / 10);
                        }
                    }, 80);
                }
            }
            game.drawWindow(game.camera.w / 2 - 280, game.camera.h / 2 - 180, 350, 380, string("trade"), function() { trading = false; });

            game.drawText(string("trade_buy"), game.camera.x + game.camera.w / 2 - 105, game.camera.y + game.camera.h / 2 - 140, "normal 12px Arial", game.color.white, "center", true);

            var box_size = 32;
            var box_gap = 1;

            var cols = 10;
            var rows = 4;

            var item_x = 0;
            var item_y = 0;

            var j = 0;

            var credits_change = 0;
            var selected_item = "blank";

            // Draw boxes and items inside of them
            while((j / cols) < rows)
            {
                var Dock = game.getNearest(game.player.ship, game.entities.stations);
                var item = Dock.stock[j];
                item_x = (j % cols) * (box_size + box_gap);
                item_y = Math.floor(j / cols) * (box_size + box_gap);

                // Draw boxes
                game.drawRectangle(game.camera.x + game.camera.w / 2 - 270 + item_x, game.camera.y + game.camera.h / 2 - 130 + item_y, box_size, box_size, "rgba(0, 0, 0, 0.33)");

                // Draw item sprite and quantity text
                if (item !== undefined)
                {
                    // Mark items red if they cost more than you can afford
                    if (JSON.parse(game.player.credits) < game.db.items[item.name].price)
                    { game.drawRectangle(game.camera.x + game.camera.w / 2 - 270 + item_x, game.camera.y + game.camera.h / 2 - 130 + item_y, box_size, box_size, "rgba(255, 0, 0, 0.15)"); }

                    // Display mouse over boxes with item name
                    if (mouse_inside(game.camera.x + game.camera.w / 2 - 270 + item_x, game.camera.y + game.camera.h / 2 - 130 + item_y, 32, 32))
                    {
                        // Select the item box
                        game.drawRectangle(game.camera.x + game.camera.w / 2 - 270 + item_x, game.camera.y + game.camera.h / 2 - 130 + item_y, box_size, box_size, game.color.green, 1);

                        // Select the item for item name and credits
                        selected_item = item.name;
                        credits_change = -game.db.items[item.name].price;

                        // Buy item
                        if (item.quantity > 0 && game.mouse.isDown[game.mouse.right] && game.player.credits >= game.db.items[item.name].price)
                        {
                            audio_play_sound(game.sounds["snd_gui_button_hover"]);
                            game.mouse.isDown[game.mouse.right] = false;
                            for (var i = Dock.stock.length; i--;) { if (Dock.stock[i].name === item.name) Dock.stock[i].quantity -= 1; }
                            game.creditsRemove(game.db.items[item.name].price);
                            game.cargoAdd(game.player.ship, item.name, 1, true);
                            game.addTradepoints(game.db.items[item.name].price / 10);
                        }
                    }
                    var itemSprite = game.sprites[game.db.items[item.name].sprite];

                    game.drawSprite(itemSprite, game.camera.x + game.camera.w / 2 - 270 + 16 + item_x, game.camera.y + game.camera.h / 2 - 130 + 16 + item_y, -22.5);
                    game.drawRectangle(game.camera.x + game.camera.w / 2 - 270 + 1 + item_x, game.camera.y + game.camera.h / 2 - 130 + item_y + 1 + 21, box_size-2, 9, "rgba(0, 0, 0, 0.6)");
                    game.drawText(item.quantity, game.camera.x + game.camera.w / 2 - 270 + 31 + item_x, game.camera.y + game.camera.h / 2 - 130 + 27 + item_y, "normal 10px Arial", game.color.white, "right", false);
                }
                j++
            }

            // List your own items for selling
            var k = 0;
            cargo_list = [];
            for (var i in game.player.ship.cargo.container)
            {
                cargo_list.push(game.player.ship.cargo.container[i]);
                cargo_list[k].name = i;
                k++;
            }

                game.drawText(string("trade_sell"), game.camera.x + game.camera.w / 2 - 105, game.camera.y + game.camera.h / 2 + 20, "normal 12px Arial", game.color.white, "center", true);

            var i = 0;
            while((i / cols) < rows)
            {
                var item = cargo_list[i];
                item_x = (i % cols) * (box_size + box_gap);
                item_y = Math.floor(i / cols) * (box_size + box_gap);

                // Draw boxes
                game.drawRectangle(game.camera.x + game.camera.w / 2 - 270 + item_x, game.camera.y + game.camera.h / 2 + 30 + item_y, box_size, box_size, "rgba(0, 0, 0, 0.33)");

                // Draw item sprite and quantity text
                if (item !== undefined)
                {
                    // Display mouse over boxes with item name
                    if (mouse_inside(game.camera.x + game.camera.w / 2 - 270 + item_x, game.camera.y + game.camera.h / 2 + 30 + item_y, 32, 32))
                    {
                        // Select the item box
                        game.drawRectangle(game.camera.x + game.camera.w / 2 - 270 + item_x, game.camera.y + game.camera.h / 2 + 30 + item_y, box_size, box_size, game.color.green, 1);

                        // Select the item for item name and credits
                        selected_item = item.name;
                        credits_change = game.db.items[item.name].price;

                        // Sell item
                        if (game.mouse.isDown[game.mouse.right])
                        {
                            var pieces = 1;
                            if (game.keyboard.isDown[game.keyboard.shift])
                            {
                                pieces = 5;
                                if (game.player.ship.cargo.container[item.name].quantity < 5)
                                {
                                    pieces = game.player.ship.cargo.container[item.name].quantity;
                                }
                            }
                            audio_play_sound(game.sounds["snd_gui_button_hover"]);
                            game.mouse.isDown[game.mouse.right] = false;
                            for (var f = 0; f < Dock.stock.length; f++)
                            {
                                if (Dock.stock[f].name === item.name)
                                {
                                    Dock.stock[f].quantity += pieces;
                                }
                            }
                            game.creditsAdd(game.db.items[item.name].price * pieces);
                            game.cargoRemove(game.player.ship, item.name, pieces, true);
                            game.addTradepoints((game.db.items[item.name].price / 10) * pieces);
                        }
                    }

                    var itemSprite = game.db.items[item.name].sprite;

                    game.drawSprite(game.sprites[itemSprite], game.camera.x + game.camera.w / 2 - 270 + 16 + item_x, game.camera.y + game.camera.h / 2 + 30 + 16 + item_y, -22.5);
                    game.drawRectangle(game.camera.x + game.camera.w / 2 - 270 + 1 + item_x, game.camera.y + game.camera.h / 2 + 30 + item_y + 21 + 1, box_size-2, 9, "rgba(0, 0, 0, 0.6)");
                    game.drawText(item.quantity, game.camera.x + game.camera.w / 2 - 270 + 31 + item_x, game.camera.y + game.camera.h / 2 + 30 + 27 + item_y, "normal 10px Arial", game.color.white, "right", false);
                }
                i++
            }

            if (selected_item !== "blank") game.drawText(string("item_" + selected_item) + " (" + money(game.db.items[selected_item].price) + " Cr)", game.camera.x + game.camera.w / 2 - 270, game.camera.y + game.camera.h / 2 + 182, "normal 12px Arial", game.color.white, "left", true);
            game.drawText(money(JSON.parse(game.player.credits) + credits_change), game.camera.x + game.camera.w / 2 + 49, game.camera.y + game.camera.h / 2 + 182, "normal 12px Arial", game.color.white, "right", true);
            cc.drawImage(game.sprites["spr_credits"], game.camera.x + game.camera.w / 2 + 50, game.camera.y + game.camera.h / 2 + 172);
        }

        ////////// DEBUG
        if (game.debug)
        {
            game.drawText("Generator: " + rounded(game.player.ship.generator) + " / " + game.player.ship.generator_max, game.camera.x + game.camera.w / 2 - 200, game.camera.y + 50, "default", game.color.white, "left", false);

            game.drawText("Dateien geladen: " + resourcesLoaded, game.camera.x + 50, game.camera.y + 130);
            game.drawText("Schiffe: " + game.Ship.count, game.camera.x + 50, game.camera.y + 145);
            game.drawText("Partikel: " + game.Particle.count, game.camera.x + 50, game.camera.y + 160);
            game.drawText("Schüsse: " + game.Bullet.count, game.camera.x + 50, game.camera.y + 175);
            game.drawText("Asteroiden: " + game.Asteroid.count, game.camera.x + 50, game.camera.y + 190);

            // Camera viewport data
            game.drawText("Kamera: " + rounded2(game.camera.x) + " / " + rounded2(game.camera.y), game.camera.x + 45, game.camera.y + 380);
            game.drawText("Pilotin: " + rounded2(game.player.ship.x) + " / " + rounded2(game.player.ship.y), game.camera.x + 45, game.camera.y + 395);

            game.drawText("== Spielerinnen ==", game.camera.x + 60, game.camera.y + 225);
            for (var i = 0; i < game.entities.players.length; i++)
            {
                var p = game.entities.players[i];
                game.drawText(i + ": " + p.name + " (schießt: " + p.shooting + " | fliegt: " + p.moving + ", dreht: " + p.rotating + ")", game.camera.x + 60, game.camera.y + 255+(i*15), "normal 12px Arial", game.color.white, "left", false);
                game.drawText(p.name + ": " + rounded(p.x) + " / " + rounded(p.y), game.camera.x + game.camera.w - 5, game.camera.y + 180+(i*15), "normal 12px Arial", game.color.white, "right", false);
            }

            // Test: Zoom
            game.drawText("Zoomwert: " + game.zoom, game.camera.x + 45, game.camera.y + 430, "normal 12px Arial", game.color.white, "left");
        }

        /// DEBUG END ////



        ////////// GUI //////////

        // Minimap
        game.drawMinimap();

        // Camera viewport: End
        cc.restore();

        //////// GUI END ///////

        //// GUI END ////

        if (! game.network.connected && ! connection_error) { game.drawText(string("connection_begin"), game.camera.w / 2, game.camera.h / 2, "bold 24pt Arial", game.color.white, "center", true) }
        if (connection_error) { gui.style.visibility = "hidden"; game.drawText(string("connection_interrupted"), game.camera.w / 2, game.camera.h / 2, "bold 24pt Arial", game.color.white, "center", true) }
    }

    // FPS measurement
    if (timestamp > game.time.fpsLastUpdate + 1000)
    {
        game.time.fps = 0.25 * game.time.fpsThisSecond + (1 - 0.25) * game.time.fps;
        game.time.fpsLastUpdate = timestamp;
        game.time.fpsThisSecond = 0;
    }
    game.time.fpsThisSecond += 1;
    }

    // Time based animation
    game.time.before = timestamp;
    game.time.now = Date.now();

    // Call the next draw circle
    //requestAnimationFrame(game.render);
}
/********** END: Drawing **********/



// Draws a sprite
game.drawSprite = function(sprite, x, y, angle, sizew, sizeh)
{
    var size_w = sprite.width;
    var size_h = sprite.height;

    if (sizew !== undefined)
    {
	    size_w = sizew;
    }

    if (sizeh !== undefined)
    {
	    size_h = sizeh;
    }
    else if (sizew !== undefined)
    {
	    size_h = size_w;
    }

    if (angle !== undefined && angle !== 0)
    {
    	cc.translate(x, y);
        cc.rotate(angle * pi180);
        cc.drawImage(sprite, -(size_w / 2), -(size_h / 2), size_w, size_h);
        cc.rotate(-(angle * pi180));
    	cc.translate(-x, -y);
    }
    else
    {
        cc.drawImage(sprite, x - (size_w / 2), y - (size_h / 2), size_w, size_h);
    }
}

//----------------------------------------------------------------------------------------------------

// Draws a text
game.drawText = function(text, x, y, style, color, align, shadow)
{
    cc.textAlign = align;
	cc.font = default_font;

    if (style !== "default") { cc.font = style }

    if (shadow !== undefined)
    {
        cc.fillStyle = "rgba(0, 0, 0, 0.5)",
        cc.fillText(text, x + 1, y + 1);
    }

    cc.fillStyle = color;
    cc.fillText(text, x, y);
}

//----------------------------------------------------------------------------------------------------

// Draws a rectangle
game.drawRectangle = function(x1, y1, x2, y2, color, lineWidth)
{
    if (x1 !== 0 && y1 !== 0 && x2 !== 0 && y2 !== 0)
    {
        if (lineWidth)
        {
            cc.lineWidth = lineWidth;
            cc.fillStyle = "transparent";
            cc.strokeStyle = color;
            cc.strokeRect(x1, y1, x2, y2);
        }
        else { cc.fillStyle = color; cc.fillRect(x1, y1, x2, y2); }
    }
}

//----------------------------------------------------------------------------------------------------

// Draws a circle
game.drawCircle = function(x, y, radius, color, filled, lineWidth)
{
    if (radius < 0) radius = 100;
    cc.beginPath();
    cc.arc(x, y, radius, 0, Math.PI*2, true);

    switch (filled)
    {
        case true: cc.fillStyle = color; cc.fill(); break;

        case false:
        default: cc.lineWidth = lineWidth; cc.strokeStyle = color; cc.stroke(); break;
    }
}

//----------------------------------------------------------------------------------------------------

// Draws a line (from x1/y1 to x2/y2)
game.drawLine = function(x1, y1, x2, y2, color, width)
{
    if (color) cc.strokeStyle = color;
    if (width) cc.lineWidth = width;
    cc.beginPath();
    cc.moveTo(x1, y1);
    cc.lineTo(x2, y2);
    cc.stroke();
}


//----------------------------------------------------------------------------------------------------

game.drawMinimap = function()
{
	let minimapSize = 250;
    let minimapSizeHalf = minimapSize / 2
    let mapSize = game.current.sector.size / minimapSize;
    let viewX = game.camera.x;
    let viewY = game.camera.y;
    let viewW = game.camera.w;
    let viewH = game.camera.h;
    let xw = viewX + viewW;
    let yh = viewY + viewH;
    let middleX = xw - minimapSizeHalf;
    let middleY = yh - minimapSizeHalf;

    let gravidar = game.camera.target.gravidar;
    let gravidarZoom = minimapSize / gravidar;

    // Background, map & shadow
    cc.drawImage(game.sprites[game.current.sector.minimap], viewX + viewW - minimapSize - 7, viewY + viewH - minimapSize - 7, minimapSize, minimapSize);
    cc.drawImage(game.sprites["spr_gui_minimap_shadow"], viewX + viewW - minimapSize - 7, viewY + viewH - minimapSize - 7, minimapSize, minimapSize);
    cc.drawImage(game.sprites["spr_gui_minimap"], viewX + viewW - game.sprites["spr_gui_minimap"].width, viewY + viewH - game.sprites["spr_gui_minimap"].height);

    // Map: Display stations and gates
    if (game.settings.map.stations)
    {
        var i = game.entities.stations.length;
        while (i--)
        {
            var s = game.entities.stations[i];
            var d = point_distance(s.x, s.y, game.camera.target.x, game.camera.target.y);

            if (d < gravidar)
            {
                game.drawSprite
                (
                    s.sprite_minimap,
                    middleX - (game.camera.target.x / mapSize) + (s.x / mapSize),
                    middleY - (game.camera.target.y / mapSize) + (s.y / mapSize),
                    270
                );
            }
        }

        i = game.entities.gates.length;
        while (i--)
        {
            var g = game.entities.gates[i];
            var d = point_distance(g.x, g.y, game.camera.target.x, game.camera.target.y);

            if (d < gravidar)
            {
                game.drawSprite
                (
                    g.sprite_minimap,
                    middleX - (game.camera.target.x / mapSize) + (g.x / mapSize),
                    middleY - (game.camera.target.y / mapSize) + (g.y / mapSize),
                    270
                );
            }
        }
    }

    // Map: Display asteroids
    if (game.settings.map.asteroids)
    {
        var i = game.entities.asteroids.length;
        while (i--)
        {
            var a = game.entities.asteroids[i];
            var d = point_distance(a.x, a.y, game.camera.target.x, game.camera.target.y);

            if (d < gravidar)
            {
                game.drawSprite
                (
                    a.sprite_minimap,
                    middleX - (game.camera.target.x / mapSize) + (a.x / mapSize),
                    middleY - (game.camera.target.y / mapSize) + (a.y / mapSize),
                    270
                );
            }
        }
    }

    // Map: Items
    if (game.settings.map.items)
    {
        var i = game.entities.items.length;
        while (i--)
        {
            var i = game.entities.items[i];
            var d = point_distance(i.x, i.y, game.camera.target.x, game.camera.target.y);

            if (d < gravidar)
            {
                game.drawSprite
                (
                    i.sprite_minimap,
                    middleX - (game.camera.target.x / mapSize) + (i.x / mapSize),
                    middleY - (game.camera.target.y / mapSize) + (i.y / mapSize),
                    270
                );
            }
        }
    }

    // Map: Display ships
    if (game.settings.map.ships)
    {
        var i = game.entities.ships.length;
        while (i--)
        {
            var s = game.entities.ships[i];
            var d = point_distance(s.x, s.y, game.camera.target.x, game.camera.target.y);

            if (d < gravidar && s !== game.camera.target)
            {
                game.drawSprite
                (
                    s.sprite_minimap,
                    middleX - (game.camera.target.x / mapSize) + (s.x / mapSize),
                    middleY - (game.camera.target.y / mapSize) + (s.y / mapSize),
                    rounded(s.angle)
                );
            }
        }
    }

    // Draw the own ship
    game.drawSprite(game.camera.target.sprite_minimap_you, middleX, middleY, rounded(game.camera.target.angle));

    // When clicking on the minimap, let the camera jump to that position
    if (mouse_inside(viewX + viewW - minimapSize - 4, viewY + viewH - minimapSize - 4, minimapSize, minimapSize))
    {
        if (game.mouse.isDown[game.mouse.right])
        {
            var x = (game.mouse.x - viewW + (minimapSize / 2)) * minimapSize;
            var y = (game.mouse.y - viewH + (minimapSize / 2)) * minimapSize;
            game.camera.target = { x: x, y: y };
        }
        else game.camera.target = game.player.ship;
    }

    // Show coordinates
    game.drawText(rounded((game.camera.target.x / game.current.sector.size) * 800) + " /", viewX + viewW - 56, viewY + viewH - 274, "normal 15px Arial", game.color.white, "right", true);
    game.drawText(rounded((game.camera.target.y / game.current.sector.size) * 800), viewX + viewW - 53, viewY + viewH - 274, "normal 15px Arial", game.color.white, "left", true);
}

//----------------------------------------------------------------------------------------------------

// Draw ship icons and arrows on screen
game.drawIndicators = function(target)
{
    var size = (document.body.scrollWidth + document.body.scrollHeight) / 100;
    var color = "rgba(0, 0, 0, 0.5)";
    var borderColor;
    var borderSize = 2;

    // If target's id is not the same as the player's id, if it's not inside the camera view and if it's inside the radar range
    var i = target.length;
    while (i--)
    {
        var t = target[i];
        var tx = t.x;
        var ty = t.y;
        var distance = point_distance(game.player.ship.x, game.player.ship.y, tx, ty);

        if (t !== game.player.ship)
        {
            if (! game.camera.inside(t))
            {
                if (distance <= game.player.ship.gravidar)
                {
                    var direction = point_direction(game.player.ship.x, game.player.ship.y, tx, ty);

                    if (tx <= game.camera.x + size + (borderSize - 0.5)) tx = game.camera.x + size + (borderSize - 0.5);
                    if (ty <= game.camera.y + size + (borderSize - 0.5)) ty = game.camera.y + size + (borderSize - 0.5);
                    if (tx >= game.camera.x + game.camera.w - size - (borderSize - 0.5)) tx = game.camera.x + game.camera.w - size - (borderSize - 0.5);
                    if (ty >= game.camera.y + game.camera.h - size - (borderSize - 0.5)) ty = game.camera.y + game.camera.h - size - (borderSize - 0.5);

                    // If target is an enemy of you
                    if (game.player.ship.foes.indexOf(t.race) >= 0) borderColor = "rgba(255, 0, 0, 0.25)";
                    else borderColor = "rgba(0, 159, 255, 0.25)";

                    // Draw box
                    //game.drawRectangle(tx - (size / 2), ty - (size / 2), size, size, color);
                    game.drawCircle(tx, ty, size, color, true)
                    game.drawCircle(tx, ty, size, borderColor, false, borderSize)

                    // Draw objects sprite
                    game.drawSprite(t.sprite_minimap, tx, ty, t.angle, size * 1.25) ;
                }
            }
        }
    }
}

// Draws shield and hull bars of given object
game.drawBars = function(obj)
{
    let x = obj.x;
    let y = obj.y + (obj.h / 1.5);
    let w = obj.w;
    let h = obj.h;
    let hull = obj.hull;
    let hullMax = obj.hull_max;
    let hullPercent = hull / hullMax;
    let sp = obj.shield.points;
    let spMax = obj.shield.points_max;
    let spPercent = sp / spMax;
    let boxWidth = 1 + (rounded((w / 2) / 5) * 5);
    let sprite = game.sprites["spr_bars"];

    if (obj.shield)
    {
        // Shield background
        cc.drawImage(sprite, 0, 4, boxWidth, 4, x - (w / 4), y - 24, boxWidth, 4);

        // Shield full
        if (sp > 0)
        {
            cc.drawImage(sprite, 0, 0, spPercent * boxWidth, 4, x - (w / 4), y - 24, spPercent * boxWidth, 4);
        }
    }

    // Hull background
    cc.drawImage(sprite, 0, 4, boxWidth, 4, x - (w / 4), y - 20, boxWidth, 4);

    // Hull full
    if (hull > 0)
    {
        cc.drawImage(sprite, 0, 8, hullPercent * boxWidth, 4, x - (w / 4), y - 20, hullPercent * boxWidth, 4);
    }
}

// Draws username and hull of given objet
game.drawName = function(obj)
{
    // Only if inside viewport (improves performance)
    if (game.settings.names)
    {
        let x = obj.x;
        let y = obj.y;
        let name = obj.name;
        let alliance = obj.alliance;
        let race = obj.race;

        var nameColor = game.color.white;

        if (! obj.computer)
        {
            nameColor = game.color.white;
        }
        else
        {
            if (race === "xenon") nameColor = game.color.red;
            else if (race === "terran") nameColor = game.color.green;
        }

        cc.font = "bold 13px Arial"
        cc.lineWidth = 3;
        cc.strokeStyle = game.color.black;

        // Display the alliance's emblem if player is member of one
        if (! alliance || alliance === null || alliance === "")
        {
            cc.fillStyle = nameColor;
            cc.textAlign = "center";
            cc.strokeText(name, x, y + 50);
            cc.fillText(name, x, y + 50);
        }

        else
        {
            // Compare width of ship with alliance name
            var box_width = 0;
            var name_width = cc.measureText(name).width;
            var alliance_width = cc.measureText(alliance).width;

            if (name_width > alliance_width) box_width = name_width;
            else box_width = alliance_width;

            // game.drawSprite(sprite, x, y, angle, sizew, sizeh)
            game.drawSprite(obj.alliance_emblem, x - (box_width / 2) - 9, y + 58, 0, 30, 30);

            if (alliance === game.player.ship.alliance) cc.fillStyle = "#3ae63a";
            else cc.fillStyle = game.color.white;

            cc.textAlign = "left";

            cc.strokeText(alliance, x - (box_width / 2) + 9, y + 50);
            cc.fillText(alliance, x - (box_width / 2) + 9, y + 50);

            cc.fillStyle = nameColor;
            cc.strokeText(name, x - (box_width / 2) + 9, y + 66);
            cc.fillText(name, x - (box_width / 2) + 9, y + 66);
        }

        // Shield and hull bars
        if (game.settings.hullbars && obj.show_hull) game.drawBars(obj);
    }
}
