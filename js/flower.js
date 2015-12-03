define(['js/strata_object.js'], function(StrataObject) {
    "use strict";

    function Flower(position, color, dna) {
        StrataObject.call(this, current_id++, position, "resources/" + color);
        
        this.sprite.width = TILE_SIZE;
        this.sprite.height = TILE_SIZE;

        this.growth = 0;
        
        this.tags = new Set(["plant"]);
        
        if (typeof dna !== 'undefined') {
            this.dna = dna;

        } else {
            this.dna.growthRate = .4;

            this.dna.maxNeighbors = 2;
        }

        this.health = this.dna.maxHealth;
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
        this.growth += Math.random() * this.dna.growthRate * deltaTime;
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

        if (canSpawn <= this.dna.maxNeighbors) {
            var ranTile = neighbors[ Math.round(Math.random() * neighbors.length) ];

            if (ranTile != null && ranTile.weight > 0 && !ranTile.hasOccupantWithTag("plant")) {
                var child = new Flower( ranTile, "orange_flower.png", this.mutate(this.dna) );
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