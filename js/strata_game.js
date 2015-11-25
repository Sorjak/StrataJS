define(["js/bunny.js", "js/orange_flower.js"], 
        function(Bunny, OrangeFlower) {

    StrataGame = function()
    {
        this.entities = [];

        bunny = new Bunny( new PIXI.Point(50, 100) );
        // flower = new OrangeFlower( new PIXI.Point(330, 300) );

        this.entities.push(bunny);

        for (var i = 10; i >= 0; i--) {
            rX = ((Math.random() * 1000) + 10) % RENDERER.width;
            rY = ((Math.random() * 1000) + 10) % RENDERER.height;

            flower = new OrangeFlower( new PIXI.Point(rX, rY) );
            this.entities.push(flower);
        };
    };

    StrataGame.prototype.update = function() {
        this.entities.forEach(function(entity) {
            entity.update(PIXI.ticker.shared.deltaTime);
        });
    }

    StrataGame.prototype.draw = function() {
        this.entities.forEach(function(entity) {
            entity.draw();
        });
    }

    StrataGame.prototype.handleInput = function() {
        console.log("handling input");
    }

    StrataGame.prototype.pickFlower = function(flowerLocation) {
        this.entities.forEach(function(entity) {
            if (entity instanceof Bunny)
                entity.goTo(flowerLocation);
        });
        
    }


    // constructor
    StrataGame.prototype.constructor = StrataGame;

    return StrataGame;

});