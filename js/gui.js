// Draws a clickable rectangle button with text
game.drawButton = function(label, x, y, action, size)
{
    if (size !== undefined) { size = size; } else { size = cc.measureText(label).width + 10; }

    // Sprites
    let sprite_l = game.sprites["spr_gui_button_l"];
    let sprite_m = game.sprites["spr_gui_button_m"];
    let sprite_r = game.sprites["spr_gui_button_r"];

    let h = sprite_m.height;

    // Text
    let color_text_hover = "white";
    let color_text = "#bfd3ff";

    // If mouse over, change sprites
    if (mouse_inside(x, y, size - 1, h))
    {
        game.mouse.over_gui = true;

        color_text = color_text_hover;

        //if (sound_enabled && hover) { audio_play_sound(game.sounds[\"snd_gui_button_hover); }
        sprite_l = game.sprites["spr_gui_button_la"];
        sprite_m = game.sprites["spr_gui_button_ma"];
        sprite_r = game.sprites["spr_gui_button_ra"];

        // When clicked
        if (game.mouse.isDown[game.mouse.left])
        {
            x = x + 1;
            y = y + 1;
        }

        // When mouse released
        if (game.mouse.isUp[game.mouse.left])
        {
            game.mouse.isUp[game.mouse.left] = false;
            audio_play_sound(game.sounds["snd_gui_close"]);
            if (action !== null) action();
        }
    }

    // Draw images
    cc.drawImage(sprite_l, x, y);
    cc.drawImage(sprite_m, x + sprite_l.width, y, size - sprite_l.width - sprite_r.width, h);
    cc.drawImage(sprite_r, x + size - sprite_r.width, y);

    // Label
    game.drawText(label, x + (size / 2) + 1, y + (h / 2), "bold 10px Arial", color_text, "center", false);
}

//----------------------------------------------------------------------------------------------------

// Draws a window
game.drawWindow = function(x, y, w, h, title, close)
{
    x = x + game.camera.x;
    y = y + game.camera.y;

    // Title bar
    cc.drawImage(game.sprites["spr_gui_gradient_titlebar"], x, y, w, 22); // Background
    game.drawButton("X", x + 1, y + 1, function() { close(); }, 21) // Close button
    game.drawText(title, x + 28, y + 11, "bold 13px Arial", "white", "left", true); // Title text

    // Content box
    cc.globalAlpha = 0.9;
    cc.drawImage(game.sprites["spr_gui_gradient_window"], x, y + 22, w, h - 22); // Background
    cc.globalAlpha = 1;

    cc.lineWidth = 1;
    cc.strokeStyle = "rgba(0, 0, 0, 0.5)";
    cc.strokeRect(x, y, w, h);

    // Content box shadow
    let guiShadow = game.sprites["spr_gui_shadow"];
    cc.drawImage(guiShadow, 0, 0, 17, 17, x - 17, y - 17, 17, 17); // Corner left top
    cc.drawImage(guiShadow, 17, 0, 17, 17, x + w, y - 17, 17, 17); // Corner right top
    cc.drawImage(guiShadow, 51, 0, 17, 17, x - 17, y + h, 17, 17); // Corner left bottom
    cc.drawImage(guiShadow, 34, 0, 17, 17, x + w, y + h, 17, 17); // Corner right bottom

    cc.drawImage(guiShadow, 69, 0, 17, 1, x - 17, y, 17, h); // Left
    cc.drawImage(guiShadow, 85, 0, 17, 1, x + w, y, 17, h); // Right

    cc.drawImage(guiShadow, 103, 0, 1, 17, x, y - 17, w, 17); // Top
    cc.drawImage(guiShadow, 106, 0, 1, 17, x, y + h, w, 17); // Bottom

    // Mouse is over GUI when over this window
    if (mouse_inside(x, y, w, h)) game.mouse.over_gui = true;
}

//----------------------------------------------------------------------------------------------------

// Top bar
game.TopBar = function()
{
    var d = document.createElement("div");
    document.getElementById("gui").appendChild(d);
    d.onclick = function() { game.canvas.focus() };
    d.onmouseleave = function() { close_tooltip() }

    d.id = "topbar";

    d.innerHTML = "<div id='topbar_credits'></div>"
                + "<div id='topbar_servertime'></div>";

    if (! singleplayer)
    {
        d.innerHTML += "<div id='topbar_playersonline'></div>"
                     + "<div id='topbar_ping'></div>";
    }

    d.innerHTML += "<div id='topbar_fps'></div>";

    var update = function()
    {
        topbar_credits.innerHTML = '<img src=images/spr_credits.png>' + money(game.player.credits);
        topbar_servertime.innerHTML = '<img src=images/spr_clock.png> ' + display_time(game.network.time);

        if (! singleplayer)
        {
            topbar_ping.innerHTML = 'Ping: ' + game.network.ping;
            topbar_playersonline.innerHTML = '<img src=images/spr_players.png> ' + game.network.players;
        }

        topbar_fps.innerHTML = 'FPS: ' + rounded(MainLoop.getFPS());//rounded(game.time.fps);
    }

    update();
    setInterval(update, 500);

    topbar_credits.onmouseover = function() { change_tooltip("Credits", "") }
    topbar_servertime.onmouseover = function() { change_tooltip(string("server_time"), "") }

    if (! singleplayer)
    {
        topbar_ping.onmouseover = function() { change_tooltip("Ping", "") }
        topbar_playersonline.onmouseover = function() { change_tooltip(string("players_online"), "") }
    }

    topbar_fps.onmouseover = function() { change_tooltip(string("players_online"), "") }
}

