define(['js/moving_object.js', 'js/lib/state-machine.min.js'], function(MovingObject, StateMachine) {
    "use strict";
    var bunnyScale = new PIXI.Point(.08, .08);

    function Bunny(tile) {
        MovingObject.call(this, current_id++, tile, "resources/bunny.png");
        
        this.sprite.width = TILE_SIZE;
        this.sprite.height = TILE_SIZE;

        this.tags.add(["prey", "herbivore"]);

        this.moveSpeed = 30;

        this.health = 100;

        this.visionRadius = 10; //in tile lengths
        this.visionFrequency = 90;
        this.visionTimer = 0;

        this.foodTarget = null;
        this.foodPosition = null;
        this.eatSpeed = .5;

        this.fsm = this.initStateMachine();
    };

    Bunny.prototype = Object.create(MovingObject.prototype);
    Bunny.prototype.constructor = Bunny;

    Bunny.prototype.initStateMachine = function() {
        return StateMachine.create({
            initial: 'foraging',
            events: [
                { name: 'foundFood',  from: 'foraging',  to: 'movingToEat'},
                { name: 'beginEating',  from: 'movingToEat',  to: 'eating'},
                { name: 'finishFood', from: 'eating', to: 'foraging'},
            ]
        });
    };
 
    // OVERRIDES

    Bunny.prototype.update = function(deltaTime) {
        if (this.fsm.is('foraging')) {
            this.foodTarget = null;
            this.foodPosition = null;
            if (this.visionTimer < this.visionFrequency) {
                this.visionTimer += deltaTime;
            } else {
                this.visionTimer = 0;
                var flowers = this.lookForNearbyObjects("plant");

                if (flowers.length > 0) {
                    this.foodTarget = flowers[0];
                    this.foodPosition = this.foodTarget.currentTile;

                    this.goTo(this.foodPosition);
                    this.fsm.foundFood();

                } else if (this.movePath == null) {
                    var rTile = game.getRandomTile();
                    if (rTile != null)
                        this.goTo(rTile);
                }
            }
        }

        if (this.fsm.is('movingToEat')) {
            if (this.currentTile == this.foodPosition) {
                this.fsm.beginEating();
            }
        }

        if (this.fsm.is('eating')) {
            if (this.foodTarget.health > 0) {
                this.foodTarget.getEaten(this.eatSpeed * deltaTime);
            } else {
                this.foodTarget = null
                this.foodPosition = null;

                this.fsm.finishFood();
            }
        }

        MovingObject.prototype.update.call(this, deltaTime);
    };

    Bunny.prototype.draw = function() {
        

        MovingObject.prototype.draw.call(this);
    };

    Bunny.prototype.onDown = function() {


        MovingObject.prototype.onDown.call(this);
    };


    // PUBLIC METHODS
    
    // PRIVATE METHODS

    Bunny.prototype.lookForNearbyObjects = function(tag) {
        var candidates = game.getObjectsByTag(tag);
        var inRange = [];

        var currentBunny = this;
        candidates.forEach(function(x) {
            var distance = currentBunny.currentTile.distanceTo(x.currentTile);
            if (distance < currentBunny.visionRadius) {
                inRange.push(x);
            }
        });

        inRange.sort(function(a, b) {
            var distanceA = currentBunny.currentTile.distanceTo(a.currentTile);
            var distanceB = currentBunny.currentTile.distanceTo(b.currentTile);

            return distanceA - distanceB;

        });
        return inRange;

    };

    return Bunny;
});