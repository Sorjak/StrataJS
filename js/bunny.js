define(['js/strata_object.js'], function(StrataObject) {
    "use strict";

    function Bunny(position) {
        StrataObject.call(this, position, "resources/bunny.png")
        this.name = "bunners";
    };

    Bunny.prototype = Object.create(StrataObject.prototype);
    Bunny.prototype.constructor = Bunny;



    return Bunny;
});