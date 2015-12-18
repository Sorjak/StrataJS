define(['js/strata_object.js'], function(StrataObject) {
    "use strict";

    function Flower(tile, container, color, dna) {
        StrataObject.call(this, current_id++, tile, container, "resources/" + color);
        
        this.sprite.width = TILE_SIZE;
        this.sprite.height = TILE_SIZE;

        this.growth = 0;
        
        this.tags = new Set(["plant"]);
        
        if (typeof dna !== 'undefined') {
            this.dna = dna;

        } else {
            this.dna.maxHealth = 100;
            this.dna.growthRate = .2;
            this.dna.growthThreshold = 100;
        }

        this.health = this.dna.maxHealth;
    };

    Flower.prototype = Object.create(StrataObject.prototype);
    Flower.prototype.constructor = Flower;

    // OVERRIDES

    Flower.prototype.update = function(deltaTime) {
        if (this.energy > this.dna.growthThreshold) {
            this.grow(deltaTime);
        } else {
            this.energy += Math.random() * this.dna.growthRate * deltaTime;
        }

        StrataObject.prototype.update.call(this, deltaTime);
    };

    Flower.prototype.draw = function() {
        

        StrataObject.prototype.draw.call(this);
    };

    Flower.prototype.onDown = function() {
        // game.pickFlower(this.currentTile);

        StrataObject.prototype.onDown.call(this);
    };
    
    Flower.prototype.getStats = function() {
        var message = " | Growth : " + (Math.round(this.growth * 100) / 100) + "\nDNA INFO: \n";

        var curr_dna = this.dna;
        for (var key in curr_dna) {
            if (curr_dna.hasOwnProperty(key)) {
                message += "  " + key + " : " + curr_dna[key] + "\n";
            }
        };

        return StrataObject.prototype.getStats.call(this) + message;
    }
    
    // PRIVATE METHODS
    
    Flower.prototype.grow = function(deltaTime) {
        this.growth += Math.random() * this.dna.growthRate * deltaTime;
        if (this.growth > this.dna.growthThreshold) {
            this.growth = 0;
            this.energy = this.energy * .25;
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

        if (canSpawn <= 1) {
            var ranTile = neighbors[ Math.round(Math.random() * neighbors.length) ];

            if (ranTile != null && ranTile.weight > 0 && !ranTile.hasOccupantWithTag("plant")) {
                var child = new Flower( ranTile, this.container, "orange_flower.png", this.mutate(this.dna) );
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