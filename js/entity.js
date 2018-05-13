// Creates a ship
game.Ship = function(data)
{
    var that = this;
    let db = game.db.ships[data.ship];

    // Set ship data with given values
    for (var i in data) { this[i] = data[i]; }

    // Set default parameters
    if (this.id === undefined)       this.id = 'ai' + irandom(999999);
    if (this.x === undefined)        this.x = irandom_range(-150, 150);
    if (this.y === undefined)        this.y = irandom_range(-150, 150);
    if (this.alliance === undefined) this.alliance = null;
    if (this.angle === undefined)    this.angle = irandom_range(-180, 180);
    if (this.ship === undefined)     this.ship = "drone";
    if (this.moving === undefined)   this.moving = 0;
    if (this.rotating === undefined) this.rotating = 0;
    if (this.shooting === undefined) this.shooting = 0;
    if (this.mouseX === undefined)   this.mouseX = this.x;
    if (this.mouseY === undefined)   this.mouseY = this.y;
    if (this.race === undefined)     this.race = "human";
    if (this.computer === undefined) this.computer = false;
    if (this.name === undefined)
    {
        if (this.computer) this.name = string("race_" + this.race) + " " + game.db.ships[this.ship].general.name;
        else this.name = game.player.ship.name + "'s " + this.ship;

        if (this.computer === true && this.race === "player")
        {
            this.name = game.player.ship.name + "'s " + this.ship;
        }
    }

    // Patroling
    if (this.name === "Terran patrol")
    {
        this.waypoints = data.waypoints;
        this.waypoint = this.waypoints[0];
    }

    // Start values
    this.alliance_emblem = loadSprite(this, "alliance_emblem", "spr_emblem_minc");
    this.opacity = 0;

    // Generate unique general id (used for animation ect.)
    this.guid = irandom(999999);

    this.timers = {}; // Object for storing all timers

    // Activate
    this.timers.activating = setTimeout(function()
    {
        that.active = true;
    }, 1000);

    // Start shield reloading
    this.timers.shield_reload = setInterval(function()
    {
        if (that.generator >= that.generator_max / 20)
        {
            if (that.shield.points < that.shield.points_max && that.generator >= that.generator_max / 40)
            {
    			that.shield.points += that.generator_max / 40;
        		if (that.shield.points > that.shield.points_max)
                {
                    that.shield.points = that.shield.points_max;
                }

    			that.generator -= that.generator_max / 20;
    			if (that.generator < 0) that.generator = 0;
    		}
        }
    }, 250);

    // Apply enemy/friend/neutral stuff
    let foes = [];
    switch (this.race)
    {
        case "player": foes = ["xenon"]; break;
        case "terran": foes = ["xenon"]; break;
        case "xenon":  foes = ["player", "terran"]; break;
        case "none":   foes = []; break;
    }
    this.foes = foes;

    // Default values
    change_ship(this, this.ship); // Change ship after being created (bullshit, i must change this somehow)
    if (this.race === "player") this.sprite_minimap = game.db.ships[this.ship].sprites.map_you;
    this.mspeed = 0; // Initial movement speed
    this.rspeed = 0; // Initial rotation speed

    this.hit_opacity = 0;
    this.shield.opacity = 0; // Initial struck shield visibility (of course 0)

    this.on_station = false;
    this.active = false;
    this.homebase = null;

    // Test
    this.allies = [];
    this.cloaked = false;
    this.shocked = false;
    this.engineSpeed = 30; // Default speed of creating engine particles
    this.engineNext = 0;

    this.timers.appeared = setTimeout(function() { that.opacity = 1; }, 500);

    // If computer controlled, start enemy searching
    if (this.computer === true)
    {
        if (this.command !== "patrol")
        {
            this.command = "search_enemies";
        }

            this.nearest_enemies = [];

            var f = function()
            {
                that.nearest_enemies = [];
                var i = game.entities.ships.length;
                while (i--)
                {
                    var _ship = game.entities.ships[i];
                    var g = game.getNearest(that, game.entities.gates);
                    var distanceToGate = point_distance(_ship.x, _ship.y, g.x, g.y);

                    if (_ship !== that && point_distance(that.x, that.y, _ship.x, _ship.y) <= that.gravidar && ! _ship.on_station && that.foes.indexOf(_ship.race) >= 0 && _ship.ship !== "trader" && distanceToGate >= 500)
                    {
                        that.nearest_enemies.push(_ship);
                    }
                }

                that.nearestEnemy = game.getNearest(that, that.nearest_enemies);

                if (that.command !== "patrol" && that.nearest_enemies.length > 0)
                {
                    that.target = game.getNearest(that, that.nearest_enemies);
                    that.command = "killing";
                }
            };

            this.timers.nearest_enemies = setInterval(f, 250);
    }

    // Test: Create name sign
    game.createNameSign(this);

    // This and that
    if (this.computer !== true) game.entities.players.push(this);
    game.entities.ships.push(this);

    // Update counter
    game.Ship.count += 1;

    // Update sector map
    sectorMap();
    sectorMap();

    // Test: Network interpolation
    this.new =
    {
        x: this.x,
        y: this.y
    };

    // Test: Velocity and friction
    this.velocity = { x: 0, y: 0 };
    this.mass = 100; // Friction

    return this;
};