//----------------------------------------------------------------------------------------------------

// WeaponInfo
game.WeaponInfo = function()
{
    var update = function()
    {
        var h = "";

        for (let t of game.player.ship.turrets)
        {
            if (t.type !== null)
            {
                var _mouseover = function () { change_tooltip(string("item_" + t.type), (game.player.ship.generator / game.player.ship.generator_max * 100) + "%") }

                h += "<div class='box' onmouseover='" + _mouseover + "'>"
                    + "<div class='icon' style='background-image: url(images/spr_item_" + t.type + ".png)'></div>"
                    + "<font>" + t.type.toUpperCase() + "</font>"
                + "<div class='bar_bg'><div class='bar' style='width: " + (game.player.ship.generator / game.player.ship.generator_max * 100) + "%'></div></div></div>"
            }
        }

        document.getElementById('weaponInfo').innerHTML = h;
    }

    update();
    setInterval(update, 100);
}

//----------------------------------------------------------------------------------------------------

// Ship info boxes
game.Infobox = function()
{
    gui.onclick = function() { game.canvas.focus(); }

    var update_infobox = function()
    {
        if (game.player.ship !== undefined)
        {
            var html = "<table>"
            + "<tr><td class='name' colspan=3>" + game.player.ship.name + "</td><td class='speed'>" + rounded(game.player.ship.mspeed) + "m/s</td></tr>"
            + "<tr><td colspan=2 class='shield'>" + rounded(game.player.ship.shield.points / game.player.ship.shield.points_max * 100) + "%</td><td class='hull'>" + rounded(game.player.ship.hull / game.player.ship.hull_max * 100) + "%</td><td class='generator'>" + rounded(game.player.ship.generator / game.player.ship.generator_max * 100) + "%</td></tr>"
            + "<tr><td class='bars' colspan=4>"
            + "<div class='bar_shield_bg'>"
            + "<div class='bar_shield' style='width: " + (game.player.ship.shield.points / game.player.ship.shield.points_max * 100) + "%'></div>"
            + "</div>"
            + "<div class='bar_hull_bg'>"
            + "<div class='bar_hull' style='width: " + (game.player.ship.hull / game.player.ship.hull_max * 100) + "%'></div>"
            + "</div>"
            + "<div class='bar_generator_bg'>"
            + "<div class='bar_generator' style='width: " + (game.player.ship.generator / game.player.ship.generator_max * 100) + "%'></div>"
            + "</div>"
            + "</td></tr>"
            + "</table>";
            infobox.innerHTML = html;
        }
    }

    setInterval(update_infobox, 100);
}

//----------------------------------------------------------------------------------------------------

