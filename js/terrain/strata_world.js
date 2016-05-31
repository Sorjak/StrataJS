define(['js/terrain/tile.js', 'js/lib/perlin.js', 'js/lib/vector2.js'], function(Tile, noise_module, Vector2) {
    
    function StrataWorld(width, height) {
        this.width = width;
        this.height = height;


        this.chunks = [];
        this.tiles = [];

        noise_module.seed(Math.random());
    };


    StrataWorld.prototype.generateTiles = function() {
        this.tiles = this.generateChunk();

        // this.chunks[0] = [this.tiles];
    };

    StrataWorld.prototype.generateChunk = function() {
        var outputTiles = [];

        for (var i = 0; i < this.width - 1; i++) {
            outputTiles[i] = [];
            for (var j = 0; j < this.height ; j++) {
                var height = (noise_module.perlin2(i / 100, j / 100) + 1) / 2;
                tile = new Tile( i, j, height, TILES_CONTAINER);
                outputTiles[i][j] = tile;
            }
        }

        return outputTiles;
    }

    StrataWorld.prototype.getNeighborsForTile = function(tile, diagonal) {
        var x = tile.index.x;
        var y = tile.index.y;
        var output = [];
        
        //west
        if (this.tiles[x-1] && this.tiles[x-1][y]) {
            output.push(this.tiles[x-1][y]);
        }
        
        //north
        if (this.tiles[x] && this.tiles[x][y-1]) {
            output.push(this.tiles[x][y-1]);
        }
        
        //east
        if (this.tiles[x+1] && this.tiles[x+1][y]) {
            output.push(this.tiles[x+1][y]);
        }
        
        //south
        if (this.tiles[x] && this.tiles[x][y+1]) {
            output.push(this.tiles[x][y+1]);
        }
        

        if (diagonal) {
            //northwest
            if (this.tiles[x-1] && this.tiles[x-1][y-1]) {
                output.push(this.tiles[x-1][y-1]);
            }
            
            //northeast
            if (this.tiles[x+1] && this.tiles[x+1][y+1]) {
                output.push(this.tiles[x+1][y+1]);
            }
            
            //southwest
            if (this.tiles[x-1] && this.tiles[x-1][y+1]) {
                output.push(this.tiles[x-1][y+1]);
            }
            
            //southeast
            if (this.tiles[x+1] && this.tiles[x+1][y-1]) {
                output.push(this.tiles[x+1][y-1]);
            }
        }

        return output;
    }


    return StrataWorld;
})