// Logic
game.Ship.prototype.update = function()
{
    let that = this;
    this.on_station = false;

    // Charge generator
    if (this.generator < this.generator_max)
    {
        this.generator += game.time.delta * this.generator_max;
	    if (this.generator > this.generator_max) this.generator = this.generator_max;
    }

    // Movement with accelerating and braking
    switch (this.moving)
    {
        case 1:
        {
            if (this.mspeed < this.mspd)
            {
                this.mspeed += (this.mspd * 2) * game.time.delta;
                if (this.mspeed > this.mspd) this.mspeed = this.mspd;
            }

            // Acceleration
            if (this.mspeed > 0)
            {
                let a = this.angle * pi180;
                let s = this.mspeed / 1000;
                this.velocity.x += Math.cos(a) * s;
                this.velocity.y += Math.sin(a) * s;
            }
        } break;

        case -1:
        {

            if (this.mspeed > -(this.mspd / 4))
            {
                this.mspeed -= (this.mspd * 2) * game.time.delta;
                if (this.mspeed < -(this.mspd / 4)) this.mspeed = -(this.mspd / 4);
            }

            // Deceleration
            if (this.mspeed < 0)
            {
                let a = this.angle * pi180;
                let s = (this.mspeed / 1000);
                this.velocity.x += Math.cos(a) * s;
                this.velocity.y += Math.sin(a) * s
            }
        } break;

        case 0:
        {
            if (this.mspeed < 0)
            {
                this.mspeed += this.mspd * game.time.delta;
                if (this.mspeed > 0) this.mspeed = 0;
            }
            else
            {
                this.mspeed -= this.mspd * game.time.delta;
                if (this.mspeed < 0) this.mspeed = 0;
            }
        } break;
    }

    this.mspeed = rounded2(this.mspeed);

    // Default friction
    this.velocity.x *= 0.97;
    this.velocity.y *= 0.97;

    // Mass
    //this.velocity.x *= this.mass * game.time.delta;
    //this.velocity.y *= this.mass * game.time.delta;

    this.x += this.velocity.x;
    this.y += this.velocity.y;

    // Draw a faaaancy particle engine
    if (this.mspeed !== 0)
    {
        // Draw a faaaancy particle engine
        // NOte: The particles should instead be placed within the ship - otherwise the particles are always over every ship as they are drawn after the last one - which sucks
        if (game.settings.particles && game.camera.inside(this))
        {
            if (game.time.now >= this.engineNext)
		    {
			    this.engineNext = game.time.now + this.engineSpeed;

                var i = this.engine.length;
                while (i--)
                {
                    let e = this.engine[i];

                    game.Engine.create(this.x + lengthdir_x(e.distance, e.angle + this.angle), this.y + lengthdir_y(e.distance, e.angle + this.angle), e.size, this.angle);
                }
            }
        }

        // Add traveled distance
        if (this === game.player.ship) game.player.traveled_distance += Math.abs(this.mspeed) / 20000;
    }

    // Activate rotation with accelerating and braking
    switch (this.rotating)
    {
        case -1:
        {
            if (this.rspeed > -this.steer)
            {
                this.rspeed -= (this.steer * 5) * game.time.delta;
                if (this.rspeed < -this.steer) this.rspeed = -this.steer;
            }
        } break;

        case 1:
        {
            if (this.rspeed < this.steer)
            {
                this.rspeed += (this.steer * 5) * game.time.delta;
                if (this.rspeed > this.steer) this.rspeed = this.steer;
            }
        } break;

        case 0:
        {
            if (this.rspeed > 0)
            {
                this.rspeed -= (this.steer * 2.5) * game.time.delta;
                if (this.rspeed < 0) this.rspeed = 0;
            }
            else
            {
                this.rspeed += (this.steer * 2.5) * game.time.delta;
                if (this.rspeed > 0) this.rspeed = 0;
            }
        } break;
    }

    // Rotate it
    if (this.rspeed < 0)
    {
        this.angle += this.rspeed * game.time.delta;
        if (this.angle < -180) this.angle += 360;
    }
    else if (this.rspeed > 0)
    {
        this.angle += this.rspeed * game.time.delta;
        if (this.angle > 180) this.angle -= 360;
    }

    if (game.debug && this === game.player.ship)
    {
        //console.log(game.player.ship.angle);
    }

    // Rounding with two digits behind comma
    this.rspeed = rounded2(this.rspeed);
    this.angle = rounded2(this.angle);

    // The faster the ship moves the faster engine particles emit
    // Min: 60ms, max: 30ms
    this.engineSpeed = 60 - ((this.mspeed / this.mspd_max) * 30);

    // Move turrets
    for (let t of this.turrets)
    {
        if (t.sprite)
        {
            t.posX = this.x + lengthdir_x
		    (
			    t.distance,
			    t.angle + this.angle
		    );

            t.posY = this.y + lengthdir_y
		    (
			    t.distance,
			    t.angle + this.angle
		    );

            t.angleSet = this.angle;
        }
    }

    // Worlds end
	var s = game.current.sector.size / 2;

    if (this.x >= s - 50)  this.x = s - 50;
    if (this.y >= s - 50)  this.y = s - 50;
    if (this.x <= -s + 50) this.x = -s + 50;
    if (this.y <= -s + 50) this.y = -s + 50;

    // Shield effect loading
    if (this.shield.active)
	{
		this.shield.opacity += game.time.delta * 5;
        if (this.shield.opacity > 1) this.shield.opacity = 1;
	}
    else
	{
		this.shield.opacity -= game.time.delta * 5;
        if (this.shield.opacity < 0) this.shield.opacity = 0;
	}

    // Shooting
    if (this.shooting === 1) this.shoot();

    // Execute orders
    if (this.computer && this.active) this.orders();

    // Engine sound: Starting and stopping
    if (this === game.camera.target)
    {
        if (game.settings.sound === true)
        {
            if (this === game.player.ship)
            {
                if (point_distance(this.x, this.y, game.camera.target.x, game.camera.target.y) <= 1000)
                {
                    let snd_engine = game.sounds["snd_engine"];

                    if (this.mspeed > 0)
                    {
                        if (! audio_is_playing(snd_engine))
                        {
                            snd_engine.loop = true;
                            snd_engine.volume = 0.01;
                            audio_play_sound(snd_engine);
                        }

                        if (audio_is_playing(snd_engine))
                        {
                            if (snd_engine.volume <= 0.967)
                            {
                                snd_engine.volume += 0.033;
                            }
                        }
                    }

                    else
                    {
                        // If ship speed is not 0, then it is moving (Captain Obvious has spoken!)
                        if (audio_is_playing(snd_engine))
                        {
                            if (snd_engine.volume >= 0.033)
                            {
                                snd_engine.volume -= 0.033;
                            }

                            else
                            {
                                audio_stop(snd_engine);
                            }
                        }
                    }
                }
            }
        }
    }

    if (this.active)
    {
        // Checks if this ship is on a station
        var i = game.entities.stations.length;
        while (i--)
        {
            var s = game.entities.stations[i];
            if (point_distance(this.x, this.y, s.x, s.y) <= s.w / 2) { this.on_station = true; }
        }

        // Collision with bullets
        var i = game.entities.bullets.length;
        while (i--)
        {
            let bullet = game.entities.bullets[i];

            // Only check for bullets from other ships of course
            if (bullet.id !== this.id)
            {
                // Only if bullet's ship is from another race
                if (bullet.race !== this.race)
                {
                    let type = "explosion";
                    let distance = this.w / 3;

                    if (this.shield.points > 0)
                    {
                        type = "shield";
                        distance = this.w / 1.4;
                    }

                    //if (point_distance(this.x, this.y, bullet.x, bullet.y) <= distance)
                    if (collideCircle(this, bullet))
                    {
                        this.struck(bullet.x, bullet.y);

                        if (point_distance(this.x, this.y, game.camera.target.x, game.camera.target.y) <= 1000)
                        {
                            if (type === "explosion") audio_play_sound(game.sounds["snd_hull"]);
                            else if (type === "shield") audio_play_sound(game.sounds["snd_shield"]);
                        }

                        // Damage
                        var damage = 0;
                        if (this.shield.points > 0)
                        {
                            damage = bullet.edmg;
                            this.shield.points -= damage;

                            if (this.shield.points < 0) this.shield.points = 0;
                        }
                        else
                        {
                            damage = bullet.kdmg;
                            this.hull -= damage;

                            if (this.hull <= 0) this.killer_id = bullet.id;
                        }

                        // Detonation particles
                        if (game.settings.particles)
                        {
                            if (this.shield.points <= 0)
                            {
                                new game.Wreck_particle(bullet.x, bullet.y);
                                new game.Particle(bullet.x, bullet.y, type);
                            }
                        }

                        // Add successful hit to statistics
                        if (bullet.id === game.player.id) game.player.shots_hit += 1;

                        // Delete the bullet
                        bullet.destroy();
                    }
                }
            }
        }
    }

    // Dying
    if (this.hull <= 0)
    {
        if (! this.computer)
        {
            if (singleplayer)
            {
                this.destroy(this.killer_id);

                // Restart the game after 3 seconds
                setTimeout(function()
                {
                    game.player.credits = 1000;
                    start_singleplayer();
                } , 3000);
            }
            else this.hull = this.hull_max;
        }
        else this.destroy(this.killer_id);
    }
};

