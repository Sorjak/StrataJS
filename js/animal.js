define(['js/moving_object.js', 'js/lib/vector2.js', 'js/lib/state-machine.min.js'], 
    function(MovingObject, Vector2, StateMachine) {
    "use strict";

    function Animal(tile, container, image_path) {
        MovingObject.call(this, current_id++, tile, container, image_path);
        
        this.sprite.width = 128;
        this.sprite.height = 128;
        // this.sprite.anchor = new PIXI.Point(.5, .5);

        this.foodTarget = null;
        this.foodPosition = null;

        this.hunger = 0;
        this.growth = 0;
        this.visionTimer = 0;
        
        this.foodTag = "";

        this.fsm = null;  
        
        this.dna.moveSpeed = .5;
        this.dna.visionRadius = 10;
        this.dna.visionFrequency = 90;

        this.dna.eatSpeed = .5;
        this.dna.growthRate = .1;
        this.dna.growthThreshold = 100;


        this.events = [
            { name: 'beginEating',  from: 'movingToEat',  to: 'eating'},
            { name: 'pathBlocked',  from: 'movingToEat',  to: 'foraging'},
            { name: 'finishFood', from: 'eating', to: 'idle'},
            { name: 'goIntoLabor', from: '*', to: 'birthing'},
            { name: 'giveBirth' , from: 'birthing', to: 'idle'}
        ];

        this.fsm = this.initStateMachine();
        this.children = [];
    };

    Animal.prototype = Object.create(MovingObject.prototype);
    Animal.prototype.constructor = Animal;

    Animal.prototype.initStateMachine = function() {
        return StateMachine.create({
            initial: 'idle',
            events: this.events
        });
    };

    // OVERRIDES

    Animal.prototype.update = function(deltaTime) {
        if (this.fsm.is('idle')) {
            this.idle(deltaTime);
        }

        if (this.fsm.is('eating')) {
            this.eat(deltaTime);

        }

        if (this.fsm.is('birthing')) {
            this.birth(deltaTime)
        }


        if (this.energy > this.dna.growthThreshold) {
            this.fsm.goIntoLabor();

        }

        MovingObject.prototype.update.call(this, deltaTime);
    };

    Animal.prototype.draw = function() {
        

        MovingObject.prototype.draw.call(this);
    };

    Animal.prototype.onDown = function() {


        MovingObject.prototype.onDown.call(this);
    };

    Animal.prototype.getStats = function() {
        var message = "| Growth : " + (Math.round(this.growth)) + 
        " | Current State: " + this.fsm.current + "\nDNA INFO: \n";

        var curr_dna = this.dna;
        for (var key in curr_dna) {
            if (curr_dna.hasOwnProperty(key)) {
                message += "  " + key + " : " + curr_dna[key] + "\n";
            }
        };

        return MovingObject.prototype.getStats.call(this) + message;
    }

    // STATE METHODS

    Animal.prototype.idle = function(deltaTime) {
        if (this.movePath == null) {
            var rTile = game.getRandomTile();
            if (rTile != null) this.goTo(rTile);
        }

        if (this.energy <= this.startEnergy * .50) {
            this.fsm.getHungry();
        }
    }

    Animal.prototype.eat = function(deltaTime) {

        if (this.foodTarget.health > 0) {
            this.foodTarget.getEaten(this.dna.eatSpeed * deltaTime);

        } else {
            this.energy += this.foodTarget.energy;
            this.foodTarget = null
            this.foodPosition = null;


            this.fsm.finishFood();
        }
        
    }

    Animal.prototype.birth = function(deltaTime) {
        this.growth += this.dna.growthRate * deltaTime;
        if (this.growth > this.dna.growthThreshold) {
            this.growth = 0;

            var birthEnergy = this.energy * .75;
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
                this.createChild(birthTile, birthEnergy);
            }
            this.fsm.giveBirth();
        }
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

    }

    Animal.prototype.createChild = function(tile, energy) {
        this.energy -= energy;
    }

    return Animal;
});