// Creates a new HTML dialog
game.Dialog = function(type, data)
{
    audio_play_sound(game.sounds["snd_gui_open"]);

    var d = document.createElement("div");
    document.body.appendChild(d);

    d.onclick = function() { game.canvas.focus() };
    d.oncontextmenu = function() { game.canvas.focus(); return false; }

    d.id = type;
    d.className = "dialog";

    d.style.left = "150px";
    d.style.top = "100px";

    d.style.width = "300px";

    d.innerHTML    = "<div class='dialog_title'><button class='close' onclick='this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode); audio_play_sound(game.sounds[\"snd_gui_close\"]);'>x</button><b>" + string("dialog_" + type) + "</b></div>"

    if (type === "pilot")
    {
        d.className += " pilot";

        d.style.width = "420px";

        var update = function()
        {
            alliance = "alliance";
            d.innerHTML     = "<div class='dialog_title'><button class='close' onclick='this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode); audio_play_sound(game.sprites[\"snd_gui_close\"]);'>x</button><b>" + string("dialog_" + type) + "</b></div>"
                            + "<div class='dialog_content'>"
                            + "<div id='pilot'>"
                            + "<img src='images/spr_portrait.png'>"
                            + "<br><button onclick='audio_play_sound(game.sounds[\"snd_gui_open\"]); game.setPlayername();'>" + string("dialog_name_change") + "</button>"
                            + "<p>"
                            + "<div class='dialog_box_title'>" + string("dialog_description") + "</div>"
                            + "<textarea placeholder='Hier kann man irgendwas reinschreiben. Blablablabla z.B.'></textarea>"
                            + "<button onclick='audio_play_sound(game.sounds[\"snd_gui_open\"]);'>" + string("dialog_save") + "</button><button onclick='audio_play_sound(game.sounds[\"snd_gui_open)\"];'>" + string("dialog_reset") + "</button>"
                            + "<p>"
                            + "</div>"
                            + "<div id='pilot_data'>"
                            + gui_datablock("pilot_general", game.player.ship)

                            + "<p>"

                            + gui_datablock("pilot_titles", game.player.ship)

                            + "<p>"

                            + gui_datablock("pilot_statistics", game.player.ship)

                            + "</div>"
                            + "</div>"
                            + "<div class='dialog_bottom'>"
                            + "<button onclick='audio_play_sound(game.sounds[\"snd_gui_open\"]); game.setAlliance();'>" + string("dialog_alliance") + "</button>"
                             + gui_button("close")
                            + "</div>"
                            + "</div>"
        }
    update();
    setInterval(update, 1000);
    }

    else if (type === "ship")
    {
        d.className += " ship";

        d.style.width = "320px";

        var update = function()
        {
            d.innerHTML     = "<div class='dialog_title'><button class='close' onclick='this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode); audio_play_sound(game.sounds[\"snd_gui_close\"]);'>x</button><b>" + string("dialog_" + type) + "</b></div>"
                            + "<div class='dialog_content'>"
                            + "<div class='dialog_box_title'>" + string("sidebar_pilot") + ": " + game.player.ship.name + "</div>"
                            + "<div class='dialog_box_content'>"
                            + string("dialog_flytime") + ": " + show_time(game.player.flight_time)
                            + "<br>" + string("dialog_location") + ": " + game.current.sector.name
                            + "<br>ID: " + game.player.ship.uid
                            + "</div>"
                            + gui_datablock("ship_general", game.player.ship.guid)
                            + "<p>"
                            + gui_datablock("ship_turrets", game.player.ship.guid)
                            + "<p>"
                            + gui_datablock("ship_details", game.player.ship.guid)
                            + "</div>"
                            + "<div class='dialog_bottom'>"
                            + gui_button("close")
                            + "</div>"
                            + "</div>"
        }
    update();
    setInterval(update, 500);
    }

    else if (type === "cargo_hold")
    {
        d.className += " cargo_hold";

        d.style.width = "224px";

        var update = function()
        {
            // Create box grid
            var grid = "";
            for (var i = 0; i < 18; i++)
            {
                grid += "<div class='cargo_box'></div>"
            }

            d.innerHTML = "<div class='dialog_title'><button class='close' onclick='this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode); audio_play_sound(game.sounds[\"snd_gui_close\"]);'>x</button><b>" + string("dialog_" + type) + "</b></div>"
                    + "<div class='dialog_content'>"
                    + "<div id='cargo_hold_content'>"
                    + grid
                    + "</div>"
                    + "</div>";

            // Push items in an array
            var cargo_array = [];
            var cargo_count = 0;
            for (var i in game.player.ship.cargo.container)
            {
                cargo_array[cargo_count] = game.player.ship.cargo.container[i];
                cargo_array[cargo_count].name = i;
                cargo_count += 1;
            }

            // Put item data into cargo hold boxes
            var cargo_boxes = document.getElementById("cargo_hold_content").getElementsByClassName("cargo_box");

            var n = 0;
            for (let item of cargo_array)
            {
                var box = cargo_boxes[n];
                var sprite = game.db.items[item.name].sprite;

                box.innerHTML = "<div class='content' style='background-image: url(images/" + sprite + ".png)'><font>" + item.quantity + "</font></div>";
                box.onmouseover = function() { change_tooltip(string("item_" + item.name), string("dialog_cargo_amount") + ": " + item.quantity) }
                box.onmouseleave = function() { close_tooltip() }
                box.oncontextmenu = function()
                {
                    game.canvas.focus();
                    if (game.player.ship.mspeed === 0)
                    {
                        drop_item(game.player.ship, item.name, 1);
                    }
                }
                n++;
            }
        }
        update();
        setInterval(update, 500);
    }

    else if (type === "hangar")
    {
        d.style.width = "570px";

        var update = function()
        {
            d.innerHTML     = "<div class='dialog_title'><button class='close' onclick='this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode); audio_play_sound(game.sounds[\"snd_gui_close\"]);'>x</button><b>" + string("dialog_" + type) + "</b></div>"
                            + "<div class='dialog_content'>"
                            + "<div id='ship'>"
                            + "<img style='width: 320px' src='images/spr_ship_" + game.db.ships[game.player.ship.ship].general.class+".png'>"
                            + "</div>"
                            + "<div id='ship_data'>"
                            + "<div class='dialog_box_title'>" + string("dialog_general") + "</div>"
                            + gui_datablock("ship_general", game.player.ship.guid)

                            + "<p>"

                            + gui_datablock("ship_turrets", game.player.ship.guid)

                            + "<p>"
                            + gui_datablock("ship_details", game.player.ship.guid)

                            + "</div>"
                            + "</div>"
                            + "<div class='dialog_bottom'>"
                            + gui_button("close")
                            + "</div>"
                            + "</div>"
        }
    update();
    setInterval(update, 5000);
    }

    else if (type === "alliance")
    {

        var update = function()
        {
            d.innerHTML     = "<div class='dialog_title'><button class='close' onclick='this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode); audio_play_sound(game.sounds[\"snd_gui_close\"]);'>x</button><b>" + string("dialog_" + type) + "</b></div>"
                            + "<div class='dialog_content'>"
                            + "<div class='dialog_box_title'>Allgemein</div>"
                            + "<div class='dialog_box_content' id='player'>"
                            + "Name: " + game.player.ship.alliance
                            + "<br>" + string("dialog_founder") + ": " + game.player.ship.name
                            + "<br>Credits: " + money(game.player.credits) + " Cr"
                            + "</div>"

                            + "<p>"

                            + "<div class='dialog_box_title'>" + string("dialog_members") + " (1)</div>"
                            + "<div class='dialog_box_content'>"
                            + game.player.ship.name
                            + "</div>"
                            + "</div>"
                            + "<div class='dialog_bottom'>"
                            + gui_button("close")
                            + "</div>"
                            + "</div>"
        }
    update();
    setInterval(update, 1000);
    }

    else if (type === "mission")
    {

        d.className += " mission";

        var update = function()
        {
            d.innerHTML     = "<div class='dialog_title'><button class='close' onclick='this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode); audio_play_sound(game.sounds[\"snd_gui_close\"]);'>x</button><b>" + string("dialog_" + type) + "</b></div>"
                            + "<div class='dialog_content'>"
                            + "<div class='dialog_box_title'>" + string("dialog_description") + "</div>"
                            + "<div class='dialog_box_content'>"
                            + "Hallo Pilot! Wir könnten deine Hilfe gebrauchen. Ein paar schwächere Schiffe der <font color='red'><b>Xenon</b></font> sind in diesen Sektor eingedrungen. Sie stellen keine Bedrohung dar, allerdings irritieren sie neue Piloten."
                            + "</div>"

                            + "<p>"

                            + "<div class='dialog_box_title'>" + string("dialog_objective") + "</div>"
                            + "<div class='dialog_box_content'>"
                            + "Vernichte 10 <font color='red'><b>Xenon N</b></font>"
                            + "</div>"
                            + "<p>"

                            + "<div class='dialog_box_title'>" + string("dialog_reward") + "</div>"
                            + "<div class='dialog_box_content reward'>"
                            + "<img src='images/spr_item_ore.png'>" + " 10"
                            + " <img src='images/spr_credits.png'>" + " " + money(500)
                            + "</div>"
                            + "</div>"
                            + "<div class='dialog_bottom'>"
                            + "<button onclick='this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode); audio_play_sound(game.sounds[\"snd_gui_open\"]);'>" + string("dialog_accept") + "</button><button onclick='this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode); audio_play_sound(game.sounds[\"snd_gui_close\"]);'>" + string("dialog_later") + "</button>"
                            + "</div>"
                            + "</div>"
        }
    update();
    setInterval(update, 1000);
    }

    else if (type === "sector")
    {
        d.className += " sector";
        d.style.width = "720px";
        d.timers = {};

        var update = function()
        {
            var stuff = "";

            // Player ships
            stuff += "<div class='dialog_box_content'>"
                   + "<table>"

            for (var i = 0; i < game.entities.ships.length; i++)
            {
                var ship = game.entities.ships[i];
                if (ship === game.player.ship)
                {
                    stuff += "<tr class='you'><td class='icon'><img src=images/spr_map_ship_m" + game.db.ships[ship.ship].general.class + ".png></td><td class='name'>" + ship.name + "</td><td class='id'>" + ship.uid + "</td><td class='hull'>" + rounded(ship.hull / ship.hull_max * 100) + "%</td></tr>";
                }
            }

            stuff += "</table>"
                   + "</div>";

            // Enemy ships
            stuff += "<div class='dialog_box_content'>"
                   + "<table>"

            for (var i = 0; i < game.entities.ships.length; i++)
            {
                var ship = game.entities.ships[i];
                if (ship !== game.player.ship)
                {
                    stuff += "<tr class='ship'><td class='icon'><img src=images/spr_map_ship_m" + game.db.ships[ship.ship].general.class + ".png></td><td class='name'>" + ship.name + "</td><td class='id'>" + ship.uid + "</td><td class='hull'>" + rounded(ship.hull / ship.hull_max * 100) + "%</td></tr>";
                }
            }

            stuff += "</table>"
                   + "</div>";

            // Stations
            stuff += "<div class='dialog_box_content'>"
                   + "<table>"

            for (var station of game.entities.stations)
            {
                stuff += "<tr id='player'><td class='icon'><img src=images/spr_map_station.png></td><td class='name'>" + station.name + "</td><td class='id'>" + station.uid + "</td><td class='hull'></td></tr>";
            }

            stuff += "</table>"
                   + "</div>";

            d.innerHTML     = "<div class='dialog_title'><button class='close' onclick='this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode); audio_play_sound(game.sounds[\"snd_gui_close\"]);'>x</button><b>" + string("dialog_" + type) + " (" + string(game.current.sector.name) + ")</b></div>"
                            + "<div class='dialog_content'>"
                            + "<div id='sectormap'></div>"
                            + "<div id='sectormap_buttons'>"
                            + "<button onclick='' audio_play_sound(game.sounds[\"snd_gui_open\"]);'>"+string("dialog_sector_everything")+"</button>"
                            + "<button onclick='' audio_play_sound(game.sounds[\"snd_gui_open\"]);'>"+string("dialog_sector_ships")+"</button>"
                            + "<button onclick='' audio_play_sound(game.sounds[\"snd_gui_open\"]);'>"+string("dialog_sector_stations")+"</button>"
                            + "<button onclick='' audio_play_sound(game.sounds[\"snd_gui_open\"]);'>"+string("dialog_sector_wares")+"</button>"
                            + "</div>"
                            + "<div id='sectormap_list'>"
                            + stuff
                            + "</div>"
                            + "</div>"
                            + "</div>";
        }
    update();
    setInterval(update, 500);
    }

    else if (type === "galaxy")
    {
        d.className += " galaxy";
        d.style.width = "380px";

        // Create table
        var sectors = "";
        for (var i = 0; i < 4; i++) sectors += "<tr><td></td><td></td><td></td><td></td><td></td></tr>\n"

        d.innerHTML   += "<div class='dialog_content'>"
                            + "<div class='dialog_box_title'>" + string("dialog_galaxy_desc") + "</div>"

                            + "<table id='galaxy_map'>"
                            + sectors
                            + "</table>"
                            + "</div>"
                            + "<div class='dialog_bottom'>"
                            + gui_button("close")
                            + "</div>";

        // Read sectors from database
        var galaxy = [];
        for (var i in game.db.sectors)
        {
            var sector = game.db.sectors[i];

            if (! galaxy[sector.y]) galaxy[sector.y] = [];
            if (! galaxy[sector.y][sector.x]) galaxy[sector.y][sector.x] = [];

            galaxy[sector.y][sector.x] = sector;
        }

        // Put sectors into the map
        var table = document.getElementById("galaxy_map");
        for (let y = 0; y < table.rows.length; y++)
        {
            var row = table.rows[y];

            for (let x = 0; x < row.cells.length; x++)
            {
                var cell = row.cells[x];
                if (galaxy[y][x])
                {
                    var sector = galaxy[y][x];

                    // Add gate connections
                    if (sector.gates)
                    {
                        if (sector.gates.east) cell.innerHTML  += "<div class='gate gate_o'></div>";
                        else if (sector.gates.south) cell.innerHTML += "<div class='gate gate_s'></div>";
                        else if (sector.gates.west) cell.innerHTML  += "<div class='gate gate_w'></div>";
                        else if (sector.gates.north) cell.innerHTML += "<div class='gate gate_n'></div>";
                    }

                    // Mark sector if player is in
                    if (sector === game.current.sector)
                    {
                        cell.id = "you";
                        cell.onmouseover = function() { change_tooltip(string(sector.name), string("dialog_galaxy_you")); }
                    }
                    else
                    {
                        cell.onmouseover = function() { change_tooltip(string(sector.name), ""); }
                    }
                    cell.onmouseleave = function() { close_tooltip() }

                    cell.innerHTML += string(sector.name);
                }
            }
        }
    }

    else if (type === "encyclopedia")
    {
        d.className += " encyclopedia";

        d.style.width = "512px";

        var _number = 0;
        var _items = "";

        for (var i in game.db.items)
        {
            _items += "<tr><td>" + _number + "</td><td>" + game.db.items[i].type + "</td><td><img src=images/spr_item_" + game.db.items[i].token + ".png></td><td>" + string("item_" + game.db.items[i].token) + "</td><td>" + game.db.items[i].class + "</td><td>" + game.db.items[i].size + "</td><td>" + money(game.db.items[i].price) + " Cr</td></tr>";
            _number++
        }

        d.innerHTML += "<div class='dialog_content'>"
                     + "<table style='width: 100%; border-collapse: collapse;'>"
                     + "<tr class='dialog_box_title'><td>ID</td><td>Type</td><td>Sprite</td><td>Name</td><td>Class</td><td>Size</td><td>Price Ø</td></tr>"
                     + _items
                     + "<tr class='dialog_box_title'><td>ID</td><td>Type</td><td>Sprite</td><td>Name</td><td>Class</td><td>Size</td><td>Price Ø</td></tr>"
                     + "</table>"
                     + "</div>"
                     + "</div>"
                     + "<div class='dialog_bottom'>"
                     + gui_button("close")
                     + "</div>"
    }

    else if (type === "settings")
    {
        d.className += " settings";

        welcome = "welcome";
        d.innerHTML   += "<div class='dialog_content'>"
                            + "<table style='width: 100%; border-collapse: collapse;'>"
                            + "<tr class='dialog_box_title'><td>" + string("settings_general") + "</td><td></td><td>" + string("settings_indicator") + "</td></tr>"
                            + "<tr><td><input type='checkbox'>" + string("settings_general_names") + "</td><td></td><td><input type='checkbox'>" + string("settings_indicator_ships") + "</td></tr>"
                            + "<tr><td><input type='checkbox'>" + string("settings_general_hulls") + "</td><td></td><td><input type='checkbox'>" + string("settings_indicator_stations") + "</td></tr>"
                            + "<tr><td><input type='checkbox'>" + string("settings_general_particles") + "</td><td></td><td><input type='checkbox'>" + string("settings_indicator_gates") + "</td></tr>"
                            + "<tr><td></td><td></td><td><input type='checkbox'>" + string("settings_indicator_items") + "</td></tr>"
                            + "<tr><td>&nbsp;</td></tr>"
                            + "<tr class='dialog_box_title'><td>" + string("settings_audio") + "</td><td></td><td>" + string("settings_language") + "</td></tr>"
                            + "<tr><td><input type='checkbox'>" + string("settings_audio_music") + "</td><td></td><td><input type='radio'>" + string("settings_language_en") + "</td></tr>"
                            + "<tr><td><input type='checkbox'>" + string("settings_audio_sounds") + "</td><td></td><td><input type='radio'>" + string("settings_language_de") + "</td></tr>"
                            + "<tr><td>&nbsp;</td></tr>"
                            + "<tr class='dialog_box_title'><td>Chat</td><td></td><td></td></tr>"
                            + "<tr><td><input type='checkbox'> Emoticons</td></tr>"
                            + "</table>"
                            + "</div>"
                            + "</div>"
                            + "<div class='dialog_bottom'>"
                            + "<button onclick='this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode); new game.Dialog(" + welcome + ")'>" + string("welcome_open") + "</button>" + gui_button("close")
                            + "</div>"
    }

    else if (type === "welcome")
    {
        d.className += " welcome";
        d.style.width = "400px";

        d.innerHTML   += "<div class='dialog_content'>"
                            + "<table width='100%' style='border-collapse:collapse'>"
                            + "<tr><td align='center' colspan='3'>" + string("welcome_text_top") + "</td></tr>"
                            + "<tr class='dialog_box_title'><td align='center' colspan='3'>" + string("welcome_text_top2") + "</td></tr>"
                            + "<tr><td>" + string("welcome_flying") + "</td><td></td><td>" + string("welcome_screens") + "</td></tr>"
                            + "<tr><td>" + string("welcome_firing") + "</td><td></td><td>" + string("welcome_screens_pilot") + "</td></tr>"
                            + "<tr><td>" + string("welcome_rockets") + "</td><td></td><td>" + string("welcome_screens_ship") + "</td></tr>"
                            + "<tr><td>" + string("welcome_chat") + "</td><td></td><td>" + string("welcome_screens_cargo") + "</td></tr>"
                            + "<tr><td>" + string("welcome_station_contact") + "</td><td></td><td>" + string("welcome_screens_sector") + "</td></tr>"
                            + "<tr><td>" + string("welcome_station_trade") + "</td><td></td><td>" + string("welcome_screens_galaxy") + "</td></tr>"
                            + "<tr><td>" + string("welcome_station_trade2") + "</td><td></td><td>" + string("welcome_screens_settings") + "</td></tr>"
                            + "<tr><td align='center' colspan='3'>" + string("welcome_tip") + "</td></tr>"
                            + "<tr><td align='center' colspan='3'>" + string("welcome_tip2") + "</td></tr>"
                            + "</table>"
                            + "</div>"
                            + "</div>"
                            + "<div class='dialog_bottom'>"
                            + "<button onclick='if (! game.settings.welcome) { game.settings.welcome = true } else { game.settings.welcome = false } audio_play_sound(game.sounds[\"snd_gui_close\"]);'>" + string("welcome_show") + gui_button("close");
                            + "</div>"
    }

    else if (type === "logout")
    {
        d.className += " logout";

        d.innerHTML   += "<div class='dialog_content'>"
                            + "<div class='dialog_box_content'>"
                            + string("dialog_logout_question")
                            + "</div>"
                            + "</div>"
                            + "<div class='dialog_bottom'>"
                            + "<button onclick='this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode); socket.disconnect(); audio_play_sound(game.sounds[\"snd_gui_open\"]);'>" + string("dialog_yes") + "</button><button onclick='this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode); audio_play_sound(game.sounds[\"snd_gui_close\"]);'>" + string("dialog_no") + "</button>"
                            + "</div>"
    }

    else
    {
        d.innerHTML    = "<div class='dialog_title'><button class='close' onclick='this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode); audio_play_sound(game.sounds[\"snd_gui_close\"]);'>x</button><b>???</b></div>"
                            + "<div class='dialog_content'>"
                            + "???"
                            + "</div>"
    }

    d.innerHTML += "</div>"
}