// Drawing
game.Ship.prototype.render = function()
{
    // Only if inside viewport (improves performance)
    if (game.camera.inside(this))
    {
        // Start invisible and turn visible
        if (this.opacity < 1)
        {
            cc.globalAlpha = this.opacity;
            this.opacity += game.time.delta;
        }

        // Start invisible and turn visible
        if (this.cloaked) cc.globalAlpha = 0.5;

        // Draw ship
        game.drawSprite(this.sprite, this.x, this.y, this.angle);

        // Draw hit sprite
        if (this.hit_opacity > 0)
        {
            if (this.hit_opacity < 1) cc.globalAlpha = this.hit_opacity;
            game.drawSprite(this.sprite_hit, this.x, this.y, this.angle);
            if (this.hit_opacity < 1) cc.globalAlpha = 1;
            this.hit_opacity -= game.time.delta * 12.5;
        }

        // Draw turrets
        for (let t of this.turrets)
        {
            if (t.sprite)
            {
                game.drawSprite
			    (
				    t.sprite,
				    t.posX,
				    t.posY,
				    t.angleSet,
				    t.sprite.width * turret_multiplier(t.class),
				    t.sprite.height * turret_multiplier(t.class)
			    );
            }
        }

        // Draw shield
        if (this.shield.points > 0 && this.shield.opacity > 0)
        {
            if (this.shield.opacity < 1) cc.globalAlpha = this.shield.opacity;
            game.drawSprite(game.sprites["spr_shield"], this.x, this.y, point_direction(this.x, this.y, this.shield.x, this.shield.y), this.w * 1.3);
            if (this.shield.opacity < 1) cc.globalAlpha = 1;
        }

        // Make everything else 100% visible again
        if (cc.globalAlpha < 1 || this.shield.active) cc.globalAlpha = 1;
    }
};

////////// Artificial intelligence //////////
game.Ship.prototype.orders = function()
{
    if (this.command === "killing")
    {
        if (this.target)
        {
            let distance = point_distance(this.x, this.y, this.target.x, this.target.y);
            if (distance <= this.gravidar)
            {
                this.follow(this.target);

                if (this.target.hull > 0)
                {
                    if (! this.target.on_station)
                    {
                        var g = game.getNearest(this.target, game.entities.gates);
                        var distanceToGate = point_distance(this.target.x, this.target.y, g.x, g.y);

                        if (distanceToGate >= 500)
                        {
                            this.attack(this.target);
                        }
                        else { this.command = "search_enemies"; }
                    }
                    else { this.command = "search_enemies"; }
                }
                else { this.command = "search_enemies"; }
            }
            else this.command = "search_enemies";
        }
        else this.command = "search_enemies";
    }

    else if (this.command === "following")
    {
        if (this.target)
        {
            this.follow(this.target);
            if (! this.moving) this.command = "search_enemies";
        }
        else this.command = "search_enemies";
    }

    else if (this.command === "search_enemies")
    {
        this.moving = 0;
        this.rotating = 0;
        this.shooting = 0;

        this.target = this.random_destination();
        if (this.target) this.command = "following";
    }

    else if (this.command === "patrol")
    {
        if (this.waypoint)
        {
            let distance = point_distance(this.x, this.y, this.waypoint.x, this.waypoint.y);

            if (distance >= 100)
            {
                this.follow(this.waypoint);
            }
            else
            {
                let nextWaypoint = this.waypoints[this.waypoints.indexOf(this.waypoint) + 1];
                if (nextWaypoint)
                {
                    console.log("Next waypoint reached. Flying to the next one.", this.x, this.y);
                    this.waypoint = nextWaypoint;
                }
                else
                {
                    console.log("Last waypoint reached. Repeating the routine.", this.x, this.y);
                    this.waypoint = this.waypoints[0];
                }
            }

            // Shoot near enemies without disturbing the patrol
            if (this.nearestEnemy) this.attack(this.nearestEnemy);
        }
        else this.command = "search_enemies";
    }
};

// AI: Follow target
game.Ship.prototype.follow = function(_target)
{
    if (_target)
    {
        var distance = point_distance(this.x, this.y, _target.x, _target.y);
        var direction = point_direction(this.x, this.y, _target.x, _target.y);
        var direction_move = direction - this.angle;

        if (direction_move < 6) this.rotating = -1;
        if (direction_move > -6) this.rotating = 1;

        if (direction_move < 6 && direction_move > -6)
        {
            this.angle = direction;
            this.rotating = 0;
        }

        if (distance > (_target.w / 2) + (this.w * 1.5) + 10) this.moving = 1;
        else if (distance < (_target.w / 2) + (this.w * 1.5)) this.moving = -1;
        else this.moving = 0;

        this.mouseX = _target.x;
        this.mouseY = _target.y;
    }
    else this.command = "search_enemies";
};

// AI: Attack target
game.Ship.prototype.attack = function(_target)
{
    if (_target)
    {
        var distance = point_distance(this.x, this.y, _target.x, _target.y);

        if (distance < 500) this.shooting = 1;
        else this.shooting = 0;

        // Predict position of target
        var _t = [];
        _t.push(_target.x);
        _t.push(_target.y);

        var rad = _target.angle * pi180;
        _t[0] += Math.cos(rad) * (_target.mspeed * game.time.delta * 16);
        _t[1] += Math.sin(rad) * (_target.mspeed * game.time.delta * 16);

        this.mouseX = _t[0];
        this.mouseY = _t[1];
    }
};

// AI: Generate random target (as a destination)
game.Ship.prototype.random_destination = function()
{
    var sh = game.current.sector.size / 2.5;

    return { x: irandom_range(-sh, sh), y: irandom_range(-sh, sh), w: 0 }
};

// Pew pew
game.Ship.prototype.shoot = function()
{
    for (let turret of this.turrets)
    {
        if (turret.type !== null)
        {
            let db = game.db.items[turret.type];

            // Check if ship has enough energy
            if (this.generator >= db.consumption)
            {
                // Check if turret is ready
                if (game.time.now >= turret.next)
                {
			        turret.next = game.time.now + db.rate;

                    // Consume weapon energy
                    this.generator -= db.consumption;

                    let x = this.x + lengthdir_x(turret.distance, turret.angle + this.angle);
                    let y = this.y + lengthdir_y(turret.distance, turret.angle + this.angle);
                    //let direction = turret.angleSet;
                    //let direction = point_direction(x, y, this.mouseX, this.mouseY);
                    let direction = this.angle;
                    let bx = x + lengthdir_x(db.barrel * turret_multiplier(db.class), direction);
                    let by = y + lengthdir_y(db.barrel * turret_multiplier(db.class), direction);

                    game.Bullet.create
                    (
                        this.id,
                        bx,
                        by,
                        direction,
                        turret.type,
                        this.race,
                        db.class
                    );

                    // Play pew pew sound
                    if (point_distance(bx, by, game.camera.target.x, game.camera.target.y) <= 1000)
                    {
                        audio_play_sound(game.sounds[game.db.items[turret.type].sound]);
                    }

                    // Add shots to statistics
                    if (this.id === game.player.id) game.player.shots_fired += 1;

                    if (game.settings.particles)
                    {
                        new game.Fire_light
                        (
                            x + lengthdir_x((db.barrel / 1.7) * turret_multiplier(db.class), direction),
                            y + lengthdir_y((db.barrel / 1.7) * turret_multiplier(db.class), direction),
                            turret.type,
                            direction
                        );
                    }
                }
            }
        }
    }
};

// When struck, show hullbar for 3 seconds and activate shield
game.Ship.prototype.struck = function(x, y)
{
    let that = this;

    // Save position from shot
    this.shield.x = x;
    this.shield.y = y;

    // Activate shield
    this.shield.active = true;

    // Timeout: Deactivate shield
    game.clearTimer(this.timers.shield_timeout);
    this.timers.shield_timeout = setTimeout(function()
    {
        that.shield.active = false;
    }, 333);

    // Timeout: Show hull bar for 3 seconds
    this.show_hull = true;

    game.clearTimer(this.timers.struck_timer);
    this.timers.struck_timer = setTimeout(function()
    {
        that.show_hull = false;
    }, 3000);

    // Change sprite
    if (this.shield.points <= 0)
	{
		this.shield.points = 0;
		this.hit_opacity = 1;
	}
};

