define(['js/strata_object.js'], function(StrataObject) {
    "use strict";

    function MovingObject(id, tile, container, path) {
        StrataObject.call(this, id, tile, container, path);
        
        this.sprite.width = TILE_SIZE;
        this.sprite.height = TILE_SIZE;

        this.dna.moveSpeed = .5;
        this.movePath = null;
        this.moveIndex = 1;
        this.moveFrame = 0;
        this.startMove = null;
        // this.distanceToMove = 0;
        // this.targetTile = null;
    };

    MovingObject.prototype = Object.create(StrataObject.prototype);
    MovingObject.prototype.constructor = MovingObject;

    // OVERRIDES

    MovingObject.prototype.update = function(deltaTime) {
        if (this.movePath != null) {
            
            if (this.currentTile != this.movePath[this.movePath.length - 1]) {
                var nextTile = this.movePath[this.moveIndex + 1];
                // var totalDistance = this.currentTile.screenDistanceTo(nextTile);
                var totalDistance = nextTile.screenDistanceToVector(this.startMove);
                var percentDistance = this.moveFrame / totalDistance;

                if (percentDistance < 1) {
                    this.moveFrame += this.dna.moveSpeed;

                    this.sprite.position = this.lerpPoint(this.startMove, nextTile.position, percentDistance);
                    
                    
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
        
        this.startMove = this.sprite.position;
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
        // this.distanceToMove = tile.screenDistanceToVector(this.sprite.position);
        this.startMove = this.sprite.position;

        ignoreType = typeof ignoreType !== 'undefined' ? ignoreType : this.constructor.name;

        this.movePath = game.astar.search(this.currentTile, tile, ignoreType);
    };

    // PRIVATE METHODS 

    MovingObject.prototype.lerpPoint = function(from, to, time) {
        var output = new PIXI.Point();
        output.x = from.x + (to.x - from.x) * time;  
        output.y = from.y + (to.y - from.y) * time;  

        // output.x = (1-time) * from.x + time * to.x;
        // output.y = (1-time) * from.y + time * to.y;

        return output;
    }

    return MovingObject;
});