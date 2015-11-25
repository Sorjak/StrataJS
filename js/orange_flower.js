define(['js/strata_object.js'], function(StrataObject) {
    "use strict";

    function OrangeFlower(position) {
        StrataObject.call(this, current_id++, position, "resources/orange_flower.png")
    };

    OrangeFlower.prototype = Object.create(StrataObject.prototype);
    OrangeFlower.prototype.constructor = OrangeFlower;


    OrangeFlower.prototype.onDown = function() {
        game.pickFlower(this.position);

        StrataObject.prototype.onDown.call(this);
    };

    return OrangeFlower;
});