// Inserts a button in a HTML dialog
function gui_button(type)
{
    switch (type)
    {
        case "close":
        default: return "<button onclick='this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode); audio_play_sound(game.sounds[\"snd_gui_close\"]);'>" + string("dialog_close") + "</button>"; break;
    }
}

// Inserts a whole data block (with content div)
function gui_datablock(type, id)
{
    switch (type)
    {
        case "pilot_general":
        {
            return "<div class='dialog_box_title'><font>" + string("dialog_general") + "</font></div>"
                 + "<div class='dialog_box_content' class='player'>"
                 + "Name: " + game.player.ship.name
                 + "<br>" + string("dialog_alliance") + ": <a onclick='this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode); new game.Dialog("+alliance+")'>" + game.player.ship.alliance + "</a>"
                 + "<br>Credits: " + money(game.player.credits) + " Cr"
                 + "<br>" + string("dialog_location") + ": " + string(game.current.sector.name)
                 + "<br>" + string("dialog_playtime") + ": " + show_time(game.player.game_time)
                 + "</div>"
        } break;

        case "pilot_titles":
        {
            return "<div class='dialog_box_title'>" + string("dialog_titles") + "</div>"
                 + "<div class='dialog_box_content'>"
                 + game.player.traderank + " (" + game.player.tradepoints + " " + string("dialog_tradepoints") + ")"
                 + "<br>" + game.player.fightrank + " (" + game.player.fightpoints + " " + string("dialog_fightpoints") + ")"
                 + "</div>"
        } break;

        case "pilot_statistics":
        {
            return "<div class='dialog_box_title'>" + string("dialog_statistics") + "</div>"
                 + "<div class='dialog_box_content'>"
                 + string("dialog_fired") + " " + string("dialog_shots") + ": " + game.player.shots_fired
                 + "<br>" + string("dialog_fired") + " " + string("dialog_rockets") + ": " + game.player.rockets_fired
                 + "<br>" + string("dialog_accuracy") + " " + string("dialog_shots") + ": " + rounded2(game.player.shots_hit / game.player.shots_fired * 100) + " % "
                 + "<br>" + string("dialog_accuracy") + " " + string("dialog_rockets") + ": " + rounded2(game.player.rockets_hit / game.player.rockets_fired * 100) + " % "
                 + "<br>" + string("dialog_distance") + ": " + rounded2(game.player.traveled_distance) + " km"
                 + "<br>" + string("dialog_gates") + ": " + game.player.passed_gates
                 + "</div>"
        } break;

        case "ship_general":
        {
            return "<div class='dialog_box_content'>"
                + string("dialog_shield") + ": " + rounded(game.player.ship.shield.points) + " / " + game.player.ship.shield.points_max + " (" + rounded(game.player.ship.shield.points / game.player.ship.shield.points_max * 100) + " %)"
                + "<br>" + string("dialog_hull") + ": " + rounded(game.player.ship.hull) + " / " + game.player.ship.hull_max + " (" + rounded(game.player.ship.hull / game.player.ship.hull_max * 100) + " %)"
                + "<br>" + string("dialog_weapons") + ": " + rounded(game.player.ship.generator) + " / " + game.player.ship.generator_max + " (" + rounded(game.player.ship.generator / game.player.ship.generator_max * 100) + " %)"
                + "<br>" + string("dialog_speed") + ": " + rounded(game.player.ship.mspeed) + " m/s"
                + "<br>" + string("dialog_freight") + ": 0 / " + game.player.ship.cargo.size + " " + string("dialog_units")
                + "</div>"
        } break;

        case "ship_turrets":
        {
            // Get ship turrets
            var turrets = "";
            for (var i = 0; i < game.player.ship.turrets.length; i++)
            {
                if (game.player.ship.turrets[i].type !== null)
                {
                    turrets += string("item_" + game.player.ship.turrets[i].type) + "<br>";
                }
            }

            return "<div class='dialog_box_title'>" + string("dialog_turrets") + "</div>"
                 + "<div class='dialog_box_content'>"
                 + turrets
                 + "</div>"
        } break;

        case "ship_details":
        {

            return "<div class='dialog_box_title'>" + string("dialog_details") + "</div>"
                 + "<div class='dialog_box_content'>"
                 + string("dialog_maxspeed") + ": " + game.player.ship.mspd + " m/s (" + string("dialog_upgradeable") + " " + game.player.ship.mspd_max + " m/s)"
                 + "<br>" + string("dialog_acceleration") + ": " + game.player.ship.mspd/10 + " m/s² (" + string("dialog_upgradeable") + " " + game.player.ship.mspd_max/10 + " m/s²)" 
                 + "<br>" + string("dialog_mobility") + ": " + game.player.ship.steer + " % (" + string("dialog_upgradeable") + " " + game.player.ship.steer_max + " %)"
                 + "</div>"

                 + "<div class='dialog_box_content'>"
                 + string("dialog_cargohold") + ": " + game.player.ship.cargo.size + " " + string("dialog_units") + " (" + string("dialog_upgradeable") + " " + game.player.ship.cargo.size_max + " " + string("dialog_units") + ")"
                 + "<br>" + string("dialog_cargoclass") + ": " + game.player.ship.cargo.name
                 + "</div>"

                 + "<div class='dialog_box_content'>"
                 + string("dialog_turrets") + ": " + Object.keys(game.db.ships[game.player.ship.ship].weapons.slots).length
                 + "<br>" + string("dialog_maxshield") + ": " + string("item_" + game.db.ships[game.player.ship.ship].shields.compatible[Object.keys(game.db.ships[game.player.ship.ship].shields.compatible).length-1])
                 + "</div>"
        } break;
    }
}

