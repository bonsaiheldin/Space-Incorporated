/********** BEGIN: System **********/

// Container objects
let game = {}; // The master object for storing game data
game.canvas = null;
game.loop = null;
game.language = "en"; // Default language
game.db = {};
game.sprites = {};
game.spritesQueue = {};
game.spritesToLoad = [];
game.sounds = {};
game.soundsToLoad = [];
game.keyboard = {};
game.mouse = {};
game.current = {};
game.time = {};
game.zoom = 1; // Initial zoom factor
game.camera = {};
game.emoticons = {};
game.settings = {};
game.entities = {};
game.player = {};
game.network = {};
game.state = "logo"; // "logo", "title", "game";
game.debug = false;

// Create the canvas
game.canvas = document.getElementById("game");
var cc = game.canvas.getContext("2d"); // Main

game.canvas.focus();
game.canvas.tabIndex = 0;
game.canvas.width = window.innerWidth;
game.canvas.height = window.innerHeight;

cc.textBaseline = "middle"; // Default text position

// Disable right click
game.canvas.oncontextmenu = function() { return false; }
gui.oncontextmenu = function() { return false; }

// Define viewports for scrolling inside the canvas
game.camera =
{
    x: 0,
    y: 0,
    w: window.innerWidth,
    h: window.innerHeight,
    target: null
}

// Universal database to store everything
game.db =
{
    strings: {},
    sectors: {},
    races: {},
    items: {},
    ships: {},
    stations: {}
};

// Object containing data for string parsing
game.current =
{
    sector: null,
    music: null,
    ship: null
};

// Create the necessary arrays and objects
game.entities =
{
    players: [],
    ships: [],
    particles: [],
    particlesPool: [],
    bullets: [],
    bulletsPool: [],
    items: [],
    stations: [],
    gates: [],
    asteroids: []
}

// Emoticons for replacing in chat messages
game.emoticons =
{
    ":credits:": "<img src='images/spr_credits.png'>",

    ":container:": "<img src='images/spr_item_container.png'>",
    ":energycell:": "<img src='images/spr_item_energycell.png'>",
    ":crystal:": "<img src='images/spr_item_crystal.png'>",
    ":ore:": "<img src='images/spr_item_ore.png'>",

    ":upgrade:": "<img src='images/spr_item_upgrade.png'>"
};

// Default font variables
var default_font = "normal 13pt Arial";

// Standard values
game.settings =
{
    music: true,
    sound: true,
    names: true,
    hullbars: true,
    particles: true,
    wrecks: true,
    emoticons: true,
    welcome: true,

    map:
    {
        ships: true,
        stations: true,
        asteroids: true,
        items: true
    },

    indicator:
    {
        ships: true,
        stations: true,
        gates: true,
        items: true
    }
};

game.player =
{
    ship: 0,
    credits: 0,

    shots_fired: 0,
    shots_hit: 0,
    rockets_fired: 0,
    rockets_hit: 0,

    traveled_distance: 0,
    passed_gates: -1,

    tradepoints: 0,
    traderank: '',
    fightpoints: 0,
    fightrank: '',

    game_time: 0,
    game_timer: setInterval(function() { game.player.game_time += 1; }, 1000),

    flight_time: 0,
    flight_timer: setInterval(function() { game.player.flight_time += 1; }, 1000),
};

// Time based animation and FPS Counter
game.time =
{
    before: 0,
    now: Date.now(),
    delta: (1000 / 60) / 1000,
    fps: 60,
    fpsThisSecond: 0,
    fpsLastUpdate: 0
};

game.network =
{
    //host: "localhost",
    host: "websocket.bonsaiheld.org",
    //host: "nora-notebook.sqnraqwqsfehe0x3.myfritz.net",
    port: 64134,
    time: game.time.now,
    ping: 0,
    pingEmitted: 0,
    players: 0,
    socket: null,
    connected: false
};

// Random variables
game.var =
{
};

// Color codes
game.color =
{
    "black"        : "#000000",
    "white"        : "#ffffff",
    "gray"         : "#999999",
    "darkgray"     : "#555555",
    "lightgray"    : "#ababab",

    "red"          : "#ff0000",
    "blue"         : "#0000ff",
    "yellow"       : "#ffff00",
    "green"        : "#00ff00",

    "cyan"         : "#00ffff",
    "orange"       : "#ff7f00",
    "pink"         : "#ff00ff",
    "purple"       : "#7f00ff",
    "magenta"      : "#ff007f",

    "darkred"      : "#800000",
    "darkblue"     : "#000080",
    "darkyellow"   : "#808000",
    "darkgreen"    : "#008000",

    "darkcyan"     : "#008080",
    "darkorange"   : "#804000",
    "darkpink"     : "#800080",
    "darkpurple"   : "#400080",
    "darkmagenta"  : "#800040",

    "lightred"     : "#ff8080",
    "lightblue"    : "#8080ff",
    "lightyellow"  : "#ffff80",
    "lightgreen"   : "#80ff80",
    "lightcyan"    : "#80ffff",

    "lightorange"  : "#ffbf80",
    "lightpink"    : "#ff80ff",
    "lightpurple"  : "#bf80ff",
    "lightmagenta" : "#ff80bf"
};