// Happens when the ship's hull is <= 0
game.Ship.prototype.destroy = function(id)
{
    // Create explosions, particles and wreck
    if (game.settings.particles)
    {
        new game.Explosion_wave(this);
        new game.Particle(this.x, this.y, "explosion", this.w);
    }

     // Leave items
     if (this.computer && irandom(100) <= 33)
     {
        if (this.ship === "n") new game.Item(this, this.x + irandom_range(-50, 50), this.y + irandom_range(-50, 50), "needle", 1, true);
        if (this.ship === "l") new game.Item(this, this.x + irandom_range(-50, 50), this.y + irandom_range(-50, 50), "needle", 2, true);
        if (this.ship === "p") { new game.Item(this, this.x + irandom_range(-50, 50), this.y + irandom_range(-50, 50), "needle", 3, true); new game.Item(this, this.x + irandom_range(-50, 50), this.y + irandom_range(-50, 50), "crystal", 1, true); }
        if (this.ship === "q") { new game.Item(this, this.x + irandom_range(-50, 50), this.y + irandom_range(-50, 50), "needle", 6, true); new game.Item(this, this.x + irandom_range(-50, 50), this.y + irandom_range(-50, 50), "crystal", 3, true); }
    }

    // Add credits
    if (game.player.ship.cargo.container.police && id === game.player.id) game.creditsAdd(this.hull_max / 20);

    // Vorrübergehend bis ich den enemySpawner gebacken kriege... Schiff entsteht woanders einfach neu
    if (this.computer)
    {
        new game.Ship(
        {
            "x": irandom_range(-game.current.sector.size / 2, game.current.sector.size / 2),
            "y": irandom_range(-game.current.sector.size / 2, game.current.sector.size / 2),
            "ship": this.ship,
            "race": this.race,
            "computer": true
        });
    }

    // Clear all timeouts and intervals
    for (var i in this.timers) game.clearTimer(this.timers[i]);
    for (var i in this.turrets) game.clearTimer(this.turrets[i].timer);

    // Destroy
    game.entities.ships.splice(game.entities.ships.indexOf(this), 1);

    // Update counter
    game.Ship.count -= 1;

    // Update sector map
    sectorMap();
    sectorMap();
};

// Counter
game.Ship.count = 0;

//----------------------------------------------------------------------------------------------------

// Let your weapons light up when they shoot
game.Fire_light = function(x, y, type, angle)
{
    var that = this;

    this.x = x;
    this.y = y;
    this.type = type;
    this.angle = angle;

    this.sprite = loadSprite(this, "sprite", "spr_bullet_" + this.type + "_fire");
    this.w = this.sprite.width;
    this.h = this.sprite.height;
    this.size = this.w * 1.5;

    // This and that
    game.entities.particles.push(this);

    // Update counter
    game.Particle.count += 1;
};

// Logic
game.Fire_light.prototype.update = function()
{
    if (this.size > 0) this.size -= game.time.delta * (this.w * 6);
    else
    {
        game.entities.particles.splice(game.entities.particles.indexOf(this), 1);

        // Update counter
        game.Particle.count -= 1;
    }
}

game.Fire_light.prototype.render = function()
{
    if (game.camera.inside(this)) game.drawSprite(this.sprite, this.x, this.y, this.angle, this.size);
};

//----------------------------------------------------------------------------------------------------

// Test: Creates ship wrecks of destroyed ships
game.Wreck_particle = function(x, y)
{
    var that = this;

    this.x = x;
    this.y = y;

    this.sprite = loadSprite(this, "sprite", choose("spr_wreck", "spr_wreck2", "spr_wreck2"));
    this.w = this.sprite.width;
    this.h = this.sprite.height;
    this.angle = irandom_range(-180, 180);
    this.mspd = irandom_range(20, 100);
    this.size = irandom_range(4, 8);
    this.opacity = 1;
    this.opacity_reduce = choose(0.5, 1);

    // This and that
    game.entities.particles.push(this);

    // Update counter
    game.Particle.count += 1;
};

// Logic
game.Wreck_particle.prototype.update = function()
{
    // Move
    this.x += Math.cos(this.angle) * (game.time.delta * this.mspd);
    this.y += Math.sin(this.angle) * (game.time.delta * this.mspd);

    // Make invisible - if invisible, destroy
    if (this.opacity > game.time.delta * this.opacity_reduce) this.opacity -= game.time.delta * this.opacity_reduce;
    else
    {
        game.entities.particles.splice(game.entities.particles.indexOf(this), 1);

        // Update counter
        game.Particle.count -= 1;
    }
};

// Draw it
game.Wreck_particle.prototype.render = function()
{
    if (game.camera.inside(this))
    {
        if (this.opacity < 1) cc.globalAlpha = this.opacity;
        game.drawSprite(this.sprite, this.x, this.y, this.angle, this.size);
        if (this.opacity < 1) cc.globalAlpha = 1;
    }
};

//----------------------------------------------------------------------------------------------------

// Bullet
game.Bullet = function(id, x, y, dest, type, race, size)
{
    let db = game.db.items[type];

    this.id = id;
    this.initx = x;
    this.inity = y;
    this.x = x;
    this.y = y;
    this.angle = dest;
    this.direction = dest * pi180;
    this.type = type;
    this.race = race;
    this.size = size;

    this.guid = irandom(999999);
    this.opacity = 1;

    this.sprite = loadSprite(this, "sprite", db.bulletSprite);
    this.w = this.sprite.width;
    this.h = this.sprite.height;

    this.created = game.time.now;

    // Turret size
    this.multiplier = turret_multiplier(this.size);

    this.range = db.range  * this.multiplier;
    this.edmg  = db.edmg   * this.multiplier;
    this.kdmg  = db.kdmg   * this.multiplier;
    this.mspd  = db.mspeed * this.multiplier;

    // This and that
    game.entities.bullets.push(this);

    // Update counter
    game.Bullet.count += 1;
};

// Logic
game.Bullet.prototype.update = function()
{
    // Moving
    let dt = game.time.delta * this.mspd;
    this.x += Math.cos(this.direction) * dt;
    this.y += Math.sin(this.direction) * dt;

    // Make it invisible
    var d = point_distance(this.x, this.y, this.initx, this.inity);
    if (d >= this.range * 0.8)
    {
        this.opacity -= game.time.delta * 10;
        if (this.opacity <= 0) this.opacity = 0;

        // Destroy when reaching end of range
        if (d >= this.range)
        {
            this.destroy();
        }
    }

    if (game.time.now >= this.created + 3000)
    {
        this.destroy();
    }
};

// Draw it
game.Bullet.prototype.render = function()
{
    // Only if inside viewport (improves performance)
    if (game.camera.inside(this))
    {
        if (this.opacity < 1) cc.globalAlpha = this.opacity;
        game.drawSprite(this.sprite, this.x, this.y, this.angle, this.w * this.multiplier, this.h * this.multiplier);
        if (this.opacity < 1) cc.globalAlpha = 1;
    }
};

// Destroy
game.Bullet.prototype.destroy = function()
{
    // Remove from game
    game.entities.bullets.splice(game.entities.bullets.indexOf(this), 1);

    // Add to pool
    game.entities.bulletsPool.push(this);

    // Update counter
    game.Bullet.count -= 1;
};

