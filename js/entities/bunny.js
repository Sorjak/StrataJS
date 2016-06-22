define(['js/entities/animal.js', 'js/lib/state-machine.min.js'], function(Animal, StateMachine) {
    "use strict";

    function Bunny(tile, container, dna) {
        Animal.call(this, tile, container, "resources/bunny.png");
        
        this.sprite.width = TILE_SIZE;
        this.sprite.height = TILE_SIZE;

        this.tags = new Set(["prey", "herbivore", "solid"]);
        this.foodTag = "plant";


        if (typeof dna !== 'undefined') {
            this.dna = dna;

        } else {
            this.dna.max_health = 200;
            this.dna.moveSpeed = 1.5;

            this.dna.visionRadius = 10; //in tile lengths
            this.dna.visionFrequency = 10;

            this.dna.eatSpeed = .3;

            this.dna.growthRate = .15;
            this.dna.growthThreshold = 130;
        }
        
        this.health = this.dna.max_health;
    };

    Bunny.prototype = Object.create(Animal.prototype);
    Bunny.prototype.constructor = Bunny;
 
    // OVERRIDES

    Bunny.prototype.initStateMachine = function() {
        this.events.push(
            { name: 'getHungry', from: 'idle', to: 'foraging'},
            { name: 'foundFood',  from: 'foraging',  to: 'movingToEat'}
        );

        return Animal.prototype.initStateMachine.call(this);
    }

    Bunny.prototype.update = function(deltaTime) {

        if (this.fsm.is('foraging')) {
            this.foodTarget = null;
            this.foodPosition = null;

            this.forage(deltaTime);
        }

        if (this.fsm.is('thirsty')) {
            this.thirst = 0;
        }

        if (this.fsm.is('movingToEat')) {
            if (this.movePath != null) {
                var nextTile = this.movePath[this.moveIndex + 1];
                if (nextTile != null && nextTile.hasOccupantOfType(this.constructor.name)) {
                    this.movePath = null;
                    this.fsm.pathBlocked();
                    this.visionTimer = this.dna.visionFrequency;
                }
            }

            if (this.currentTile == this.foodPosition) {
                this.fsm.beginEating();
            }
        }

        Animal.prototype.update.call(this, deltaTime);
    };

    Bunny.prototype.draw = function() {
        

        Animal.prototype.draw.call(this);
    };

    Bunny.prototype.onDown = function() {


        Animal.prototype.onDown.call(this);
    };

    Bunny.prototype.getStats = function() {
        var message = "I have " + this.children.length + " children";

        return Animal.prototype.getStats.call(this) + message;
    }

    Bunny.prototype.createChild = function(tile, energy) {
        var child = new Bunny( tile, this.container, this.mutate(this.dna) );
        child.energy = energy * .25;

        game.addObject(child);
        this.children.push(child);

        Animal.prototype.createChild.call(this, tile, energy);

    }


    // PUBLIC METHODS

    Bunny.prototype.cripple = function() {
        this.dna.moveSpeed = 0;
    }

    Bunny.prototype.getEaten = function(amount) {
        this.health -= amount;
    }


    // PRIVATE METHODS

    Bunny.prototype.forage = function(deltaTime) {
        if (this.visionTimer < this.dna.visionFrequency) {
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



    return Bunny;
});