// Read existing settings from localStorage
game.language = (navigator.language).substring(2, 0);
if (localStorage.music) game.settings.music = JSON.parse(localStorage.music);
if (localStorage.sound) game.settings.sound = JSON.parse(localStorage.sound);
if (localStorage.names) game.settings.names = JSON.parse(localStorage.names);
if (localStorage.hullbars) game.settings.hullbars = JSON.parse(localStorage.hullbars);
if (localStorage.particles) game.settings.particles = JSON.parse(localStorage.particles);
if (localStorage.wrecks) game.settings.wrecks = JSON.parse(localStorage.wrecks);
if (localStorage.emoticons) game.settings.emoticons = JSON.parse(localStorage.emoticons);
if (localStorage.welcome) game.settings.welcome = JSON.parse(localStorage.welcome);

// Test: Box inventory
var inventory = false;

// Some variables
var main_menu = false;
var connected = false;
var connection_error = false;
var chat_log = document.getElementById('chat_window'); // Chat log window

// Singleplayer stuff
var singleplayer = false;

// Screen shaking
var screen_shaking = false;

// Credits stuff
var max_credits = 999999999;
localStorage.setItem("credits", "0");

var trading = false; // Initial state of trade window at the base

////////// GUI //////////


// Set initial variables
window.onload = function()
{
    game.spritesToLoad =
    [
        "spr_bonsaiheldin",
        "spr_stars01",
        "spr_stars02",
        "x"
    ];

    game.soundsToLoad =
    [
        // Bonsaiheldin
        "snd_bonsaiheldin",

        // Background music
        "bgm_title",
        //"snd_chat",

        // GUI
        "snd_gui_open",
        "snd_gui_close",
        "snd_gui_button",
        "snd_gui_button_hover"
    ];

    // Load JSON data files
    for (let json of game.JSONToLoad)
    {
        loadJSON(json);
    }

    // Load first sprites
    for (let sprite of game.spritesToLoad)
    {
        if (game.sprites[sprite] === undefined) new game.Sprite(sprite);
    }
    game.spritesToLoad = [];

    // Load first sounds
    for (let sound of game.soundsToLoad)
    {
        if (game.sounds[sound] === undefined) new game.Sound(sound);
    }
    game.soundsToLoad = [];

    // Test: Bonsaiheldin logo before the game
    bonsaiheldin = [];

    bonsaiheldin.push(new function()
    {
        document.body.style.backgroundColor = '#000000';

        this.x = game.camera.x + (game.camera.w / 2);
        this.y = game.camera.y + (game.camera.h / 2);
        this.sprite = loadSprite(this, "sprite", "spr_bonsaiheldin");

        this.blending = "in";
        this.opacity = 0;

        this.created = game.time.now + 5000;

        if (game.settings.music === true) audio_play_sound(game.sounds["snd_bonsaiheldin"]);

        let f = function()
        {
            // Load assets necessary for the main screen
            game.spritesToLoad =
            [
                "spr_logo",

                // Things to build the GUI with (will be completely replaced by CSS :D)
                "spr_gui_button_l",
                "spr_gui_button_r",
                "spr_gui_button_m",
                "spr_gui_button_la",
                "spr_gui_button_ra",
                "spr_gui_button_ma",

                "spr_gui_gradient_titlebar",
                "spr_gui_gradient_window",

                "spr_gui_shadow"
            ];

            for (let sprite of game.spritesToLoad)
            {
                if (game.sprites[sprite] === undefined) new game.Sprite(sprite);
            }
            game.spritesToLoad = [];

            document.body.style.backgroundImage = "url(images/spr_stars02.png), url(images/spr_stars01.png), url(images/bg_space01.png)";

            if (audio_is_playing(game.sounds["snd_bonsaiheldin"])) audio_stop(game.sounds["snd_bonsaiheldin"]);
            game.current.music = "bgm_title";
            if (game.settings.music === true) audio_play_music(game.sounds[game.current.music]);
            game.state = "title";
            this.blending = false;
            bonsaiheldin = [];
        }

        this.render = function()
        {
            if (this.blending === "in" && this.opacity < 1) { this.opacity += 0.75 * game.time.delta; }
            if (this.blending === "out" && this.opacity > 0) { this.opacity -= 1 * game.time.delta; }

            if (this.opacity >= 1) this.blending = "out";

            if (this.opacity < 0) this.opacity = 0;

            if (this.opacity <= 0 && this.blending === "out" || game.keyboard.isDown[game.keyboard.escape] || game.mouse.isDown[game.mouse.left])
            {
                f();
            }

            if (this.opacity < 1) cc.globalAlpha = this.opacity;
            game.drawSprite(this.sprite, this.x, this.y);
            if (this.opacity < 1) cc.globalAlpha = 1;
        }
    });

    // All files loaded: Start game
    //game.update();
    //game.render(game.time.delta);

    MainLoop.setUpdate(game.update).setDraw(game.render).start();

    window.onload = null;
}

/********** END: System **********/