//----------------------------------------------------------------------------------------------------

// Tooltip following the mouse
var tooltip = document.getElementById('tooltip');
window.onmousemove = function(e)
{
    tooltip.style.left = game.mouse.x + 'px';
    tooltip.style.top = game.mouse.y + 'px';
};

// Change content of tooltip
change_tooltip = function(title, content)
{
    tooltip.style.opacity = 0.67;
    tooltip.innerHTML = "<font class='tooltip'>" + title + "</font>";
    if (content) tooltip.innerHTML += "<br><br><font class='tooltip_desc'>" + content + "</font>"
}

close_tooltip = function() { tooltip.style.opacity = 0; }

// Sidebar
for (i = 0; i < document.getElementsByClassName('sidebar_button').length; i++)
{
    document.getElementsByClassName('sidebar_button')[i].onmouseleave = function() { close_tooltip() }
    document.getElementById('portrait').onmouseleave = function() { close_tooltip() }
}

document.getElementById('portrait').onclick = function() { new game.Dialog("pilot"); }

document.getElementById('sidebar_ship').onclick = function() { new game.Dialog("ship"); }

document.getElementById('sidebar_cargo').onclick = function() { new game.Dialog("cargo_hold"); }
//document.getElementById('sidebar_cargo').onclick = function() { if (! inventory) { inventory = true; audio_play_sound(game.sounds[\"snd_gui_open\"]); } else { inventory = false; audio_play_sound(game.sounds[\"snd_gui_close\"]); } }

