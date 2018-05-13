function patrolShip()
{
    let n = 1;
    for (let i = 0; i < 50; i++)
    {
        setTimeout(function()
        {
            var newShip = new game.Ship(
            {
                "x": 0,
                "y": 0,
                "ship": "n",
                "race": "terran",
                "name": "Terran patrol",
                "computer": true,
                "waypoints":
                [
                    { x: 3500, y: -1000, w: 10 },
                    { x: 3500, y: 1000, w: 10 }
                ]
            });
            newShip.command = "patrol";
        }, n * 500);
        n++;
    }
    //return newShip;
}

// Checks if all languages contain the same amount of strings
function compareLanguages()
{
    let l = [];

    for (let i in game.db.strings.de)
    {
        let deString = i;

        game.language = "en";
        string(deString);
    }
}

//----------------------------------------------------------------------------------------------------

var pi = Math.PI;
var pi180 = Math.PI/180;
var pi180r = 180/Math.PI; // r = reversed

// Returns the direction between point (x1,y1) and point (x2,y2) in degrees
function point_direction(x1, y1, x2, y2)
{
    return Math.atan2(y2 - y1, x2 - x1) * pi180r;
}

//----------------------------------------------------------------------------------------------------

// Returns the distance between vector (x1, y1) and vector (x2, y2)
function point_distance(x1, y1, x2, y2)
{
    return Math.hypot(x2 - x1, y2 - y1);
}

// Simple circle collision detection
function collideCircle(a, b)
{
    let x = a.x - b.x;
    let y = a.y - b.y;
    let r = (a.w / 2) + (b.w / 2)
    return (x * x) + (y * y) < (r * r);
}

//----------------------------------------------------------------------------------------------------

// Returns the x/y position with distance and direction
function lengthdir_x(dist, dir) { return dist * Math.cos(dir * pi180) }
function lengthdir_y(dist, dir) { return dist * Math.sin(dir * pi180) }

//----------------------------------------------------------------------------------------------------

// Rounds a number faster than Math.round
function rounded(number) { return (0.5 + number) << 0; }

// Rounds a number with 1 digit behind the comma
function rounded2(number) { return Math.floor(number * 10) / 10; }

//----------------------------------------------------------------------------------------------------

// Generate a randum number between min and max, including min and max
function irandom_range(min, max)
{
    if (min >= max) { return min }
    else { return min + rounded(Math.random() * (max - min)) }
}

// Generate a randum number from 0 to max, including max
function irandom(max)
{
    if (max === 0) { return max }
    else { return rounded(Math.random() * max) }
}

//----------------------------------------------------------------------------------------------------