// Creates a bullet
game.Bullet.create = function(id, x, y, dest, type, race, size)
{
    let bin = game.entities.bulletsPool;
    if (bin.length > 0)
    {
        let existing = bin[bin.length - 1];
        game.entities.bullets.push(existing);

        let db = game.db.items[type];
        existing.id = id;
        existing.initx = x;
        existing.inity = y;
        existing.x = x;
        existing.y = y;
        existing.angle = dest;
        existing.direction = dest * pi180;
        existing.type = type;
        existing.race = race;
        existing.size = size;
        existing.opacity = 1;
        existing.created = game.time.now;

        existing.sprite = loadSprite(existing, "sprite", db.bulletSprite);
        existing.w = existing.sprite.width;
        existing.h = existing.sprite.height;

        existing.created = game.time.now;

        // Turret size
        existing.multiplier = turret_multiplier(existing.size);

        existing.range = db.range  * existing.multiplier;
        existing.edmg  = db.edmg   * existing.multiplier;
        existing.kdmg  = db.kdmg   * existing.multiplier;
        existing.mspd  = db.mspeed * existing.multiplier;

        // Play pew pew sound
        if (point_distance(existing.x, existing.y, game.camera.target.x, game.camera.target.y) <= 1000)
        {
            audio_play_sound(game.sounds[db.sound]);
        }

        // Add shots to statistics
        if (existing.id === game.player.id) game.player.shots_fired += 1;

        // Update counter
        game.Bullet.count += 1;

        bin.pop();
    }
    else
    {
        new game.Bullet(id, x, y, dest, type, race, size);
    }
};

// Counter
game.Bullet.count = 0;

//----------------------------------------------------------------------------------------------------

// Creates a rocket
game.Rocket = function(ship, mousex, mousey, type)
{
    var that = this;

    this.id = ship.id;
    this.x = ship.x;
    this.y = ship.y;
    this.type = type;

    this.angle = point_direction(this.x, this.y, mousex, mousey);
    this.ready = false;
    this.guid = irandom(999999);

    this.race = "blabla";

    this.duration = 10000;
    this.sprite = loadSprite(this, "sprite", game.db.items[this.type].sprite);
    this.kdmg = game.db.items[this.type].kdmg;
    this.edmg = game.db.items[this.type].edmg;
    this.mspd = game.db.items[this.type].mspeed;
    if (game.sounds[game.db.items[this.type].sound] === undefined) new game.Sound(game.db.items[this.type].sound);
    this.sound = game.sounds[game.db.items[this.type].sound];

    this.w = this.sprite.width;
    this.h = this.sprite.height;

    this.target = null;

    this.created = game.time.now;
    this.timerReady = this.created + 250;
    this.timerDestroy = this.created + this.duration;

    this.timers = {};

    // Play pew pew sound
    if (point_distance(this.x, this.y, game.camera.target.x, game.camera.target.y) <= 1000) audio_play_sound(this.sound, 0.5);

    // This and that
    game.entities.bullets.push(this);

    // Update counter
    game.Bullet.count += 1;
};

// Logic
game.Rocket.prototype.update = function()
{
    if (this.timerReady <= game.time.now)
    {
        this.ready = true;
    }

    if (this.timerDestroy <= game.time.now)
    {
        this.destroy();
    }

    // When ready, search for targets or take the target given as an argument
    if (this.ready) this.find_enemy();

    // Moving
    var rad = this.angle * pi180;
    this.x += Math.cos(rad) * (this.mspd * game.time.delta);
    this.y += Math.sin(rad) * (this.mspd * game.time.delta);

    if (this.target !== null) this.angle = point_direction(this.x, this.y, this.target.x, this.target.y);
};

// Drawing
game.Rocket.prototype.render = function()
{
    // Only if inside viewport (improves performance)
    if (game.camera.inside(this))
    {
        game.drawSprite(this.sprite, this.x, this.y, this.angle);

        // Create particle trail
        if (game.settings.particles) new game.Smoke_particle(this.x + irandom_range(-2, 2) + lengthdir_x(10, 180 + this.angle), this.y + irandom_range(-2, 2) + lengthdir_y(10, 180 + this.angle));
    }
};

// Find enemy
game.Rocket.prototype.find_enemy = function()
{
    var t = game.getNearest(this, game.entities.ships);
    if (t !== undefined)
    {
        this.target = t;
    }
};

// Destroy the rocket
game.Rocket.prototype.destroy = function()
{
    if (game.settings.particles) new game.Particle(this.x, this.y, 'explosion');
    game.clearTimer(this.timers.search_timer);
    game.clearTimer(this.timers.destroy_timer);

    game.entities.bullets.splice(game.entities.bullets.indexOf(this), 1);

    // Update counter
    game.Bullet.count -= 1;
};

//----------------------------------------------------------------------------------------------------

// Creates a particle engine
game.Engine = function(x, y, size)
{
    var that = this;

    this.x = x;
    this.y = y;
    this.size = size;

    this.sprite = loadSprite(this, "sprite", "spr_engine");
    this.w = this.sprite.width;
    this.h = this.sprite.height;
    this.opacity = 1;

    // Add to game
    game.entities.particles.push(this);

    // Update counter
    game.Particle.count += 1;

    return this;
};

// Logic
game.Engine.prototype.update = function()
{
    // Turn invisible
    if (this.opacity > 0)
    {
        this.opacity -= game.time.delta * 3;

        if (this.opacity < 0)
        {
            this.opacity = 0;
            this.destroy();
        }
    }
};

// Draw
game.Engine.prototype.render = function()
{
    if (game.camera.inside(this))
    {
        if (this.opacity < 1) cc.globalAlpha = this.opacity;
        game.drawSprite(this.sprite, this.x, this.y, 0, this.size);
        if (this.opacity < 1) cc.globalAlpha = 1;
    }
};

// Creates an engine particle
game.Engine.create = function(x, y, size, angle)
{
    var bin = game.entities.particlesPool;
    let existing = bin[bin.length - 1];

    if (existing !== undefined)
    {
        game.entities.particles.push(existing);

        existing.x = x;
        existing.y = y;
        existing.size = size;
        existing.angle = angle;

        existing.sprite = loadSprite(existing, "sprite", "spr_engine");
        existing.w = existing.sprite.width;
        existing.h = existing.sprite.height;
        existing.opacity = 1;
        existing.sizeMin = existing.size / 10;

        // Update counter
        game.Particle.count += 1;

        bin.pop();

        return existing;
    }
    else
    {
        return new game.Engine(x, y, size, angle);
    }
};

// Destroy
game.Engine.prototype.destroy = function()
{
    game.entities.particles.splice(game.entities.particles.indexOf(this), 1);
    game.entities.particlesPool.push(this);

    // Update counter
    game.Particle.count -= 1;
};

//----------------------------------------------------------------------------------------------------

// Creates a particle
game.Particle = function(x, y, type, size)
{
    var that = this;

    this.x = x;
    this.y = y;
    this.type = type;
    this.size = size;

    var sprite = "";
    if (size !== undefined) { this.size = size; this.size_max = size * 2 }
    else { this.size = irandom_range(2, 8); this.size_max = irandom_range(20, 25);  }

        if (this.type === "explosion")
        {
            sprite = "spr_explosion";
            this.growing_speed = 2;
        }
    else if (this.type === "shield")
    {
        sprite = "spr_shield";
        this.growing_speed = 5;
    }
    this.sprite = loadSprite(this, "sprite", sprite);

    this.w = this.sprite.width;
    this.h = this.sprite.height;
    this.angle = irandom_range(-180, 180);
    this.opacity = 1;

    // This and that
    game.entities.particles.push(this);

    // Update counter
    game.Particle.count += 1;
};

// Logic
game.Particle.prototype.update = function()
{
    // Expand and then make invisible
    this.size += game.time.delta * 90;
    if (this.size >= this.size_max)
    {
        this.opacity -= this.growing_speed * game.time.delta;

        // Destroy it if its not visible anymore
        if (this.opacity <= 4 * game.time.delta)
        {
            game.entities.particles.splice(game.entities.particles.indexOf(this), 1);

            // Update counter
            game.Particle.count -= 1;
        }
    }
};

 // Draw it