document.getElementById('sidebar_mission').onclick = function() { new game.Dialog("mission"); }
document.getElementById('sidebar_sector').onclick = function() { new game.Dialog("sector"); }
document.getElementById('sidebar_galaxy').onclick = function() { new game.Dialog("galaxy"); }

document.getElementById('sidebar_settings').onclick = function() { new game.Dialog("settings"); }
document.getElementById('sidebar_logout').onclick = function() { new game.Dialog("logout"); }

document.getElementById('portrait').onmouseover = function() { change_tooltip(string("sidebar_pilot"), string("sidebar_pilot_desc")); }
document.getElementById('sidebar_mission').onmouseover = function() { change_tooltip(string("sidebar_mission"), string("sidebar_mission_desc")); }
document.getElementById('sidebar_ship').onmouseover = function() { change_tooltip(string("sidebar_ship"), string("sidebar_ship_desc")); }
document.getElementById('sidebar_cargo').onmouseover = function() { change_tooltip(string("sidebar_cargo"), string("sidebar_cargo_desc")); }
document.getElementById('sidebar_sector').onmouseover = function() { change_tooltip(string("sidebar_sector"), string("sidebar_sector_desc")); }
document.getElementById('sidebar_galaxy').onmouseover = function() { change_tooltip(string("sidebar_galaxy"), string("sidebar_galaxy_desc")); }