// Adds the thousands seperator to money
function money(value) { return value.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1 ") }

//----------------------------------------------------------------------------------------------------

// Returns a string
function string(s)
{
    if (game.db.strings[game.language] !== undefined)
    {
        if (game.db.strings[game.language][s] !== undefined)
        {
            return game.db.strings[game.language][s];
        }
        else
        {
            console.log('String "' + s + '" doesn\'t exist in language "' + game.language + '".');
        }
    }
    else
    {
        console.log("Language \"" + game.language + "\" doesn't exist.");

        if (game.db.strings["en"] !== undefined)
        {
            if (game.db.strings["en"][s] !== undefined)
            {
                return game.db.strings["en"][s];
            }
        }
        else return "";
    }
}

// Returns a string and dynamically replaces certain parameters with variables
function stringNew(html)
{
    var s = "Hallo {name:current}! Du fliegst ein {ship:current} und befindest dich gerade im Sektor {sector:current}. {sector:current.description} Relevent ist außerdem folgender Sektor: {sector:0-1}";
    let sReplace =
    {
        "{playername}": game.player.ship.name,
        "{playersector}": string(game.current.sector.name),
        "{playersectordescription}": string(game.current.sector.description),
        "{sector:0-1}": string(game.db.sectors['0-1'].name),
        "{playership}": game.db.ships[game.player.ship.ship].general.name
    }
    if (html)
    {
        sReplace =
        {
            "{playername}": '<b>' + game.player.ship.name + '</b>',
            "{playersector}": '<b>' + string(game.current.sector.name) + '</b>',
            "{playersectordescription}": '<b>' + string(game.current.sector.description) + '</b>',
            "{sector:0-1}": '<b>' + string(game.db.sectors['0-1'].name) + '</b>',
            "{playership}": '<b>' + game.db.ships[game.player.ship.ship].general.name + '</b>'
        }
    }
    for (let i in sReplace)
    {
        s = s.replace(new RegExp(i, "g"), sReplace[i]);
    }
    console.log(s);
}

//----------------------------------------------------------------------------------------------------

function display_time(timestamp)
{
    var a = new Date(timestamp);
    var months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    if (month < 10) month = "0" + month;
    var date = a.getDate();
    var hour = a.getHours();
    if (hour < 10) hour = "0" + hour;
    var min = a.getMinutes();
    if (min < 10) min = "0" + min;
    var sec = a.getSeconds();
    if (sec < 10) sec = "0" + sec;

    var time;
    if (game.language === "de") { time = date + '.' + month + '.' + year + ' ' + hour + ':' + min + ':' + sec }
    else { time = year + '-' + month + '-' + date + ' ' + hour + ':' + min + ':' + sec }
    return time;
 }

//----------------------------------------------------------------------------------------------------

// Find out array index of given player id
function id_get_index(id, array)
{
    let i = array.length;
    while (i--)
    {
        if (array[i].id === id)
        {
            return i;
        }
    }
}

//----------------------------------------------------------------------------------------------------

// Shows game and flight time
function show_time(seconds)
{
    var numdays = Math.floor(seconds / 86400);
    var numhours = Math.floor((seconds % 86400) / 3600);
    var numminutes = Math.floor(((seconds % 86400) % 3600) / 60);
    var numseconds = ((seconds % 86400) % 3600) % 60;

    if (numhours < 10) numhours = "0" + numhours;
    if (numminutes < 10) numminutes = "0" + numminutes;
    if (numseconds < 10) numseconds = "0" + numseconds;

    return numhours + ":" + numminutes + ":" + numseconds;
}

//----------------------------------------------------------------------------------------------------

// Checks if mouse is inside a box
function mouse_inside(x, y, w, h)
{
    let mx = game.mouse.x;
    let my = game.mouse.y;
    let cx = game.camera.x;
    let cy = game.camera.y;

    return mx + cx >= x
     && mx + cx <= x + w
     && my + cy >= y
     && my + cy <= y + h;
}

//----------------------------------------------------------------------------------------------------

// Chooses a random entry of specified arguments
function choose() { return arguments[~~(Math.random() * arguments.length)] }

//----------------------------------------------------------------------------------------------------

// Adds a new message to the chat log
function chat_message(text, color)
{
    if (! color) color = "white";
    chat_log.innerHTML += "<font color=" + color + ">" + text + "</font><br>";
    chat_log.scrollTop = chat_log.scrollHeight;
}

//----------------------------------------------------------------------------------------------------

// Returns the nearest object
game.getNearest = function(_this, _other)
{
    let _stored = [];
    let _compared = [];
    let x1 = _this.x;
    let y1 = _this.y;
    let i = _other.length;

    while (i--)
    {
        let o = _other[i];

        if (o !== _this && o.id !== _this.id)
        {
            _stored.push(o);

            let x2 = o.x;
            let y2 = o.y;
            let d = point_distance(x1, y1, x2, y2);
            _compared.push(d);
        }
    }

    let _smallest = Math.min(..._compared);
    return _stored[_compared.indexOf(_smallest)];
}

//----------------------------------------------------------------------------------------------------

// Checks if the object is inside the viewport of the player
game.camera.inside = function(o)
{
    let ox = o.x;
    let oy = o.y;
    let ow = o.w / 2;
    let oh = o.h / 2;

    let cx = game.camera.x;
    let cy = game.camera.y;
    let cw = game.camera.w;
    let ch = game.camera.h;

    return ox >= cx - ow
     && ox <= cx + cw + ow
     && oy >= cy - oh
     && oy <= cy + ch + oh;
}

//----------------------------------------------------------------------------------------------------

// Creates a random character
function random_character(n)
{
    if (n === undefined || n < 1) n = 1;
    let l = 'ABCDEFGHIJKLMNOPQURSTUVWXYZ';
    let c = '';

    while (n--)
    {
        c += l.substr(Math.floor(Math.random() * l.length), 1);
    }

    return c;
}

//----------------------------------------------------------------------------------------------------

// Cargo stuff

// Adds an item to ship's cargo hold
game.cargoAdd = function(obj, item, quantity, silent)
{
    let db = game.db.items[item];
    if (db !== undefined)
    {
        if (quantity > 0)
        {
            if (obj.cargo.hold + (db.size * quantity) <= obj.cargo.size)
            {
                if (item !== "credit" && db.type !== "data")
                {
                    // If item doesn't exist in cargo, create it
                    if (obj.cargo.container[item] === undefined)
                    {
                        obj.cargo.container[item] = { quantity: 0 }
                    }

                    // Add item
                    obj.cargo.container[item].quantity += quantity;

                    // Hold size up to date
                    obj.cargo.hold += db.size * quantity;
                }

                switch (item)
                {
                    case "credit":
                    {
                        game.creditsAdd(quantity);
                        break;
                    }
                    case "sim_scnr":
                    case "dup_scnr":
                    case "tri_scnr":
                    case "qua_scnr":
                    {
                        obj.gravidar = game.db.items[item].range;
                        break;
                    }
                }

                if (silent === undefined || silent === false)
                {
                    chat_message("+" + quantity + " " + string("item_" + db.token), game.color.cyan);
                }
            }
            else console.log('Can\'t add item "' + item + '" to ship: Cargo hold not big enough.');
        }
        else console.log('Can\'t add item "' + item + '" to ship: Quantity 0.');
    }
    else console.log('Can\'t add item "' + item + '" to ship: Doesn\'t exist.');
}

// Removes an item from ship's cargo hold
game.cargoRemove = function(obj, item, quantity, silent)
{
    let db = game.db.items[item];
    if (db !== undefined)
    {
        if (obj.cargo.container[item] !== undefined)
        {
            if (quantity > 0)
            {
                // Remove
                let iq = obj.cargo.container[item].quantity;
                if (iq - quantity <= 0)
                {
                    quantity = iq;
                }
                obj.cargo.container[item].quantity -= quantity;

                // If quantity of the item is now 0, delete it
                if (obj.cargo.container[item].quantity <= 0)
                {
                    delete obj.cargo.container[item];
                }

                // Hold size up to date
                obj.cargo.hold -= db.size * quantity;
                if (obj.cargo.hold < 0)
                {
                    obj.cargo.hold = 0;
                }

                if (silent !== true)
                {
                    chat_message(string("item_" + db.token) + " (" + quantity + ") " + string("ship_cargo_removed"), game.color.gray);
                }
            }
            else console.log('Can\'t remove item "' + item + '" from ship: Cargo hold doesn\'t contain it.');
        }
        else console.log('Can\'t remove item "' + item + '" from ship: Quantity 0');
    }
    else console.log('Can\'t remove item "' + item + '" from ship: Doesn\'t exist.');
}

// Counts how many of the given item you've got
game.cargoCount = function(item)
{
    if (game.db.items[item] !== undefined)
    {
        if (game.player.ship.cargo.container[item] !== undefined)
        {
            return game.player.ship.cargo.container[item].quantity;
        }
        else
        {
            console.log('Ship doesn\'t own item "' + item + '".');
            return 0;
        }
    }
    else console.log('Can\'t check cargo hold for item "' + item + '": Doesn\'t exist.');
}

// Returns if space is sufficient
function cargo_check_space(item, quantity)
{
    if (quantity === undefined) quantity = 1;
    return game.player.ship.cargo.size - game.player.ship.cargo.hold >= game.db.items[item].size * quantity;
}

// Returns if the cargo class is high enough
function cargo_check_class(item)
{
    return game.player.ship.cargo.class >= game.db.items[item].class;
}

// Returns if space is sufficient and class high enough
function cargo_check(item)
{
    return cargo_check_space(item) && cargo_check_class(item);
}

//----------------------------------------------------------------------------------------------------

// Money stuff

// Adds money to player
game.creditsAdd = function(number)
{
    if (game.player.credits + rounded(number) <= max_credits)
    {
        localStorage.credits = game.player.credits = parseInt(localStorage.credits) + rounded(number);
    }
}

// Removes money from player
game.creditsRemove = function(number)
{
    localStorage.credits = game.player.credits = parseInt(localStorage.credits) - rounded(number);
}

//----------------------------------------------------------------------------------------------------

// Adds fighting points
game.addFightpoints = function(points)
{
    if (points > 0)
    {
        game.player.fightpoints += points;

        let fp = game.player.fightpoints;

        // Keep fight rank up to date
        if (fp >= 1)    game.player.fightrank = string("player_fightrank_1");
        if (fp >= 20)   game.player.fightrank = string("player_fightrank_2");
        if (fp >= 50)   game.player.fightrank = string("player_fightrank_3");
        if (fp >= 100)  game.player.fightrank = string("player_fightrank_4");
        if (fp >= 200)  game.player.fightrank = string("player_fightrank_5");
        if (fp >= 500)  game.player.fightrank = string("player_fightrank_6");
        if (fp >= 1000) game.player.fightrank = string("player_fightrank_7");
        if (fp >= 2000) game.player.fightrank = string("player_fightrank_8");
    }
}

// Adds trading points
game.addTradepoints = function(points)
{
    if (points > 0)
    {
        game.player.tradepoints += points;

        let tp = game.player.tradepoints;

        // Keep trade rank up to date
        if (tp >= 10)    game.player.traderank = string("player_traderank_1");
        if (tp >= 200)   game.player.traderank = string("player_traderank_2");
        if (tp >= 500)   game.player.traderank = string("player_traderank_3");
        if (tp >= 1000)  game.player.traderank = string("player_traderank_4");
        if (tp >= 2000)  game.player.traderank = string("player_traderank_5");
        if (tp >= 5000)  game.player.traderank = string("player_traderank_6");
        if (tp >= 10000) game.player.traderank = string("player_traderank_7");
        if (tp >= 20000) game.player.traderank = string("player_traderank_8");
    }
}

//----------------------------------------------------------------------------------------------------

// Sets the weapon turret of a ship
function set_weapon(obj, which, type)
{
    if (type !== null)
    {
        // Check if turret exists - if not, create it
        if (obj.turrets[which] === undefined) obj.turrets[which] = {};

        let turret = obj.turrets[which];
        let db = game.db.items[type];

        turret.type = type;
        turret.next = 0;

        // Load corresponding assets
        turret.sprite = loadSprite(turret, "sprite", db.sprite);
        if (game.sprites[db.bulletSprite] === undefined) new game.Sprite(db.bulletSprite);
        if (game.sprites[db.bulletSprite + "_fire"] === undefined) new game.Sprite(db.bulletSprite + "_fire");
        if (game.sounds[db.sound] === undefined) new game.Sound(db.sound);
    }
}

// Checks if given weapon is compatible with ship
function weapon_check(obj, weapon)
{
    let ship = game.db.ships[obj.ship];
    let i = ship.weapons.compatible.length;
    while (i--)
    {
        if (ship.weapons.compatible[i] === weapon) return true
    }
}

// Checks if given shield is compatible with ship
function shield_check(obj, shield)
{
    let i = ship.shields.compatible.length;
    while (i--)
    {
        if (ship.shields.compatible[i] === shield) return true
    }
}

//----------------------------------------------------------------------------------------------------

// Clears a timer or interval, works for both
game.clearTimer = function(timer)
{
    clearTimeout(timer);
    clearInterval(timer);
}

//----------------------------------------------------------------------------------------------------

// Network functions

// Debug functions (shouldn't work at players, admins only :P)
function change_all_weapons(weapon)
{
    if (game.db.items[weapon] !== undefined)
    {
        let i = game.db.ships[game.player.ship.ship].weapons.slots.length;
        while (i--)
        {
            change_weapon(game.db.ships[game.player.ship.ship].weapons.slots[i], weapon);
        }
    }
}

// Send weapon data
function change_weapon(turret, weapon)
{
    if (! singleplayer)
    {
        game.network.socket.emit(14, turret, weapon);
    }
    else
    {
        set_weapon(game.player.ship, turret, weapon);
    }
}

// Calculates the size for weapon turrets and projectiles
function turret_multiplier(size)
{
    return 1 + (size * 0.5);
}

// Drops an item
function drop_item(obj, item, amount)
{
    game.cargoRemove(game.player.ship, item, amount);

    if (singleplayer)
    {
        new game.Item(obj, obj.x, obj.y, item, amount, true, obj);
    }
}

// Change username (send)
game.setPlayername = function()
{
    let n = prompt("Dieser Name erscheint unter deinem Schiff.", game.player.ship.name);
    if (n !== null && n !== '')
    {
        n = n.replace(/[^a-z- öäü0-9_-]/gi, ''); // Remove bad characters
        localStorage.username = n;
        if (! singleplayer) game.network.socket.emit(12, n);
        else
        {
            game.player.ship.name = n;

            // Re-new name sign
            game.createNameSign(game.player.ship);
        }
    }
}

game.createNameSign = function(ship)
{
    let name = ship.name;
    let alliance = ship.alliance;
    let race = ship.race;
    let nameColor = game.color.white;

    // Create empty canvas
    let c = document.createElement('canvas');
    c.width = 255;
    c.height = 33;
    let ctx = c.getContext("2d");

    //ctx.fillStyle = "red";
    //ctx.fillRect(0, 0, 255, 33);

    if (! ship.computer)
    {
        nameColor = game.color.white;
    }
    else
    {
        if (race === "xenon") nameColor = game.color.red;
        else if (race === "terran") nameColor = game.color.green;
    }

    ctx.font = "bold 13px Arial"
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    ctx.lineWidth = 3;
    ctx.strokeStyle = game.color.black;

    // Display the alliance's emblem if player is member of one
    if (alliance === null)
    {
        ctx.fillStyle = nameColor;
        ctx.strokeText(name, 0, 0);
        ctx.fillText(name, 0, 0);
    }

    else
    {
        // game.drawSprite(sprite, x, y, angle, sizew, sizeh)
        ctx.drawImage(ship.alliance_emblem, 0, 0);

        if (alliance === game.player.ship.alliance) ctx.fillStyle = "#3ae63a";
        else ctx.fillStyle = game.color.white;

        ctx.strokeText(alliance, 35, 0);
        ctx.fillText(alliance, 35, 0);

        ctx.fillStyle = game.color.white;

        ctx.strokeText(name, 35, 16);
        ctx.fillText(name, 35 , 16);
    }

    cropImageFromCanvas(ctx, c);

    ship.nameSign = new Image();
    ship.nameSign.src = c.toDataURL();
}

function cropImageFromCanvas(ctx, canvas)
{
    let w = canvas.width;
    let h = canvas.height;
    let pix = {x:[], y:[]};
    let imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
    let x = 0;
    let y = 0;
    let index = 0;

    for (y = 0; y < h; y++) {
        for (x = 0; x < w; x++) {
            index = (y * w + x) * 4;
            if (imageData.data[index+3] > 0) {

                pix.x.push(x);
                pix.y.push(y);

            }   
        }
    }
    pix.x.sort(function(a,b){return a-b});
    pix.y.sort(function(a,b){return a-b});
    let n = pix.x.length-1;

    w = pix.x[n] - pix.x[0] + 1;
    h = pix.y[n] - pix.y[0] + 1;
    let cut = ctx.getImageData(pix.x[0], pix.y[0], w, h);

    canvas.width = w;
    canvas.height = h;
    ctx.putImageData(cut, 0, 0);
}

// Change alliance (send)
game.setAlliance = function()
{
    let a = prompt("Dieser Firmenname erscheint vor deinem Namen", game.player.ship.alliance);
    if (a !== null && a !== '')
    {
        a = a.replace(/[^a-z-., öäü0-9]/gi, ''); // Remove bad characters
        localStorage.alliance = a;
        if (! singleplayer) game.network.socket.emit(13, a);
        else
        {
            game.player.ship.alliance = a;

            // Re-new name sign
            game.createNameSign(game.player.ship);
        }
    }
}

// Chat (send)
function send_chat(channel, msg)
{
    if (! singleplayer)
    {
        if (msg !== null && msg !== '')
        {
            game.network.socket.emit(11, channel, msg);
            document.getElementById('chat_input').style.visibility = "hidden";
            game.canvas.focus();
        }
    }
}

// Change ship (recieve)
function change_ship(obj, type)
{
    if (typeof(obj) === "String") { obj = game.player.ship; }
    else
    {
        obj.ship = type;

        let dbShip = game.db.ships[type];

        // Generate unique ship id
        if (! obj.computer)
        {
            obj.uid = "PM" + dbShip.general.class + random_character(2) + "-" + irandom_range(0, 99);
        }
        else
        {
            let token = "&#160;";
            if (obj.race !== "none")
            {
                token = game.db.races[obj.race].token;
            }
            obj.uid = token + "M" + dbShip.general.class + random_character(2) + "-" + irandom_range(0, 99);
        }

        // Sprites
        obj.sprite               = loadSprite(obj, "sprite", dbShip.sprites.ship);
        obj.sprite_hit           = loadSprite(obj, "sprite_hit", dbShip.sprites.ship_hit);
        obj.sprite_wreck         = loadSprite(obj, "sprite_wreck", dbShip.sprites.ship_wreck);

        obj.sprite_minimap       = loadSprite(obj, "sprite_minimap", dbShip.sprites.map);
        obj.sprite_minimap_you   = loadSprite(obj, "sprite_minimap_you", dbShip.sprites.map_you);
        obj.sprite_minimap_enemy = loadSprite(obj, "sprite_minimap_enemy", dbShip.sprites.map_enemy);

        obj.w = dbShip.general.radius;
        obj.h = dbShip.general.radius;

        obj.hull      = obj.hull_max      = dbShip.general.hull;
        obj.mspd      = obj.mspd_max      = dbShip.general.mspd;
        obj.steer     = obj.steer_max     = dbShip.general.steer;
        obj.generator = obj.generator_max = dbShip.general.generator;

        // Initiate cargo
        obj.cargo =
        {
            container: {},
            hold: 0,
            name: dbShip.cargo.name,
            class: dbShip.cargo.class,
            size: dbShip.cargo.size,
            size_max: dbShip.cargo.size
        };

        // Add integrated addons
        for (let a of dbShip.integrated)
        {
            game.cargoAdd(obj, a, 1, true);
        }

        // Initiate weapon turrets
        obj.turrets = [];

        // Place weapon turrets
        var l = Object.keys(dbShip.weapons.slots).length;
        for (var i = 0; i < l; i++)
        {
            var s = dbShip.weapons.slots[i];
            obj.turrets.push(
            {
                distance: s.distance,
                angle: s.angle,
                class: s.class,
                type: null,
                angleSet: obj.angle
            });

            // Equip start weapons
            if (s.start !== undefined && s.start !== null)
            {
                game.cargoAdd(obj, s.start, 1, true);
                set_weapon(obj, i, s.start);
            }
        }

        // Initiate shields
        obj.shield = {};
        var _shieldpoints = 0
        var l = dbShip.shields.slots.length;
        for (var i = 0; i < l; i++)
        {
            // Equip start shields
            if (dbShip.shields.slots[i].start !== undefined)
            {
                var _type = dbShip.shields.slots[i].start;
                _shieldpoints += game.db.items[_type].energy;
                game.cargoAdd(obj, _type, 1, true);
            }
        }
        obj.shield.points = obj.shield.points_max = _shieldpoints;

        // Initiate engine
        obj.engine = [];

        // Place engines
        var l  = dbShip.engines.slots.length;
        for (var i = 0; i < l; i++)
        {
            obj.engine.push(
            {
                distance: dbShip.engines.slots[i].distance,
                angle: dbShip.engines.slots[i].angle,
                size: dbShip.engines.slots[i].size
            });
        }

        // Initiate tractor beam
        obj.tractor =
        {
            range: dbShip.tractor.range,
            speed: dbShip.tractor.speed
        }

        // Restart flight time and other stuff
        if (obj === game.player.ship)
        {
            game.player.flight_time = 0;
            game.clearTimer(game.player.flight_timer);
            game.player.flight_timer = setInterval("game.player.flight_time++", 1000);
        }
    }
}

// Sector travel: Deleting everything
game.setSector = function(sector, coords)
{
    // Delete gates
    game.entities.gates = [];
    game.Gate.count = 0;

    // Delete stations
    var i = game.entities.stations.length;
    while (i--)
    {
        // Stop all timers
        for (var j in game.entities.stations[i].timers) game.clearTimer(game.entities.stations[i].timers[j]);
    }
    game.entities.stations = [];
    game.Station.count = 0;

    // Delete asteroids
    game.entities.asteroids = [];
    game.Asteroid.count = 0;

    // Delete ships
    i = game.entities.ships.length;
    while (i--)
    {
        var s = game.entities.ships[i];

        if (s !== game.player.ship)
        {
            // Stop all timers
            for (var j in s.timers) game.clearTimer(s.timers[j]);

            game.entities.ships.splice(game.entities.ships.indexOf(s), 1);
        }
    }
    game.Ship.count = 1;

    // Delete items
    game.entities.items = [];
    game.Item.count = 0;

    // Delete bullets
    game.entities.bullets = [];
    game.Bullet.count = 0;

    // Delete particles
    game.entities.particles = [];
    game.Particle.count = 0;

    // Stop music
    if (game.settings.music === true)
    {
        if (audio_is_playing(game.sounds[game.current.music]) === true)
        {
            audio_stop(game.sounds[game.current.music]);
        }
    }

    // Change sector
    game.current.sector = game.db.sectors[sector];

    // Start music of new sector
    game.current.music = game.current.sector.music;
    var m = game.current.music;
    if (game.settings.music === true)
    {
        if (game.sounds[m] === undefined)
        {
            new game.Sound(m);
        }
        audio_play_music(game.sounds[game.current.music]);
    }

    // Apply new sector data
    document.body.style.backgroundImage = 'url("images/' + game.current.sector.background + '")';

    // Load minimap background
    if (game.sprites[game.current.sector.minimap] === undefined) new game.Sprite(game.current.sector.minimap);

    // Create asteroids
    for (var i = game.current.sector.asteroids.length; i--;)
    {
        for (var j = game.current.sector.asteroids[i]; j--;)
        {
            new game.Asteroid(irandom_range(-(game.current.sector.size / 2), (game.current.sector.size / 2)), irandom_range(-(game.current.sector.size / 2), (game.current.sector.size / 2)), i+1);
        }
    }

    // Create gates
    for (let g of game.current.sector.gates)
    {
        new game.Gate({ id: g.type, x: g.x, y: g.y, destination: g.destination });
    }

    // Create stations
    for (let s of game.current.sector.stations)
    {
        new game.Station({ x: s.x, y: s.y, type: s.type, race: s.race });
    }

    // Create AI ships
    for (let s of game.current.sector.ships)
    {
        let ss = game.current.sector.size;
        let newShip = new game.Ship(
        {
            x: s.x || irandom_range(-(ss / 2.5), (ss / 2.5)),
            y: s.y || irandom_range(-(ss / 2.5), (ss / 2.5)),
            ship: s.type || "drone",
            race: s.race || "none",
            computer: s.computer || true
        });

        // Give terrans better weapons
        if (newShip.race == "terran")
        {
            var _slots = Object.keys(game.db.ships[newShip.ship].weapons.slots).length;
            for (let i = 1; i <= rounded(_slots / 2); i++)
            {
                set_weapon(newShip, i, "pbk");
            }

            for (let i = rounded(_slots / 2) + 1; i <= _slots; i++)
            {
                set_weapon(newShip, i, "zpk");
            }
        }
    }

    if (coords !== undefined)
    {
        game.player.ship.x = coords.x;
        game.player.ship.y = coords.y;
        game.player.ship.moving = 0;
        game.player.ship.mspeed = 0;
        game.player.ship.velocity = { x: 0, y: 0 };
        game.player.ship.rotaing = 0;
        game.player.ship.rspeed = 0;
        game.player.ship.angle = point_direction(game.player.ship.x, game.player.ship.y, 0, 0);
        game.player.ship.shooting = false;
    }

    // Gate count +1
    game.player.passed_gates += 1;

    // Jump sound
    audio_play_sound(game.sounds["snd_login"]);
}

game.setSectorRandom = function()
{
    let size = 20000;
    game.db.sectors[null] =
    {
        "name": "Unknown sector",
        "desc": "Sector not found in database",
        "id": null,
        "size": size,
        "music": "bgm_x-x",
        "background": "x.png",
        "minimap": "spr_gui_minimap_bg01",

        "asteroids": [irandom(400), irandom(200), irandom(100)],
        "gates": [],
        "stations": [],
        "ships": []
    }

    game.setSector(null, { x: irandom_range(-size / 2, size / 2), y: irandom_range(-size / 2, size / 2) });
}

// Returns the unique ship id
game.getShipId = function(ship)
{
    return ship.uid;
}

// Returns the ship's class
game.getShipClass = function(ship)
{
    return game.db.ships[ship.ship].general.class;
}

function execute_start_stuff()
{
    // Make GUI visible
    document.getElementById("gui").style.visibility = "visible";

    // Stop animated background from main menu
    document.body.style.animation = 'none';

    // Activate GUI
    new game.Infobox();
    new game.TopBar();
    new game.WeaponInfo();

    // Start credits
    game.creditsAdd(1000);

    if (audio_is_playing(game.sounds[game.current.music]) === true) { audio_stop(game.sounds[game.current.music]); };

    // Load assets necessary for initial game launch
    game.spritesToLoad =
    [
        "spr_gui_minimap",
        "spr_gui_minimap_shadow",

        "spr_gui_settings_off",
        "spr_gui_settings_on",

        "spr_item_container",
        "spr_item_upgrade",

        "spr_item_rocket",

        "spr_item_ore",
        "spr_item_cell",
        "spr_item_crystal",

        "spr_item_1mj",
        "spr_item_5mj",
        "spr_item_25mj",
        "spr_item_125mj",
        "spr_item_200mj",
        "spr_item_1gj",
        "spr_item_2gj",
        "spr_item_10gj",

        "spr_item_ise",
        "spr_item_pbk",
        "spr_item_epw",
        "spr_item_pk",
        "spr_item_zpk",

        "spr_bars",
        "spr_credits",

        "spr_shield",
        "spr_explosion",
        "spr_explosion_wave"
    ];

    for (let sprite of game.spritesToLoad)
    {
        if (game.sprites[sprite] === undefined) new game.Sprite(sprite);
    }
    game.spritesToLoad = [];

    // Load some sounds
    game.soundsToLoad =
    [
        // Weapon hit sounds
        "snd_hull",
        "snd_shield",

        // Ship engine
        "snd_engine",

        // Explosions
        "snd_explosion",

        "snd_chat", // Chat message
        "snd_login", // When a player connects

        // Items
        "snd_item"
    ];

    for (let sound of game.soundsToLoad)
    {
        if (game.sounds[sound] === undefined) new game.Sound(sound);
    }
    game.soundsToLoad = [];

    // Initiate object pools
    for (var i = 0; i < 500; i++)
    {
        game.entities.particlesPool.push(new game.Engine(0, 0, 0, 0));
    }

    for (var i = 0; i < 500; i++)
    {
        game.entities.bulletsPool.push(new game.Bullet(0, 0, 0, 0, "ise", "player", 0));
    }
}

// Test: Singleplayer :D
function start_singleplayer()
{
    game.state = "game";
    singleplayer = true;
    player_count = 1;

    game.player.ship = new game.Ship(
    {
        "id": game.player.id,
        "name": string("player"),
        "ship": "fighter",
        "race": "player",
        "computer": false
    });
    game.camera.target = game.player.ship;
    game.current.ship = game.player.ship;

    // Save username gotten from server into localStorage
    if (localStorage.username) game.player.ship.name = localStorage.username;
    if (localStorage.alliance) game.player.ship.alliance = localStorage.alliance;

    // Re-new ship name sign
    game.createNameSign(game.player.ship);

    setInterval(function() { game.network.time = game.time.now; }, 250);

    // Status of connection
    game.network.connected = true;

    execute_start_stuff();

    game.current.sector = game.db.sectors["0-0"];
    game.setSector("0-0");
}
