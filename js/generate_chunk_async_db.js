/*
    author: uli

    Web Worker (thread) to parallelize tile creation within a chunk.

    This returns (via json) a 2D array of tiles, each containing a 
    - chunk_id : refers to the parent chunk
    - index : refers to the tile's x, y position within the chunk
    - position : same as index, but adjusted to tile size for display
    - height : noise determined height of tile

*/

importScripts('lib/require.js');

// on message allows us to receive input from spawner script (StrataWorld.js in this case)
onmessage = function(e) {
    var data = e.data;

    if (data.type == 'init') {
        // require the necessary objects from other scripts
        requirejs(['terrain/chunk.js', 'terrain/tile.js', 'lib/vector2.js', 'lib/perlin.js', 'lib/db.min.js'], 
            function(Chunk, Tile, Vector2, noise_module, dbjs) {

            function GenerateChunk(chunk, seed) {
                noise_module.seed(seed);

                dbjs.open({
                    server: 'strata-db',
                    version: 1,
                }).then(function(database) {
                    console.log("starting worker " + data.chunk.chunk_id );

                    var tilesList = [];
                    var promiseList = [];

                    postMessage({'type': 'progress', 'info' : "Opened database"});

                    for (var i = 0; i < chunk.width; i++) {
                        tilesList[i] = [];

                        for (var j = 0; j < chunk.height; j++) {
                            // Here we adjust the x and y values of the tile to map onto the simplex noise
                            var adjustedX = i + (chunk.position.x * chunk.width);
                            var adjustedY = j + (chunk.position.y * chunk.height);

                            // Find adjusted noise value, and remap that to 0, 1
                            var perlin_height = (noise_module.simplex2(adjustedX / 100, adjustedY / 100) + 1) / 2;

                            var insertTile = {
                                'chunk_id': chunk.chunk_id,
                                'index': new Vector2(i, j),
                                'position': new Vector2(i * 16, j * 16),
                                'height': perlin_height
                            };

                            tilesList[i][j] = new Tile(i, j, 16, perlin_height);

                            promiseList.push( 
                                database.tiles.add(insertTile).then( function(db_tile) {
                                    var percentage = "Creating tile: " + db_tile[0].tile_id;
                                    postMessage({'type': 'progress', 'info' : percentage});
                                }) 
                            );
                            
                        }
                    }

                    Promise.all(promiseList).then(function(e) {
                        // Return 2D array of tiles
                        postMessage({'type': 'output', 'tiles' : tilesList});
                        database.close();
                    });
                    
                }).catch(function(err) {
                    console.log(err);
                });
            }


            GenerateChunk(data.chunk, data.seed);

        });
    }

}


