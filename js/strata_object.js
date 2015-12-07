define(['js/lib/vector2.js'], function(Vector2) {
    "use strict";

    function StrataObject(id, tile, container, path) {
        this.id = id;
        this.tags = new Set();
        this.container = container;

        this.dna = {
            maxHealth : 100,
            deathRate : .15
        };

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

    }
    
    StrataObject.prototype.update = function(deltaTime) {

        this.health -= this.dna.deathRate;
        if (this.health <= 0) {
            this.die();
        }
    }
    


    StrataObject.prototype.onDown = function() {
        game.showStatsFor(this.id);
    }

    StrataObject.prototype.moveToTile = function(tile) {
        this.currentTile.exit(this);
        tile.enter(this);

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

    StrataObject.prototype.die = function() {
        game.removeObject(this);
        this.container.removeChild(this.sprite);

        this.currentTile.exit(this);
    }


    StrataObject.prototype._log = function(message) {
        var textarea = document.getElementById("console-text");
        textarea.textContent = message + "\n";
        textarea.scrollTop = textarea.scrollHeight;
    }

    StrataObject.prototype.getStats = function() {
        var message = "id: " + this.id + 
        " | tile index: (" + 
            Math.floor(this.currentTile.index.x) + "," + Math.floor(this.currentTile.index.y) 
        + ") | Health: " + Math.round(this.health * 100) / 100;

        return message;
    };

    return StrataObject;
});