document.getElementById('sidebar_settings').onmouseover = function() { change_tooltip(string("sidebar_settings"), string("sidebar_settings_desc")); }
document.getElementById('sidebar_logout').onmouseover = function() { change_tooltip(string("sidebar_logout"), string("sidebar_logout_desc")); }

// Minimap buttons
for (i = 0; i < document.getElementsByClassName('minimap_button').length; i++)
{
    document.getElementsByClassName('minimap_button')[i].onmouseleave = function() { close_tooltip() }
}

document.getElementById('minimap_ships').onmouseover = function() { change_tooltip(string("minimap_ships"), string("minimap_button")); }
document.getElementById('minimap_stations').onmouseover = function() { change_tooltip(string("minimap_stations"), string("minimap_button")); }
document.getElementById('minimap_asteroids').onmouseover = function() { change_tooltip(string("minimap_asteroids"), string("minimap_button")); }
document.getElementById('minimap_items').onmouseover = function() { change_tooltip(string("minimap_items"), string("minimap_button")); }

// Test: Equipment screen
function shipEquipment()
{
    if (document.getElementsByClassName('shipEquipment')[0] === undefined)
    {
        var div = document.createElement('div');
        document.getElementById('gui').appendChild(div);
        div.className = 'shipEquipment';

        var c = '';
        for (var i in game.player.ship.cargo.container)
        {
            var g = game.player.ship.cargo.container[i];
            var dbG = game.db.items[i];

            if (dbG.type === 'gun')
            {
                c += '<button data-gun="' + dbG.token + '">' + i.toUpperCase() + '</button>';
            }
        }

        var t = '<table class="weapons">';
        for (let turret of game.player.ship.turrets)
        {
            t += '<tr>'
            + '<td class="eqType">'

            if (turret.type !== null)
            {
                t += turret.type.toUpperCase();
            }
            else
            {
                t += '- Leer -';
            }

            t += '<td>'
            + '<td class="eqChoose">'
            + c
            + '</td>'
            + '</tr>';
        }
        t += '</table>';

        div.innerHTML = ''
        + '<h2>Equipment</h2>'
        + t;

        var chooseFields = div.getElementsByClassName('weapons')[0].getElementsByClassName('eqChoose');
        for (let i = 0; i < chooseFields.length; i++)
        {
            var buttons = chooseFields[i].getElementsByTagName('button');
            for (let b of buttons)
            {
                b.onclick = function()
                {
                    console.log(i);
                    console.log(b.dataset['gun']);
                    console.log(this.dataset['gun']);

                    set_weapon(game.player.ship, i, b.dataset.gun);
                };
            }
        }
        console.log(div);    
    }
    else
    {
        var n = document.getElementsByClassName('shipEquipment')[0];
        document.getElementById('gui').removeChild(n);
    }
}

