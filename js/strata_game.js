define(["js/bunny.js", "js/flower.js", "js/tile.js", "js/lib/vector2.js", "js/lib/astar.js"], 
        function(Bunny, Flower, Tile, Vector2, Astar) {
        
    StrataGame = function()
    {
        this.running = true;
        this.entities = [];
        this.tiles = [];

        this.generateTiles();
        
        bunny = new Bunny( this.tiles[10][10] );

        this.entities.push(bunny);

        for (var i = 10; i >= 0; i--) {
            rX = Math.floor(Math.random() * this.tiles.length);
            rY = Math.floor(Math.random() * this.tiles[0].length);
        
            flower = new Flower( this.tiles[rX][rY], "orange" );
            this.entities.push(flower);
        };
        
        this.astar = new Astar(this.tiles);
        
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

    StrataGame.prototype.generateTiles = function() {
        
        for (var i = 0; i < (RENDERER.width / TILE_SIZE); i++) {
            this.tiles[i] = [];
            for (var j = 0; j < (RENDERER.height / TILE_SIZE); j++) {
                tile = new Tile( i, j );
                this.tiles[i][j] = tile;
            }
        }
    }

    StrataGame.prototype.pickFlower = function(flowerTile) {
        this.entities.forEach(function(entity) {
            if (entity instanceof Bunny) {
                entity.goTo(flowerTile);
            }
        });
        
    }
    
    // constructor
    StrataGame.prototype.constructor = StrataGame;

    return StrataGame;

});