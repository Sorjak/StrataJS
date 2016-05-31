define(['js/lib/vector2.js'], function(Vector2) {
    "use strict";

    function StrataObject(id, tile, container, path) {
        this.id = id;
        this.tags = new Set();
        this.container = container;

        this.dna = {
            max_health      : 100,
            max_energy      : 100,
            death_threshold : 100,
            metabolism      : 0.1,
            sex_drive       : 0.1,
            fatigue_rate    : 0.1
        };

        this.health = this.dna.max_health;
        this.energy = this.dna.max_energy;

        this.age = 0;
        this.check_age_time = 10; // check every ten seconds
        this.check_age_timer = 0;

        this.fatigue    = 0;
        this.desire     = 0;

        this.initSprite(new PIXI.Point(tile.position.x, tile.position.y), path);
        this.rotation = this.sprite.rotation;
        this.currentTile = tile;
        this.currentTile.enter(this);

        var myObj = this;

        this.sprite.on('mousedown', function() {
            myObj.onDown();
        });
        this.sprite.on('touchstart', function() {
            myObj.onDown();
        });
        
    };

    StrataObject.prototype.initSprite = function(pos,  path) {
        this.sprite = new PIXI.Sprite.fromImage(path);

        this.sprite.position = pos;

        this.sprite.interactive = true;

        this.container.addChild(this.sprite);
    }

    StrataObject.prototype.draw = function() {
        if (game.statObject == this) {
            game.graphics.lineStyle (1, 0xFF0000, 1);
            game.graphics.drawRect(
                this.sprite.position.x, 
                this.sprite.position.y, 
                this.sprite.width,
                this.sprite.height
            );
        }
    }
    
    StrataObject.prototype.update = function(deltaTime) {

        // if (this.energy <= this.startEnergy) {
        //     var t =  1 - (this.energy / this.startEnergy);
        //     var deathRate = this.cubicBezier(
        //         new Vector2(0, this.baseDeathRate),
        //         new Vector2(1.04, .024),
        //         new Vector2(.985, -.08),
        //         new Vector2(1, .5),
        //         t
        //     );
        //     this.health -= deathRate.y;
        // } else {
        //     this.health -= this.baseDeathRate;
        // }

        this.age     += .003;
        this.energy  = Math.max(this.energy - this.dna.metabolism, 0);
        this.fatigue = Math.min(this.fatigue + this.dna.fatigue_rate, 100);
        this.desire  = Math.min(this.desire + this.dna.sex_drive, 100);

        this.checkOldAge(deltaTime);

        if (this.health <= 0) {
            this.die();
        }
    }
    


    StrataObject.prototype.onDown = function() {
        game.showStatsFor(this.id);
        console.log(this);
    }

    StrataObject.prototype.moveToTile = function(tile) {
        this.currentTile.exit(this);
        tile.enter(this);
        // this.energy = Math.max(this.energy - tile.weight, 0);

        this.currentTile = tile;

        this.sprite.position.x = this.currentTile.position.x; 
        this.sprite.position.y = this.currentTile.position.y;
    }

    StrataObject.prototype.mutate = function(dna) {
        var new_dna = {};
        for (var key in dna) {
            if (dna.hasOwnProperty(key)) {
                
                var mutatedValue = Math.random() * 2;
                mutatedValue = Math.max(mutatedValue, .80);
                mutatedValue = Math.min(mutatedValue, 1.2);

                if (mutatedValue > 0) {
                    new_dna[key] = dna[key] * mutatedValue
                } else {
                    new_dna[key] = dna[key];
                }
            }
        }

        return new_dna;
    }

    StrataObject.prototype.checkOldAge = function(deltaTime) {
        if (this.check_age_timer > this.check_age_time) {

            if (this.age > this.dna.death_threshold) {
                var num = Math.random();

                if (num < .20) {
                    this.die();
                }
            }
        } else {
            this.check_age_timer += deltaTime;
        }
    }

    StrataObject.prototype.die = function() {
        this.currentTile.exit(this);
        game.removeObject(this);
        this.container.removeChild(this.sprite);
    }


    StrataObject.prototype._log = function(message) {
        var textarea = document.getElementById("console-text");
        textarea.textContent = message + "\n";
        textarea.scrollTop = textarea.scrollHeight;
    }

    StrataObject.prototype.getStats = function() {
        var message = "id: " + this.id + 
        " | tile: (" + 
            Math.floor(this.currentTile.index.x) + "," + Math.floor(this.currentTile.index.y) 
        + ") | Age: " + Math.round(this.age) + " | Energy: " + Math.round(this.energy);

        return message;
    };

    StrataObject.prototype.cubicBezier = function(p0, p1, p2, p3, t) {
        var u = (1 - t);
        var tt = t*t;
        var uu = u*u;
        var uuu = uu * u;
        var ttt = tt * t;

        var p = p0.multiplyScalar(uuu).clone();
        p.add( p1.multiplyScalar(3 * uu * t) ); //second term
        p.add( p2.multiplyScalar(3 * u * tt) ); //third term
        p.add( p3.multiplyScalar(ttt) ); //fourth term

        return p;
    };

    return StrataObject;
});