game.Particle.prototype.render = function()
{
    if (game.camera.inside(this))
    {
        if (this.opacity < 1) cc.globalAlpha = this.opacity;
        game.drawSprite(this.sprite, this.x, this.y, this.angle, this.size);
        if (this.opacity < 1) cc.globalAlpha = 1;
    }
};

// Counter
game.Particle.count = 0;

// Creates a smoke particle
game.Smoke_particle = function(x, y)
{
    var that = this;

    this.x = x;
    this.y = y;
    this.sprite = loadSprite(this, "sprite", "spr_smoke");

    this.w = this.sprite.width;
    this.h = this.sprite.height;
    this.angle = irandom_range(-180, 180);
    this.size = 5;
    this.opacity = 0.6;

    // This and that
    game.entities.particles.push(this);

    // Update counter
    game.Particle.count += 1;
};

// Logic
game.Smoke_particle.prototype.update = function()
{
    // Expand and then make invisible
    this.size += game.time.delta * 15;
    this.opacity -= game.time.delta * 0.33;

    if (this.opacity <= game.time.delta)
    {
        game.entities.particles.splice(game.entities.particles.indexOf(this), 1);

        // Update counter
        game.Particle.count -= 1;
    }
};

// Draw it
game.Smoke_particle.prototype.render = function()
{
    if (game.camera.inside(this))
    {
        if (this.opacity < 1) cc.globalAlpha = this.opacity;
        game.drawSprite(this.sprite, this.x, this.y, this.angle, this.size);
        if (this.opacity < 1) cc.globalAlpha = 1;
    }
};

//----------------------------------------------------------------------------------------------------

// Creates an explosion shock wave
game.Explosion_wave = function(data)
{
    var that = this;

    this.x = data.x;
    this.y = data.y;
    this.sprite = loadSprite(this, "sprite", "spr_explosion_wave");
    this.size = 10;
    this.size_max = this.sprite.width * 2;
    this.w = this.sprite.width;
    this.h = this.sprite.height;
    this.opacity = 1;

    if (game.camera.inside(this))
    {
        // Play explosion sound
        audio_play_sound(game.sounds["snd_explosion"]);

        // Start Screen shaking :D
        if (! game.player.ship.on_station && this.size_max >= 200)
        {
            screen_shaking = true;
            setTimeout(function() { screen_shaking = false; }, 1000);
        }
    }

    // This and that
    game.entities.particles.push(this);

    // Update counter
    game.Particle.count += 1;
};

// Logic
game.Explosion_wave.prototype.update = function()
{
    if (this.opacity > 0)
    {
        this.size += game.time.delta * this.size_max;
        this.opacity -= game.time.delta;

        if (this.opacity < 0) this.opacity = 0;
    }
    else
    {
        game.entities.particles.splice(game.entities.particles.indexOf(this), 1);

        // Update counter
        game.Particle.count -= 1;
    }
};

// Draw it
game.Explosion_wave.prototype.render = function()
{
    if (game.camera.inside(this))
    {
        if (this.opacity < 1) cc.globalAlpha = this.opacity;
        game.drawSprite(this.sprite, this.x, this.y, false, this.size);
        game.drawSprite(this.sprite, this.x, this.y, false, this.size / 2);
        if (this.opacity < 1) cc.globalAlpha = 1;
    }
};

//----------------------------------------------------------------------------------------------------

// Creates a Gate
game.Gate = function(data)
{
    var that = this;

    // Set ship data with given values
    for (var i in data) { this[i] = data[i]; }

    if (this.id === undefined)          this.id = "east";
    if (this.x === undefined)           this.x = 0;
    if (this.y === undefined)           this.y = 0;
    if (this.destination === undefined) this.destination = { sector: game.current.sector.id, x: this.x, y: this.y };

    // Generate unique gate id
    this.uid = game.db.stations.gate.token + this.id.substring(1, 0).toUpperCase() + random_character(2) + "-" + irandom_range(0, 99);

    this.guid = irandom(999999);

    this.iangle = 0;
    this.iangle2 = 90;

    this.sprite = loadSprite(this, "sprite", "spr_station_gate");
    this.sprite2 = loadSprite(this, "sprite2", "spr_station_gate_swirl");

    var spriteMinimap = "spr_map_station_gate_n";
    switch(this.id)
    {
        case "north": spriteMinimap = "spr_map_station_gate_n"; break;
        case "east":  spriteMinimap = "spr_map_station_gate_o"; break;
        case "south": spriteMinimap = "spr_map_station_gate_s"; break;
        case "west":  spriteMinimap = "spr_map_station_gate_w"; break;
    }
    this.sprite_minimap = loadSprite(this, "sprite_minimap", spriteMinimap);

    this.w = this.sprite.width;
    this.h = this.sprite.height;

    this.name = this.name = string("station_gate_" + this.id) + " " + string("station_gate") + " (" + game.db.sectors[this.destination.sector].name+ ")";

    this.active = false;
    this.player_in_range = false;

    // This and that
    game.entities.gates.push(this);

    // Update counter
    game.Gate.count += 1;
};

// Logic
game.Gate.prototype.update = function()
{
    this.iangle -= game.time.delta * 45;
    this.iangle2 -= game.time.delta * 90;

    this.active = false;
    this.player_in_range = false;

    // When player flys by, activate
    var i = game.entities.players.length;
    while (i--)
    {
        var p = game.entities.players[i];
        let d = point_distance(this.x, this.y, p.x, p.y);

        if (d <= 500)
        {
            this.player_in_range = true;

            if (d <= 120)
            { this.active = true; }
        }
    }

    if (this.active)
    {
        game.drawText(string("gate_press_j"), game.camera.x + game.camera.w / 2, game.camera.y + game.camera.h - 140, "bold 30px Arial", game.color.white, "center", true);
    }
};

// Draw it
game.Gate.prototype.render = function()
{
    // If active, draw swirls and start sector travel (not implemented yet)
    if (game.camera.inside(this))
    {
        if (this.player_in_range)
        {
            game.drawCircle(this.x, this.y, 150, "rgba(0, 192, 255, 0.2)", true);
        }

        if (this.active)
        {
            game.drawSprite(this.sprite2, this.x, this.y, this.iangle); // Swirl
            game.drawSprite(this.sprite2, this.x, this.y, this.iangle2); // Swirl
        }

        game.drawSprite(this.sprite, this.x, this.y);
    }
};

// Counter
game.Gate.count = 0;

//----------------------------------------------------------------------------------------------------

