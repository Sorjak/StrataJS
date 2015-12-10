define(['js/animal.js', 'js/lib/state-machine.min.js'], function(Animal, StateMachine) {
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
            this.dna.maxHealth = 200;
            this.dna.moveSpeed = 1.5;

            this.dna.visionRadius = 10; //in tile lengths
            this.dna.visionFrequency = 90;

            this.dna.eatSpeed = .3;

            this.dna.growthRate = .15;
            this.dna.growthThreshold = 100;

            this.dna.hungerRate = .1;
            this.dna.hungerThreshold = 100;
        }
        

        this.health = this.dna.maxHealth;
        this.fsm = this.initStateMachine();
    };

    Bunny.prototype = Object.create(Animal.prototype);
    Bunny.prototype.constructor = Bunny;

    Bunny.prototype.initStateMachine = function() {
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

    Bunny.prototype.update = function(deltaTime) {
        if (this.fsm.is('foraging')) {
            this.foodTarget = null;
            this.foodPosition = null;

            this.forage(deltaTime);
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

        if (this.fsm.is('eating')) {

            if (this.foodTarget.health > 0) {
                this.eat(this.foodTarget, this.dna.eatSpeed * deltaTime);

            } else {
                this.foodTarget = null
                this.foodPosition = null;

                this.fsm.finishFood();
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

    Bunny.prototype.eat = function(food, eatRate) {
        
        Animal.prototype.eat.call(this, food, eatRate);
    }

    Bunny.prototype.getStats = function() {
        var message = "this is a bunny";

        return Animal.prototype.getStats.call(this) + " " + message;
    }


    // PUBLIC METHODS



    Bunny.prototype.cripple = function() {
        this.dna.moveSpeed = 0;
    }

    Bunny.prototype.getEaten = function(amount) {
        this.health -= amount;
    }


    
    // PRIVATE METHODS\

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

    Bunny.prototype.birth = function() {
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
            var child = new Bunny( birthTile, this.container, this.mutate(this.dna) );
            game.addObject(child);
        }

        Animal.prototype.birth.call(this);

    }

    return Bunny;
});