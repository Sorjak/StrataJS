define(['js/moving_object.js', 'js/lib/state-machine.min.js'], function(MovingObject, StateMachine) {
    "use strict";

    function Animal(tile, image_path) {
        MovingObject.call(this, current_id++, tile, image_path);
        
        this.sprite.width = TILE_SIZE;
        this.sprite.height = TILE_SIZE;

        this.moveSpeed = 30;

        this.visionRadius = 10; //in tile lengths
        this.visionFrequency = 90;
        this.visionTimer = 0;

        this.foodTarget = null;
        this.foodPosition = null;
        this.eatSpeed = .5;

        this.growth = 0;
        this.growthRate = .1;
        this.growthThreshold = 100;

        this.maxHealth = this.health;
        this.deathRate = .15;

        this.foodTag = "";

        this.fsm = this.initStateMachine();
    };

    Animal.prototype = Object.create(MovingObject.prototype);
    Animal.prototype.constructor = Animal;

    Animal.prototype.initStateMachine = function() {
        return StateMachine.create({
            initial: 'foraging',
            events: [
                { name: 'foundFood',  from: 'foraging',  to: 'movingToEat'},
                { name: 'beginEating',  from: 'movingToEat',  to: 'eating'},
                { name: 'pathBlocked',  from: 'movingToEat',  to: 'foraging'},
                { name: 'finishFood', from: 'eating', to: 'foraging'},
            ]
        });
    };
 
    // OVERRIDES

    Animal.prototype.update = function(deltaTime) {
        if (this.fsm.is('foraging')) {
            this.foodTarget = null;
            this.foodPosition = null;

            if (this.visionTimer < this.visionFrequency) {
                this.visionTimer += deltaTime;

            } else {
                this.visionTimer = 0;
                var flowers = this.lookForNearbyObjects(this.foodTag);

                if (flowers.length > 0) {
                    this.foodTarget = flowers[0];
                    this.foodPosition = this.foodTarget.currentTile;

                    this.goTo(this.foodPosition);
                    this.fsm.foundFood();

                } else if (this.movePath == null) {
                    var rTile = game.getRandomTile();
                    if (rTile != null) this.goTo(rTile);
                }
            }
        }

        if (this.fsm.is('movingToEat')) {
            var nextTile = this.movePath[this.moveIndex + 1];
            if (nextTile != null && nextTile.hasOccupantWithTag("solid")) {
                this.movePath = null;
                this.fsm.pathBlocked();
                this.visionTimer = this.visionFrequency;
            }

            if (this.currentTile == this.foodPosition) {
                this.fsm.beginEating();
            }
        }

        if (this.fsm.is('eating')) {

            if (this.foodTarget.health > 0) {
                var eatRate = this.eatSpeed * deltaTime;
                this.foodTarget.getEaten(eatRate);
                this.growth += this.growthRate * (this.health / this.maxHealth);
                this.health += eatRate;

            } else {
                this.foodTarget = null
                this.foodPosition = null;

                this.fsm.finishFood();
            }
        }

        if (this.growth > this.growthThreshold) {
            this.growth = 0;
            this.birth();
        }

        this.health -= this.deathRate;

        MovingObject.prototype.update.call(this, deltaTime);
    };

    Animal.prototype.draw = function() {
        

        MovingObject.prototype.draw.call(this);
    };

    Animal.prototype.onDown = function() {


        MovingObject.prototype.onDown.call(this);
    };


    // PUBLIC METHODS
    
    // PRIVATE METHODS

    Animal.prototype.lookForNearbyObjects = function(tag) {
        var candidates = game.getObjectsByTag(tag);
        var inRange = [];

        var currentAnimal = this;
        candidates.forEach(function(x) {
            var distance = currentAnimal.currentTile.distanceTo(x.currentTile);
            if (distance < currentAnimal.visionRadius && !x.currentTile.hasOccupantWithTag("solid")) {
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
        var neighbors = this.currentTile.getNeighbors(true);
        var birthTile = null;

        for (var i = neighbors.length - 1; i >= 0; i--) {
            var tile = neighbors[i];
            if (tile.weight > 0) {
                birthTile = tile;
                break;
            }
        };

        if (birthTile != null) {
            var child = new Animal( birthTile );
            game.addObject(child);
        }

    }

    return Animal;
});