// Creates a station
game.Station = function(data)
{
    var that = this;

    // Set ship data with given values
    for (var i in data) { this[i] = data[i]; }

    if (this.x === undefined)     this.x = 0;
    if (this.y === undefined)     this.y = 0;
    if (this.type === undefined)  this.type = "trading_station";
    if (this.race === undefined)  this.race = "terran";

    var dbStation = game.db.stations[this.type];

    // Name and ID
    this.id = irandom(999999);
    this.uid = game.db.races[this.race].token + dbStation.token + random_character(2) + "-" + irandom(99);

    // Sprites
    this.angle = 0;
    this.sprite = game.sprites["x"];
    this.sprite_minimap = game.sprites["x"];
    this.w = dbStation.width;//this.sprite.width;
    this.h = dbStation.height;//this.sprite.height;

    this.factory = dbStation.factory;
    this.name = this.name = string("race_" + this.race) + " " + string("station_" + this.type);

    // Stock
    this.stock = [];
    for (var i in dbStation.items.stock)
    {
        var ware = { name: i, quantity: dbStation.items.stock[i] }
        this.stock.push(ware);
    }

    // Station lights
    this.anim_distance = 272;
    this.anim_thingies = 8;

    this.lights = function()
    {
        var i = this.anim_thingies;
        while (i--)
        {
            game.Engine.create(this.x + lengthdir_x(this.anim_distance, this.angle + (i * (360 / this.anim_thingies))), this.y + lengthdir_y(this.anim_distance, this.angle + (i * (360 / this.anim_thingies))), 50);
        }
    }

    // Object for collecting all timers for easy stopping of all of them
    this.timers = {};

    if (this.type === "equipment_dock")
    {
        this.timers.anim_timer = setInterval(function()
        {
            if (game.settings.particles)
            {
                if (game.camera.inside(that))
                {
                    that.lights();
                }
            }
        }, 1000);
    }

    // Test: If station is a factory start production
    if (this.factory)
    {
        // Create production timer
        this.timers.production = setInterval(function()
        {
            var sl = that.stock.length;
            for (var i = 0; i < sl; i++)
            {
                var needed_ware = that.stock[i];

                // Checks if needed item is available
                if (needed_ware.name === dbStation.items.needs && needed_ware.quantity >= dbStation.items.needs_quantity)
                {
                    for (var j = 0; j < sl; j++)
                    {
                        var produced_ware = that.stock[j];

                        if (produced_ware.name === dbStation.items.produces)
                        {
                            // Produce item, remove quantity of needed item
                            needed_ware.quantity -= dbStation.items.needs_quantity;
                            produced_ware.quantity += dbStation.items.produces_quantity;
                        }
                    }
                }
            }
        }, dbStation.items.production_time);
    }

    // Create moving "Dock" object
    if (this.type === "equipment_dock")
    {
        this.info = { x: this.x, y: this.y + 80, sprite: loadSprite(this.info, "sprite", "spr_station_equipment_dock_info"), moving: 1 }
    }

    // This and that
    game.entities.stations.push(this);

    // Update counter
    game.Station.count += 1;
};

// Logic
game.Station.prototype.update = function()
{
    // Rotate
    this.angle += game.time.delta * 0.5;

    this.player_on_station = false;

    // Check for near players
    var i = game.entities.players.length;
    while (i--)
    {
        var _player_ = game.entities.players[i];
        var distance = point_distance(this.x, this.y, _player_.x, _player_.y);

        // Load sprite on sight. Awesome! :)
        if (distance <= this.w)
        {
            var s = game.db.stations[this.type].sprite;
            this.sprite = loadSprite(this, "sprite", s);
        }

        // Load minimap sprite if players gravidar should show it :)
        if (distance <= game.player.ship.gravidar)
        {
            var s = game.db.stations[this.type].sprite_minimap;
            this.sprite_minimap = loadSprite(this, "sprite_minimap", s);
        }

        // Stuff
        if (distance <= this.w / 2)
        {
            this.player_on_station = true;

            if (_player_ === game.player.ship) Dock = this;

            // Power up ship
            if (game.player.credits >= 1 && _player_.hull < _player_.hull_max)
			{
				game.creditsRemove(1);
				_player_.hull += 50;
				if (_player_.hull > _player_.hull_max) _player_.hull = _player_.hull_max;
			}

            if (_player_.shield.points < _player_.shield.points_max)
			{
				_player_.shield.points += _player_.shield.points_max/60;
				if (_player_.shield.points > _player_.shield.points_max) _player_.shield.points = _player_.shield.points_max;
			}

            if (_player_.generator < _player_.generator_max)
			{
				_player_.generator += 10;
				if (_player_.generator > _player_.generator_max) _player_.generator = _player_.generator_max;
			}
        }
    }
};

// Draw it
game.Station.prototype.render = function()
{
    if (game.camera.inside(this))
    {
        game.drawSprite(this.sprite, this.x, this.y, this.angle);

        if (this.type === "equipment_dock")
        {
            game.drawSprite(this.info.sprite, this.info.x, this.info.y);

            // Move info thingy
            if (this.info.y <= this.y + 90) this.info.moving = 1;
            if (this.info.y >= this.y + 110) this.info.moving = 0;
            if (this.info.moving === 1) this.info.y += 60 * game.time.delta;
            else if (this.info.moving === 0) this.info.y -= 120 * game.time.delta;
        }
    }
};

// Update counter
game.Station.count = 0;

//----------------------------------------------------------------------------------------------------

// Creates an asteroid
game.Asteroid = function(x, y, size)
{
    this.x = x;
    this.y = y;
    if (size !== undefined) { this.size = size } else { this.size = choose(1, 2, 3) }

    // Apply sprite and hull depending on given size
    var sprite = "";
    var size = 0;
    var hull = 0;
    var ores = 0;
    switch(this.size)
    {
        case 1: sprite = "spr_asteroid_s"; size = 36;  hull = 15000;  ores = irandom_range(1, 10); break;
        case 2: sprite = "spr_asteroid_m"; size = 74;  hull = 40000;  ores = irandom_range(11, 25); break;
        case 3: sprite = "spr_asteroid_l"; size = 148; hull = 100000; ores = irandom_range(26, 50); break;
    }
    this.sprite = loadSprite(this, "sprite", sprite);
    this.w = size;//this.sprite.width;
    this.h = size;//this.sprite.height;
    this.mass = size;
    this.sprite_minimap = loadSprite(this, "sprite_minimap", "spr_map_asteroid");

    this.hull = hull;
    this.ores = ores;

    // Basic data
    this.name = this.name = "Asteroid";
    this.uid = "AS" + random_character(2) + "-" + irandom_range(0, 99);;
    this.angle = this.direction = irandom(359);
    this.image_rotation = choose("left", "right");
    this.mspd = this.mspeed = (4 - this.size) / 4 * 20;

    this.velocity = { x: 0, y: 0 };

    // This and that
    game.entities.asteroids.push(this);

    // Update counter
    game.Asteroid.count += 1;
};

// Logic
game.Asteroid.prototype.update = function()
{
    // Rotate it
    switch(this.image_rotation)
    {
        case "left":  this.angle -= game.time.delta * this.mspd; break;
        case "right": this.angle += game.time.delta * this.mspd; break;
    }

    // Collision with bullets
    var i = game.entities.bullets.length;
    while (i--)
    {
        var bullet = game.entities.bullets[i];

        if (point_distance(this.x, this.y, bullet.x, bullet.y) <= this.w / 2)
        {
            // Play explosion sound
            if (game.camera.inside(this) && point_distance(this.x, this.y, game.camera.target.x, game.camera.target.y) <= 1000)
            {
                audio_play_sound(game.sounds["snd_hull"]);
            }

            // Detonation particles
            if (game.settings.particles)
            {
                new game.Wreck_particle(bullet.x, bullet.y);
                new game.Particle(bullet.x, bullet.y, "explosion");
            }

            // Damage
            this.hull -= bullet.kdmg;
            if (this.hull <= 0) this.destroy();

            bullet.destroy();
        }
    }

    // Worlds end
	var s = game.current.sector.size / 2;

    if (this.x >= s - 50)  this.x = s - 50;
    if (this.y >= s - 50)  this.y = s - 50;
    if (this.x <= -s + 50) this.x = -s + 50;
    if (this.y <= -s + 50) this.y = -s + 50;
};

// Draw it
game.Asteroid.prototype.render = function()
{
    if (game.camera.inside(this))
    {
        game.drawSprite(this.sprite, this.x, this.y, this.angle);
    }
};

