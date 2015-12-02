define(["js/bunny.js", "js/flower.js", "js/tile.js", "js/lib/vector2.js", "js/lib/astar.js"], 
        function(Bunny, Flower, Tile, Vector2, Astar) {
        
    StrataGame = function()
    {
        this.running = true;
        this.entities = [];
        this.tiles = [];

        this.generateTiles();
        
        bunny = new Bunny( this.tiles[10][10] );

        this.addObject(bunny);

        for (var i = 10; i >= 0; i--) {
            var ranTile = null;

            while (ranTile == null) {
                ranTile = this.getRandomTile();
                if (ranTile != null && ranTile.weight == 0)
                    ranTile = null;
            }

            flower = new Flower( ranTile, "orange_flower.png" );
            this.addObject(flower);
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

    StrataGame.prototype.addObject = function(object) {
        this.entities[object.id] = object;
    }

    StrataGame.prototype.removeObject = function(object) {
        delete this.entities[object.id];
    }

    StrataGame.prototype.getObjectById = function(id) {
        return this.entities[id];
    }

    StrataGame.prototype.getRandomTile = function() {
        var ranX = Math.floor(Math.random() * (this.tiles.length));
        var ranY = Math.floor(Math.random() * (this.tiles[0].length));

        var tile = this.getTileAtPosition(ranX, ranY);

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
        
        for (var i = 0; i < (RENDERER.width / TILE_SIZE) - 1; i++) {
            this.tiles[i] = [];
            for (var j = 0; j < (RENDERER.height / TILE_SIZE) ; j++) {
                tile = new Tile( i, j );
                this.tiles[i][j] = tile;
            }
        }
    }


    
    // constructor
    StrataGame.prototype.constructor = StrataGame;

    return StrataGame;

});