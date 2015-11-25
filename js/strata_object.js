
define(['js/lib/vector2.js'], function(Vector2) {
    "use strict";

    function StrataObject(id, position, path, scale, anchor) {
        this.id = id;

        this.initSprite(position, path, scale, anchor);

        this.position = new Vector2(this.sprite.position.x, this.sprite.position.y);
        this.rotation = this.sprite.rotation;
        this.velocity = new Vector2(0, 0);

        this.speedMultiplier = 1;

        var myObj = this;

        this.sprite.on('mousedown', function() {
            myObj.onDown();
        });
        this.sprite.on('touchstart', function() {
            myObj.onDown();
        });
    };

    StrataObject.prototype.initSprite = function(pos, path, scale, anchor) {
        this.sprite = new PIXI.Sprite.fromImage(path);

        this.sprite.position = pos;

        this.sprite.scale = typeof scale !== 'undefined' ? scale : new PIXI.Point(.1, .1);
        this.sprite.anchor = typeof anchor !== 'undefined' ? anchor : new PIXI.Point(.5, .5);

        this.sprite.interactive = true;

        STAGE.addChild(this.sprite);
    }

    StrataObject.prototype.draw = function() {

    }

    StrataObject.prototype.update = function(deltaTime) {
        var tempVelocity = this.velocity.clone().multiplyScalar(deltaTime * this.speedMultiplier);
        this.position.add(tempVelocity);

        if (this.position.x > RENDERER.width)
            this.position.x = 0;
        if (this.position.x < 0)
            this.position.x = RENDERER.width;

        if (this.position.y > RENDERER.height)
            this.position.y = 0;
        if (this.position.y < 0)
            this.position.y = RENDERER.height;

        this.sprite.position.x = this.position.x;
        this.sprite.position.y = this.position.y;
        this.sprite.rotation = this.rotation;
    }

    StrataObject.prototype.onDown = function() {
        this._log("id: " + this.id 
            + " | pos: (" + 
            Math.floor(this.position.x) + "," + Math.floor(this.position.y) 
            + ") | vel: (" +
            this.velocity.x + "," + this.velocity.y
            + ")"
        );
    }

    StrataObject.prototype._log = function(message) {
        var textarea = document.getElementById("console-text");
        textarea.textContent += message + "\n";
        textarea.scrollTop = textarea.scrollHeight;
    }


    return StrataObject;
});