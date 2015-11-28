define(['js/strata_object.js'], function(StrataObject) {
    "use strict";
    var bunnyScale = new PIXI.Point(.08, .08);

    function Bunny(position) {
        StrataObject.call(this, current_id++, position, "resources/bunny.png");
        
        this.sprite.width = TILE_SIZE;
        this.sprite.height = TILE_SIZE;

        this.tags = ["prey", "herbivore"];
        this.speedMultiplier = 30;

        this.target = null;
        this.health = 100;
    };

    Bunny.prototype = Object.create(StrataObject.prototype);
    Bunny.prototype.constructor = Bunny;

    // OVERRIDES

    Bunny.prototype.update = function(deltaTime) {
        // this.trackTarget();

        StrataObject.prototype.update.call(this, deltaTime);
    };

    Bunny.prototype.draw = function() {
        

        StrataObject.prototype.draw.call(this);
    };

    Bunny.prototype.onDown = function() {


        StrataObject.prototype.onDown.call(this);
    };


    // PUBLIC METHODS

    Bunny.prototype.goTo = function(tile) {
        this.targetTile = tile;
        
        
    };
    
    // PRIVATE METHODS
    
    // Bunny.prototype.trackTarget = function() {
    //     if (this.target != null) {
    //         if (this.position.distanceTo(this.target) < .5) {
    //             this.velocity = new Vector2(0, 0);
    //             this.target = null;
    // 
    //         } else {
    //             var tempPos = this.target.clone();
    //             this.velocity = tempPos.sub(this.position).normalize();
    //         }
    //     }
    // };

    return Bunny;
});