game.Asteroid.prototype.destroy = function()
{
    if (game.settings.particles)
    {
        new game.Explosion_wave(this);
    }

    // Create new smaller asteroids and calculate chances of dropping items
    switch (this.size)
    {
        case 2:
        {
            for (var i = 3; i--;) new game.Asteroid(irandom_range(this.x - (this.w / 4), this.x + (this.w / 4)), irandom_range(this.y - (this.h / 4), this.y + (this.h / 4)), 1);
            break;
        }
        case 3:
        {
            for (var i = 3; i--;) new game.Asteroid(irandom_range(this.x - (this.w / 4), this.x + (this.w / 4)), irandom_range(this.y - (this.h / 4), this.y + (this.h / 4)), 2);
            break;
        }
    }

    // Create items
    if (irandom(100) <= 75)
    {
        new game.Item(this, this.x + irandom_range(-(this.w / 4), this.w / 4), this.y + irandom_range(-(this.h / 4), this.h / 4), "ore", this.ores, false);
    }

    // Destroy
    game.entities.asteroids.splice(game.entities.asteroids.indexOf(this), 1);

    // Update counter
    game.Asteroid.count -= 1;
};

game.Asteroid.count = 0;

//----------------------------------------------------------------------------------------------------

// Creates a collectable item
game.Item = function(obj, x, y, item, amount, container, excluded)
{
    var that = this;

    this.direction = irandom_range(obj.angle - 18, obj.angle + 18);
    this.mspeed = this.slowdown = irandom_range(obj.mspeed / 1.5, obj.mspeed * 1.5);

    this.x = x;
    this.y = y;
    this.item = item;
    this.amount = amount;
    this.container = container;
    if (excluded !== undefined) { this.excluded = excluded; } // Players prohibited to pickup the item

    // Stuff
    this.name = string("item_" + item);
    this.weight = game.db.items[this.item].size;
    this.class = game.db.items[this.item].class;
    this.move_to_player = false;
    this.collectable = true;
    this.vanish = false;
    this.timeToVanish = game.time.now + 30000;

    // Sprite
    var sprite = "";
    if (this.container) sprite = "spr_item_container";
    else sprite = "spr_item_" + this.item;

    this.sprite = loadSprite(this, "sprite", sprite);
    this.w = this.sprite.width;
    this.h = this.sprite.height;
    this.sprite_minimap = loadSprite(this, "sprite_minimap", "spr_map_item");
    this.angle = irandom(359);
    this.opacity = 1;

    this.timers = {};

    // This and that
    game.entities.items.push(this);

    // Update counter
    game.Item.count += 1;
};

// Logic
game.Item.prototype.update = function()
{
    if (this.timeToVanish < game.time.now)
    {
        this.vanish = true;
    }

    if (this.excluded)
    {
        if (game.time.now <= this.created + 10000)
        {
            delete this.excluded;
        }
    }

    // Move
    var rad = this.direction * pi180;
    this.x += Math.cos(rad) * (this.mspeed * game.time.delta);
    this.y += Math.sin(rad) * (this.mspeed * game.time.delta);

    // Get slower
    if (this.mspeed > 0) this.mspeed -= game.time.delta * (this.slowdown / 5);
    else this.mspeed = 0;

        var player_nearest = game.getNearest(this, game.entities.players);
        var player_distance = point_distance(this.x, this.y, player_nearest.x, player_nearest.y);
        var player_cargo = player_nearest.cargo.size - player_nearest.cargo.hold;
        var player_cargo_class = player_nearest.cargo.class;

        // If the chosen player is near enough, stop checking and start moving to the player
        if (this.move_to_player)
        {
            var distance_to_collector = point_distance(this.x, this.y, this.collector.x, this.collector.y);

            // If in range of chosen player's tractor range
            if ( (game.player.ship.cargo.container.tractor || game.db.items[this.item].type === "data") && distance_to_collector <= this.collector.tractor.range)
            {
                let speed = this.collector.tractor.speed;
                if (game.db.items[this.item].type === "data") speed = this.collector.tractor.speed * 2;

                var direction = point_direction(this.x, this.y, this.collector.x, this.collector.y) * pi180;
                this.x += Math.cos(direction) * (speed * game.time.delta);
                this.y += Math.sin(direction) * (speed * game.time.delta);
            }
            // If not, abort everything
            else
            {
                this.opacity = 1;
                this.vanish = false;
                this.timeToVanish = game.time.now + 10000;

                this.collectable = true;
                this.move_to_player = false;
            }

            // If the chosen player is on the ship, collect
            if (distance_to_collector <= this.collector.w / 2)
            {
                if (game.player.ship === this.collector)
                {
                    audio_play_sound(game.sounds["snd_item"]);
                    if (game.db.items[this.item].type !== "data") new game.Popup(this.item, this.amount);
                }
                if (game.db.items[this.item].type === "data")
                {
                    game.cargoAdd(this.collector, this.item, this.amount, true);
                }
                else game.cargoAdd(this.collector, this.item, this.amount, false);
                game.clearTimer(this.timers.vanish_timer);
                this.destroy();
            }
        }

        if (this.collectable && player_nearest !== this.excluded)
        {
            // If this item is near enough for the player to pick up and if player has enough space, start moving to it
            if (player_distance <= player_nearest.tractor.range && player_cargo >= this.weight && player_cargo_class >= this.class)
            { this.collect(player_nearest); }
        }

        // Rotate it
        this.angle += game.time.delta * 20;

        // Let it vanish
        if (this.vanish)
        {
            if (this.opacity > game.time.delta * 2) this.opacity -= game.time.delta * 2;
            else
            {
                for (var i in this.timers) { game.clearTimer(this.timers[i]) }
                this.destroy();
            }
        }
};

// Draw it
game.Item.prototype.render = function()
{
    if (game.camera.inside(this))
    {
        if (this.opacity < 1) cc.globalAlpha = this.opacity;
        game.drawSprite(this.sprite, this.x, this.y, this.angle);
        if (this.opacity < 1) cc.globalAlpha = 1;

        // If moving to player, draw circle and lines
        if (game.player.ship.cargo.container.tractor && this.move_to_player)
        {
            game.drawLine(this.x, this.y, this.collector.x, this.collector.y, "rgba(0, 255, 255, 0.2)", 5)
            game.drawLine(this.x, this.y, this.collector.x, this.collector.y, "rgba(255, 255, 255, 0.2)", 2)
            game.drawCircle(this.x, this.y, this.w, "rgba(0, 255, 255, 0.1)", true);
        }
    }
};

// When a player wants to collect the item
game.Item.prototype.collect = function(obj)
{
    game.clearTimer(this.vanish_timer);
    this.collectable = false;
    this.collector = obj;
    this.move_to_player = true;
};

// Removing
game.Item.prototype.destroy = function()
{
    game.entities.items.splice(game.entities.items.indexOf(this), 1);

    // Update counter
    game.Item.count -= 1;
};

// Counter
game.Item.count = 0;

//----------------------------------------------------------------------------------------------------

// Creates a item popup above the player
game.Popup = function(item, amount)
{
    // Given parameters
    this.item = item;
    this.amount = amount;

    // Stuff
    this.x = game.player.ship.x;
    this.starty = this.y = game.player.ship.y;
    this.opacity = 1;

    // Add to game
    game.entities.particles.push(this);

    // Update counter
    game.Particle.count += 1;
};

// Logic
game.Popup.prototype.update = function()
{
    // Move up
    this.y -= game.time.delta * 50;

    if (this.y - this.starty < -50) this.opacity -= game.time.delta * 2;
    if (this.opacity <= game.time.delta * 2)
    {
        game.entities.particles.splice(game.entities.particles.indexOf(this), 1);

        // Update counter
        game.Particle.count -= 1;
    }
};

// Draw it
game.Popup.prototype.render = function()
{
    // Draw
    if (game.camera.inside(this))
    {
        if (this.opacity < 1) cc.globalAlpha = this.opacity;
        game.drawText("+" + this.amount + " " + string("item_" + game.db.items[this.item].token), this.x, this.y, "bold 10pt Arial", game.color.cyan, "center",   false);
        if (this.opacity < 1) cc.globalAlpha = 1;
    }
};
