define(['js/strata_object.js'], function(StrataObject) {
    "use strict";

    function Flower(position, color) {
        StrataObject.call(this, current_id++, position, "resources/" + color + "_flower.png");
        
        this.sprite.width = TILE_SIZE;
        this.sprite.height = TILE_SIZE;
        
        this.tags = new Set(["plant"]);
        
        this.growth = 0;
        this.growthRate = .2;

        this.maxNeighbors = 2;
    };

    Flower.prototype = Object.create(StrataObject.prototype);
    Flower.prototype.constructor = Flower;

    // OVERRIDES

    Flower.prototype.update = function(deltaTime) {
        this.grow(deltaTime);

        StrataObject.prototype.update.call(this, deltaTime);
    };

    Flower.prototype.draw = function() {
        

        StrataObject.prototype.draw.call(this);
    };

    Flower.prototype.onDown = function() {
        // game.pickFlower(this.currentTile);

        StrataObject.prototype.onDown.call(this);
    };
    
    
    // PRIVATE METHODS
    
    Flower.prototype.grow = function(deltaTime) {
        this.growth += Math.random() * this.growthRate * deltaTime;
        if (this.growth > 100) {
            this.growth = 0;
            this.spawn();
        }
    };
    
    Flower.prototype.spawn = function() {
        var neighbors = this.currentTile.getNeighbors(false);
        var canSpawn = 0;

        neighbors.forEach(function(tile) {
            if (tile.hasOccupantWithTag("plant")) {
                canSpawn++;
            }
        });

        if (canSpawn <= this.maxNeighbors) {
            var ranTile = neighbors[ Math.round(Math.random() * neighbors.length) ];

            if (ranTile != null && ranTile.weight > 0 && !ranTile.hasOccupantWithTag("plant")) {
                var child = new Flower( ranTile, "orange");
                game.addObject(child);
            }
        }

    };
    
    // PUBLIC METHODS

    Flower.prototype.getEaten = function(amount) {
        this.health -= amount;
    }

    return Flower;
});