define(["js/lib/keyboard.js"], function(Keyboard) {
    
    function Camera(stage) {
        this.stage = stage;

        this.movingRight = false;
        this.movingLeft = false;
        this.movingUp = false;
        this.movingDown = false;

        this.bindListeners();
    };

    Camera.prototype.bindListeners = function() {
        var left = new Keyboard(37);
        var camObj = this;

        left.press = function() {
            camObj.movingLeft = true;
        };
        left.release = function() {
            camObj.movingLeft = false;
        };

        var up = new Keyboard(38);
        up.press = function() {
            camObj.movingUp = true;
        };
        up.release = function() {
            camObj.movingUp = false;
        };

        var right = new Keyboard(39);
        right.press = function() {
            camObj.movingRight = true;
        };
        right.release = function() {
            camObj.movingRight = false;
        };

        var down = new Keyboard(40);
        down.press = function() {
            camObj.movingDown = true;
        };

        down.release = function() {
            camObj.movingDown = false;
        };

        if(window.onwheel !== undefined) {
            window.addEventListener('wheel', function(e) { camObj.zoom(e) });
        } else if(window.onmousewheel !== undefined) {
            window.addEventListener('mousewheel', function(e) { camObj.zoom(e) });
        } else {
            console.log("can't scroll sorry");
        }

        var space = new Keyboard(32)
        space.press = function() {
            game.running = !game.running;
        }
    };


    Camera.prototype.update = function() {
        if (this.movingLeft) {
            this.stage.position.x += 20;
        } 

        if (this.movingUp) {
            this.stage.position.y += 20;
        }

        if (this.movingRight) {
            this.stage.position.x -= 20;
        } 

        if (this.movingDown) {
            this.stage.position.y -= 20;
        }

    };

    Camera.prototype.zoom = function(e) {
        e.preventDefault();

        // if (e.wheelDelta > 0) {
        //     // Scroll up
        //     var prevScale = this.stage.scale;

        //     this.stage.scale = new PIXI.Point(prevScale.x + .1, prevScale.y + .1);

        // } else {
        //     // Scroll down

        //     var prevScale = this.stage.scale;

        //     this.stage.scale = new PIXI.Point(prevScale.x - .1, prevScale.y - .1);
        // }

    }


    return Camera;
});