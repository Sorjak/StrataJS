define(['js/animal.js', 'js/lib/state-machine.min.js'], function(Animal, StateMachine) {
    "use strict";

    function Wolf(tile, container, dna) {
        Animal.call(this, tile, container, "resources/wolf2.png");
        
        this.sprite.width = TILE_SIZE;
        this.sprite.height = TILE_SIZE;

        this.tags = new Set(["predator", "carnivore", "solid"]);
        this.foodTag = "prey";


        if (typeof dna !== 'undefined') {
            this.dna = dna;

        } else {
            this.dna.maxHealth = 400;
            this.dna.moveSpeed = 1.8;

            this.dna.visionRadius = 15; //in tile lengths
            this.dna.visionFrequency = 90;

            this.dna.eatSpeed = .5;

            this.dna.growthRate = .3;
            this.dna.growthThreshold = 100;

            this.dna.hungerRate = .05;
            this.dna.hungerThreshold = 100;
        }
        

        this.health = this.dna.maxHealth;
        this.fsm = this.initStateMachine();
    };

    Wolf.prototype = Object.create(Animal.prototype);
    Wolf.prototype.constructor = Wolf;

    Wolf.prototype.initStateMachine = function() {
        return StateMachine.create({
            initial: 'idle',
            events: [
                { name: 'getHungry',  from: 'idle',  to: 'hunting'},
                { name: 'foundFood',  from: 'hunting',  to: 'movingToKill'},
                { name: 'beginEating',  from: 'movingToKill',  to: 'eating'},
                { name: 'pathBlocked',  from: 'movingToKill',  to: 'hunting'},
                { name: 'finishFood', from: 'eating', to: 'idle'},
            ]
        });
    };
 
    // OVERRIDES

    Wolf.prototype.update = function(deltaTime) {
        if (this.fsm.is('idle')) {
            this.foodTarget = null;
            this.foodPosition = null;

            if (this.hunger > this.dna.hungerThreshold * .75) {
                this.fsm.getHungry();
            }

        }

        if (this.fsm.is('hunting')) {
            this.foodTarget = null;
            this.foodPosition = null;

            this.hunt(deltaTime);

        }

        if (this.fsm.is('movingToKill')) {
            // if (this.movePath != null) {
            //     var nextTile = this.movePath[this.moveIndex + 1];
            // }

            if (this.foodPosition != this.foodTarget.currentTile) {
                this.foodPosition = this.foodTarget.currentTile;
                this.goTo(this.foodPosition);
            }

            if (this.currentTile.distanceTo(this.foodPosition) < 2) {
                this.foodTarget.cripple();
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

    Wolf.prototype.draw = function() {
        

        Animal.prototype.draw.call(this);
    };

    Wolf.prototype.onDown = function() {


        Animal.prototype.onDown.call(this);
    };

    Wolf.prototype.eat = function(food, eatRate) {
        
        Animal.prototype.eat.call(this, food, eatRate);
    }

    Wolf.prototype.getStats = function() {
        var message = "this is a wolf";

        return Animal.prototype.getStats.call(this) + " " + message;
    }


    // PUBLIC METHODS



    Wolf.prototype.cripple = function() {
        this.dna.moveSpeed = 100;
    }
    
    // PRIVATE METHODS\



    Wolf.prototype.hunt = function(deltaTime) {
        if (this.visionTimer < this.dna.visionFrequency) {
            this.visionTimer += deltaTime;

        } else {
            this.visionTimer = 0;
            var prey = this.lookForNearbyObjects(this.foodTag);

            if (prey.length > 0) {
                this.foodTarget = prey[0];
                this.foodPosition = this.foodTarget.currentTile;

                this.goTo(this.foodPosition);
                this.fsm.foundFood();

            } else if (this.movePath == null) {
                var rTile = game.getRandomTile();
                if (rTile != null) this.goTo(rTile);
            }
        }

    }

    Wolf.prototype.birth = function() {
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
            var child = new Wolf( birthTile, this.container, this.mutate(this.dna) );
            console.log(child.dna);
            game.addObject(child);
        }

        Animal.prototype.birth.call(this);

    }

    return Wolf;
});