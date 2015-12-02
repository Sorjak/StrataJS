define(['js/lib/vector2.js'], function(Vector2) {
    "use strict";

    function StrataObject(id, tile, path, scale, anchor) {
        this.id = id;
        this.tags = new Set();

        this.dna = {
            maxHealth : 100,
        };

        this.health = this.dna.maxHealth;

        this.initSprite(new PIXI.Point(tile.position.x, tile.position.y), path, scale, anchor);
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

    StrataObject.prototype.initSprite = function(pos, path, scale, anchor) {
        this.sprite = new PIXI.Sprite.fromImage(path);

        this.sprite.position = pos;

        this.sprite.scale = typeof scale !== 'undefined' ? scale : new PIXI.Point(.1, .1);
        this.sprite.anchor = typeof anchor !== 'undefined' ? anchor : new PIXI.Point(0, 0);

        this.sprite.interactive = true;

        ENTITY_CONTAINER.addChild(this.sprite);
    }

    StrataObject.prototype.draw = function() {

    }
    
    StrataObject.prototype.update = function(deltaTime) {
        if (this.health <= 0) {
            this.die();
        }
    }
    


    StrataObject.prototype.onDown = function() {
        var message = "id: " + this.id + 
        " | tile index: (" + 
            Math.floor(this.currentTile.index.x) + "," + Math.floor(this.currentTile.index.y) 
        + ") | Health: " + this.health + "\nDNA INFO: \n";



        var curr_dna = this.dna;
        for (var key in curr_dna) {
            if (curr_dna.hasOwnProperty(key)) {
                message += key + " : " + curr_dna[key] + "\n";
            }
        }
        this._log(message);
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
        ENTITY_CONTAINER.removeChild(this.sprite);

        this.currentTile.exit(this);
    }


    StrataObject.prototype._log = function(message) {
        var textarea = document.getElementById("console-text");
        textarea.textContent = message + "\n";
        textarea.scrollTop = textarea.scrollHeight;
    }


    return StrataObject;
});