define(['js/terrain/tile.js', 'js/lib/perlin.js', 'js/lib/vector2.js'], function(Tile, noise_module, Vector2) {

    function Chunk(width, height) {
        this.width = width;
        this.height = height;

        // this.tiles = [];
    }

    Chunk.addTile = function(tile) {
        
        return DATABASE.tiles.add(tile)
            .then(function(e) {
                console.log("adding tile to db");
            })
            .catch(function(e) {
                console.log(e);
            });    
    };

    Chunk.getTiles = function(chunk_id) {
        return DATABASE.tiles.query()
        .filter('chunk_id', chunk_id)
        .execute()
        .then(function(tiles) {
            return tiles;
        });
    }

    Chunk.getTilesAs2DArray = function(chunk_id) {
        return this.getTiles(chunk_id).then(function(tiles) {
            output = [];
            tiles.forEach(function(tile) {
                if (output[tile.index.x] == undefined) {
                    output[tile.index.x] = [];
                    output[tile.index.x][tile.index.y] = tile;
                }

                else {
                    output[tile.index.x][tile.index.y] = tile;
                }
            });

            return output;
        });


    }

    return Chunk;

});