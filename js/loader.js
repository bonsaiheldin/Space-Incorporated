// Resource preloader
function resourceLoaded()
{
    resourcesLoaded += 1;
    if (resourcesLoaded === resourcesToLoad)
    {
        allResourcesLoaded = true;
    }
}

// Load JSON stuff
function loadJSON(file) {   

    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'data/' + file + '.json'); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function ()
    {
        if (xobj.readyState === 4 && xobj.status === 200)
        {
            resourceLoaded();
            console.log("JSON file 'db." + file + ".json' loaded!");

            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            game.db[file] = JSON.parse(xobj.responseText);
        }
    };
    xobj.send(null);  
}

// Adds a new sprite
game.Sprite = function(file)
{
    var s = game.sprites[file] = new Image();
    s.src = "images/" + file + ".png";

    s.addEventListener("load",  function(e)
    {
        console.log("Image '" + file + "' loaded!");
        resourceLoaded();

        // Process queue
        if (game.spritesQueue[file] !== undefined)
        {
            for (var o of game.spritesQueue[file])
            {
                if (o.obj !== undefined)
                {
                    var t = o.type;
                    o.obj[t] = game.sprites[file];

                    if (t === "alliance_emblem")
                    {
                        // Re-new name sign
                        game.createNameSign(o.obj);
                    }
                }
            }
            delete game.spritesQueue[file];
        }

        // Remove this event listener after it was fired once
        e.target.removeEventListener(e.type, arguments.callee);
    });

    s.addEventListener("error",  function(e)
    {
        console.log("Error loading image: ", e);
        delete game.sprites[file];
        delete game.spritesQueue[file];

        // Remove this event listener after it was fired once
        e.target.removeEventListener(e.type, arguments.callee);
    });

    return s;
}

function loadSprite(obj, type, file)
{
    // If sprite doesn't already exist
    if (game.sprites[file] === undefined)
    {
        // If sprite already in queue
        if (game.spritesQueue[file] !== undefined)
        {
            // Add sprite to queue
            game.spritesQueue[file].push(
            {
                obj: obj,
                type: type
            });
        }
        // Not in queue
        else
        {
            // Create queue and add sprite to it
            game.spritesQueue[file] = [];
            game.spritesQueue[file].push(
            {
                obj: obj,
                type: type
            });

            new game.Sprite(file);
        }

        // Return default sprite
        return game.sprites["x"];
    }
    else
    {
        return game.sprites[file];
    }
}

// Adds a new sound
game.Sound = function(file, loop)
{
    game.sounds[file] = new Audio("audio/" + file + ".ogg");
    if (loop) game.sounds[file].loop = loop;

    // Fixes gaps when something should be looped seamlessly
    game.sounds[file].addEventListener("timeupdate",  function(e)
    {
        if (this.loop)
        {
            let buffer = 0.99;
            if (this.currentTime > this.duration - buffer)
            {
                this.currentTime = 0;
                this.play();
            }
        }
    });

    game.sounds[file].addEventListener("canplaythrough",  function(e)
    {
        resourceLoaded();
        console.log("Sound '" + file + "' loaded!");

        // Remove this event listener after it was fired once
        e.target.removeEventListener(e.type, arguments.callee);
    });
}

////////// Files to load//////////

game.JSONToLoad = ["strings", "items", "races", "sectors", "ships", "stations"];

// Loading screen
var allResourcesLoaded = false;
var resourcesToLoad = game.JSONToLoad.length + game.spritesToLoad.length + game.soundsToLoad.length;
var resourcesLoaded = 0;

////////// Sound functions //////////

// Plays a sound
function audio_play_sound(sound, volume)
{
    if (game.settings.sound)
    {
        if (sound.currentTime) { sound.currentTime = 0; }
        if (volume)
        {
            if (volume > 1) volume = 1;
            sound.volume = volume;
        }
        sound.play();
    }
}

// Plays music
function audio_play_music(sound, volume)
{
    if (sound !== undefined)
    {
        sound.loop = true;
        if (game.settings.music !== null)
        {
            if (sound.currentTime) { sound.currentTime = 0; }
            if (volume !== undefined)
            {
                if (volume > 1) volume = 1;
                sound.volume = volume;
            }
            sound.play();
        }
    }
}

// Stops a sound
function audio_stop(sound)
{
    if (sound !== undefined && sound !== null)
    {
        if (audio_is_playing(sound))
        {
            sound.currentTime = 0;
            sound.pause();
        }
    }
}

// Pauses a sound
function audio_pause(sound)
{
    if (sound !== undefined)
    {
        if (audio_is_playing(sound))
        {
            sound.pause();
        }
    }
}

function audio_resume(sound)
{
    if (sound !== undefined)
    {
        if (! audio_is_playing(sound))
        {
            sound.play();
        }
    }
}

// Checks if a sound is playing
function audio_is_playing(sound) { return ! sound.paused; }
