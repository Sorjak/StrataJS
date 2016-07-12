define(["js/terrain/strata_world.js", "js/entities/bunny.js", "js/entities/wolf.js", "js/entities/flower.js", "js/terrain/tile.js", "js/lib/astar.js"], 
        function(StrataWorld, Bunny, Wolf, Flower, Tile, Astar) {
        
    StrataGame = function()
    {
        this.running = true;
        this.entities = [];

        this.statObject = null;
        this.statConsole = document.getElementById("console-text");
        
        // wolf = new Wolf( this.world.tiles[20][20], SECOND_LAYER );
        // this.spawnEntity(Wolf);

        // for (var i = 4; i >= 0; i--) {
        //     this.spawnEntity(Bunny);
        // };

        // for (var i = 15; i >= 0; i--) {
        //     var ranTile = null;

        //     while (ranTile == null) {
        //         ranTile = this.getRandomTile();
        //         if (ranTile != null && !ranTile.fertile)
        //             ranTile = null;
        //     }

        //     flower = new Flower( ranTile, FIRST_LAYER, "orange_flower.png" );
        //     this.addObject(flower);
        // };
        
        this.graphics = new PIXI.Graphics();
        
    };

    StrataGame.prototype.start = function() {
        console.log("starting game");

        var w_width = document.getElementById("world-width").value;
        var w_height = document.getElementById("world-height").value;
        var tile_size = document.getElementById("tile-size").value;
        var chunk_size = document.getElementById("chunk-size").value;

        this.world = new StrataWorld( w_width, w_height, tile_size, chunk_size );
        this.astar = new Astar(this.world);

        return this.world.generateTiles();
    }

    StrataGame.prototype.update = function() {
        this.entities.forEach(function(entity) {
            entity.update(PIXI.ticker.shared.deltaTime);
        });

        if (this.statObject != null && this.statObject.health > 0) {
            this.statConsole.textContent = this.statObject.getStats();
        } else {
            this.statConsole.textContent = "";
        }
    }

    StrataGame.prototype.draw = function() {
        this.graphics.clear();
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
        var ranX = Math.floor(Math.random() * (this.world.tiles.length));
        var ranY = Math.floor(Math.random() * (this.world.tiles[0].length));

        var tile = this.getTileAtPosition(ranX, ranY);

        return tile;
    }

    StrataGame.prototype.getTileAtPosition = function(x, y) {
        var output = this.world.tiles[x][y];

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

    StrataGame.prototype.showStatsFor = function(id) {
        this.statObject = this.getObjectById(id);
    }


    // PRIVATE METHODS

    StrataGame.prototype.spawnEntity = function(entity) {
        var filtered = this.world.getTilesByTag('walkable');

        if (filtered.length > 0) {
            var ranIndex = Math.floor(Math.random() * (filtered.length - 1));
            var e = new entity(filtered[ranIndex], SECOND_LAYER);
            
            this.addObject(e);
        } else {
            console.log("unable to spawn entitity");
        }
    }

    
    // constructor
    StrataGame.prototype.constructor = StrataGame;

    return StrataGame;

});