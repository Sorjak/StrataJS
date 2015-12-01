define(["js/bunny.js", "js/flower.js", "js/tile.js", "js/lib/vector2.js", "js/lib/astar.js"], 
        function(Bunny, Flower, Tile, Vector2, Astar) {
        
    StrataGame = function()
    {
        this.running = true;
        this.entities = new Set();
        this.tiles = [];

        this.generateTiles();
        
        bunny = new Bunny( this.tiles[10][10] );

        this.entities.add(bunny);

        for (var i = 10; i >= 0; i--) {
            rX = Math.floor(Math.random() * this.tiles.length);
            rY = Math.floor(Math.random() * this.tiles[0].length);
        
            flower = new Flower( this.tiles[rX][rY], "orange" );
            this.entities.add(flower);
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

    // PUBLIC METHODS

    StrataGame.prototype.getRandomTile = function() {
        var ranX = Math.floor(Math.random() * (RENDERER.width / TILE_SIZE));
        var ranY = Math.floor(Math.random() * (RENDERER.width / TILE_SIZE));

        var tile = game.getTileAtPosition(ranX, ranY);

        return tile;
    }

    StrataGame.prototype.getTileAtPosition = function(x, y) {
        var output = this.tiles[x][y];


        return output ? output : null;
    }

    StrataGame.prototype.getObjectsByTag = function(tag) {
        output = [];
        this.entities.forEach(function(entity) {
            if (entity.tags.has(tag))
                output.push(entity);
        });

        return output;
    }


    // PRIVATE METHODS

    StrataGame.prototype.generateTiles = function() {
        
        for (var i = 0; i < (RENDERER.width / TILE_SIZE); i++) {
            this.tiles[i] = [];
            for (var j = 0; j < (RENDERER.height / TILE_SIZE); j++) {
                tile = new Tile( i, j );
                this.tiles[i][j] = tile;
            }
        }
    }


    
    // constructor
    StrataGame.prototype.constructor = StrataGame;

    return StrataGame;

});