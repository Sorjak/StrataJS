define(['js/moving_object.js'], function(MovingObject) {
    "use strict";
    var bunnyScale = new PIXI.Point(.08, .08);

    function Bunny(tile) {
        MovingObject.call(this, current_id++, tile, "resources/bunny.png");
        
        this.sprite.width = TILE_SIZE;
        this.sprite.height = TILE_SIZE;

        this.tags = ["prey", "herbivore"];

        this.moveSpeed = 30;

        this.health = 100;
    };

    Bunny.prototype = Object.create(MovingObject.prototype);
    Bunny.prototype.constructor = Bunny;

    // OVERRIDES

    Bunny.prototype.update = function(deltaTime) {

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

    return Bunny;
});