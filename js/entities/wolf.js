define(['js/entities/animal.js', 'js/lib/state-machine.min.js'], function(Animal, StateMachine) {
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
            this.dna.growthThreshold = 140;

        }
        

        this.health = this.dna.maxHealth;
    };

    Wolf.prototype = Object.create(Animal.prototype);
    Wolf.prototype.constructor = Wolf;
 
    // OVERRIDES

    Wolf.prototype.initStateMachine = function() {
        this.events.push(
            { name: 'getHungry',  from: 'idle',  to: 'hunting'},
            { name: 'foundFood',  from: 'hunting',  to: 'movingToKill'},
            { name: 'beginEating',  from: 'movingToKill',  to: 'eating'}, 
            { name: 'pathBlocked',  from: 'movingToKill',  to: 'hunting'}
        );

        return Animal.prototype.initStateMachine.call(this);
    }

    Wolf.prototype.update = function(deltaTime) {

        if (this.fsm.is('hunting')) {
            this.foodTarget = null;
            this.foodPosition = null;

            this.hunt(deltaTime);

        }

        if (this.fsm.is('thirsty')) {
            this.thirst = 0;
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
        var message = "I have " + this.children.length + " children";

        return Animal.prototype.getStats.call(this) + message;
    }

    Wolf.prototype.createChild = function(tile, energy) {
        var child = new Wolf( tile, this.container, this.mutate(this.dna) );
        child.energy = energy * .25;

        game.addObject(child);
        this.children.push(child);

        Animal.prototype.createChild.call(this, tile, energy);

    }


    // PUBLIC METHODS



    Wolf.prototype.cripple = function() {
        this.dna.moveSpeed = 0;
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


    return Wolf;
});