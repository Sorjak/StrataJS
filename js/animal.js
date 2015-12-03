define(['js/moving_object.js'], function(MovingObject) {
    "use strict";

    function Animal(tile, image_path) {
        MovingObject.call(this, current_id++, tile, image_path);
        
        this.sprite.width = TILE_SIZE;
        this.sprite.height = TILE_SIZE;

        this.foodTarget = null;
        this.foodPosition = null;

        this.growth = 0;
        this.visionTimer = 0;
        
        this.foodTag = "";

        this.fsm = null;  
        
        this.dna.moveSpeed = 30;
        this.dna.visionRadius = 10;
        this.dna.visionFrequency = 90;

        this.dna.eatSpeed = .5;
        this.dna.growthRate = .1;
        this.dna.growthThreshold = 100;

        this.dna.deathRate = .15;
        


    };

    Animal.prototype = Object.create(MovingObject.prototype);
    Animal.prototype.constructor = Animal;

    // OVERRIDES

    Animal.prototype.update = function(deltaTime) {

        if (this.growth > this.dna.growthThreshold) {
            this.growth = 0;
            this.birth();
        }

        this.health -= this.dna.deathRate;

        MovingObject.prototype.update.call(this, deltaTime);
    };

    Animal.prototype.draw = function() {
        

        MovingObject.prototype.draw.call(this);
    };

    Animal.prototype.onDown = function() {


        MovingObject.prototype.onDown.call(this);
    };

    Animal.prototype.getStats = function() {
        var message = "| Growth : " + (Math.round(this.growth * 100) / 100) + 
        " | Current State: " + this.fsm.current + "\nDNA INFO: \n";



        var curr_dna = this.dna;
        for (var key in curr_dna) {
            if (curr_dna.hasOwnProperty(key)) {
                message += "  " + key + " : " + curr_dna[key] + "\n";
            }
        };

        return MovingObject.prototype.getStats.call(this) + message;
    }


    // PUBLIC METHODS


    
    // PRIVATE METHODS

    Animal.prototype.lookForNearbyObjects = function(tag) {
        var candidates = game.getObjectsByTag(tag);
        var inRange = [];
        var ig = typeof ignoreSolid !== 'undefined' ? ignoreSolid : false;

        var currentAnimal = this;
        candidates.forEach(function(x) {
            var distance = currentAnimal.currentTile.distanceTo(x.currentTile);
            if (distance < currentAnimal.dna.visionRadius 
                && !x.currentTile.hasOccupantOfType(currentAnimal.constructor.name)) {
                inRange.push(x);
            }
        });

        inRange.sort(function(a, b) {
            var distanceA = currentAnimal.currentTile.distanceTo(a.currentTile);
            var distanceB = currentAnimal.currentTile.distanceTo(b.currentTile);

            return distanceA - distanceB;

        });
        return inRange;

    };

    Animal.prototype.birth = function() {

    }

    Animal.prototype.eat = function(food, eatRate) {
        food.getEaten(eatRate);
        this.growth += this.dna.growthRate * (this.health / this.dna.maxHealth);
        this.health = this.health + eatRate > this.dna.maxHealth ?
                          this.health : 
                          this.health + eatRate;
    }



    return Animal;
});