define(['js/strata_object.js'], function(StrataObject) {
    "use strict";
    var bunnyScale = new PIXI.Point(.08, .08);

    function Bunny(position) {
        StrataObject.call(this, current_id++, position, "resources/bunny.png", bunnyScale);

        this.speedMultiplier = 2;

        this.target = null;
    };

    Bunny.prototype = Object.create(StrataObject.prototype);
    Bunny.prototype.constructor = Bunny;


    // OVERRIDES

    Bunny.prototype.update = function(deltaTime) {
        if (this.target != null) {
            if (this.position.distanceTo(this.target) < .5) {
                this.velocity = new Vector2(0, 0);
                this.target = null;

            } else {
                var tempPos = this.target.clone();
                this.velocity = tempPos.sub(this.position).normalize();
            }
        }

        StrataObject.prototype.update.call(this, deltaTime);
    };

    Bunny.prototype.draw = function() {
        

        StrataObject.prototype.draw.call(this);
    };

    Bunny.prototype.onDown = function() {


        StrataObject.prototype.onDown.call(this);
    };


    // PUBLIC METHODS

    Bunny.prototype.goTo = function(point) {
        this.target = point;
    };



    return Bunny;
});