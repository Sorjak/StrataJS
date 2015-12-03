define(['js/strata_object.js'], function(StrataObject) {
    "use strict";

    function MovingObject(id, tile, path) {
        StrataObject.call(this, id, tile, path);
        
        this.sprite.width = TILE_SIZE;
        this.sprite.height = TILE_SIZE;

        this.dna.moveSpeed = 30;
        this.movePath = null;
        this.moveIndex = 1;
        this.moveFrame = 0;
        // this.targetTile = null;
    };

    MovingObject.prototype = Object.create(StrataObject.prototype);
    MovingObject.prototype.constructor = MovingObject;

    // OVERRIDES

    MovingObject.prototype.update = function(deltaTime) {
        if (this.movePath != null) {
            
            if (this.currentTile != this.movePath[this.movePath.length - 1]) {
                var nextTile = this.movePath[this.moveIndex + 1];
                
                if (this.moveFrame < this.dna.moveSpeed) {
                    this.moveFrame += deltaTime;
                    this.lerpSprite(nextTile, (this.moveFrame / this.dna.moveSpeed));
                    
                } else {
                    this.moveToTile(nextTile);
                }

            } else {
                this.movePath = null;
            }
        }

        StrataObject.prototype.update.call(this, deltaTime);
    };

    MovingObject.prototype.draw = function() {
        

        StrataObject.prototype.draw.call(this);
    };

    MovingObject.prototype.onDown = function() {


        StrataObject.prototype.onDown.call(this);
    };

    MovingObject.prototype.moveToTile = function(tile) {
        // potentially make this a tween.
        
        this.moveFrame = 0;
        this.moveIndex++;

        StrataObject.prototype.moveToTile.call(this, tile);
    }

    MovingObject.prototype.getStats = function() {
        var message = "";

        return StrataObject.prototype.getStats.call(this) + " " + message;
    }


    // PUBLIC METHODS

    MovingObject.prototype.goTo = function(tile, ignoreType) {
        this.moveIndex = 0;
        this.moveFrame = 0;

        ignoreType = typeof ignoreType !== 'undefined' ? ignoreType : this.constructor.name;

        this.movePath = game.astar.search(this.currentTile, tile, ignoreType);
    };

    // PRIVATE METHODS 

    MovingObject.prototype.lerpSprite = function(nextTile, time) {
        this.sprite.position.x += (nextTile.position.x - this.sprite.position.x) * time;  
        this.sprite.position.y += (nextTile.position.y - this.sprite.position.y) * time;
    }

    return MovingObject;
});