// Test: Equipment screen
function sectorMap()
{
    if (document.getElementsByClassName('sectorMap')[0] === undefined)
    {
        var div = document.createElement('div');
        document.getElementById('gui').appendChild(div);
        div.className = 'sectorMap';

        let html = '<h2>Sector map</h2>'
        + 'Ships'
        + '<table>';

        let _ships = [];

        var i = game.entities.ships.length;
        while (i--)
        {
            if (point_distance(game.player.ship.x, game.player.ship.y, game.entities.ships[i].x, game.entities.ships[i].y) <= game.player.ship.gravidar)
            {
                _ships.push(game.entities.ships[i]);
            }
        }
        _ships.sort(function(a, b)
        {
            let c1 = game.db.ships[a.ship].general.class;
            let c2 = game.db.ships[b.ship].general.class;
            return c2 - c1;
        });

        for (let s of _ships)
        {
            let icon = game.db.ships[s.ship].sprites.map;
            if (s === game.player.ship)
            {
                icon += '_you';
            }

            let n = s.name;
            if (s.alliance !== null)
            {
                n = '<font class="alliance">[' + s.alliance + ']</font> ' + n;
            }

            html += '<tr>'
            + '<td class="icon">'
            + '<img src="images/' + icon + '.png">'
            + '</td>'
            + '<td class="name">'
            + n
            + '</td>'
            + '<td class="id">'
            + s.uid
            + '</td>'
            + '</tr>';
        }

        html += '</table>'
        + '<p>'
        + 'Stations'
        + '<table>';

        let _stations = [];

        var i = game.entities.stations.length;
        while (i--)
        {
            if (point_distance(game.player.ship.x, game.player.ship.y, game.entities.stations[i].x, game.entities.stations[i].y) <= game.player.ship.gravidar
                || game.entities.stations[i].seen === true)
            {
                _stations.push(game.entities.stations[i]);
            }
        }
        _stations.sort(function(a, b)
        {
        });

        for (let s of _stations)
        {
            let icon = game.db.stations[s.type].sprite_minimap;
            let n = s.name;

            html += '<tr>'
            + '<td class="icon">'
            + '<img src="images/' + icon + '.png">'
            + '</td>'
            + '<td class="name">'
            + n
            + '</td>'
            + '<td class="id">'
            + s.uid
            + '</td>'
            + '</tr>';
        }

        html += '</table>';

        div.innerHTML = html;
    }
    else
    {
        var n = document.getElementsByClassName('sectorMap')[0];
        document.getElementById('gui').removeChild(n);
    }
}
