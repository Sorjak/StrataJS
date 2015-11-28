define(['js/strata_object.js'], function(StrataObject) {
    "use strict";

    function Flower(position, color) {
        StrataObject.call(this, current_id++, position, "resources/" + color + "_flower.png");
        
        this.sprite.width = TILE_SIZE;
        this.sprite.height = TILE_SIZE;
        
        this.tags = ["plant"];
        
        this.health = 100;
        this.growth = 0;
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
        game.pickFlower(this.currentTile);

        StrataObject.prototype.onDown.call(this);
    };
    
    
    // PRIVATE METHODS
    
    Flower.prototype.grow = function(deltaTime) {
        this.growth += Math.random() * .3 * deltaTime;
        if (this.growth > 100) {
            this.growth = 0;
            this.spawn();
        }
    };
    
    Flower.prototype.spawn = function() {
        this._log(this.id + " is spawning!");
    };
    
    // PUBLIC METHODS

    return Flower;
});