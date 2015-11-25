
define(function() {
    "use strict";

    function StrataObject(position, path) {
        this.initSprite(position, path);

        this.position = this.sprite.position;
        this.rotation = this.sprite.rotation;
        this.speed = new PIXI.Point(0, 0);

        var myObj = this;

        this.sprite.on('mousedown', function() {
            myObj.onDown();
        });
        this.sprite.on('touchstart', function() {
            myObj.onDown();
        });
    };

    StrataObject.prototype.initSprite = function(pos, path) {
        this.sprite = new PIXI.Sprite.fromImage(path);

        this.sprite.anchor = new PIXI.Point(.5, .5);
        this.sprite.position = pos;
        this.sprite.scale.x = .1;
        this.sprite.scale.y = .1;

        this.sprite.interactive = true;

        STAGE.addChild(this.sprite);
    }

    StrataObject.prototype.draw = function() {

    }

    StrataObject.prototype.update = function() {
        this.position.x += this.speed.x;
        this.position.y += this.speed.y;

        if (this.position.x > RENDERER.width)
            this.position.x = 0;
        if (this.position.x < 0)
            this.position.x = RENDERER.width;

        if (this.position.y > RENDERER.height)
            this.position.y = 0;
        if (this.position.y < 0)
            this.position.y = RENDERER.height;

        this.sprite.position = this.position
        this.sprite.rotation = this.rotation;
    }

    StrataObject.prototype.onDown = function() {

    }


    return StrataObject;
});