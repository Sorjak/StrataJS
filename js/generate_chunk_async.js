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

            function GenerateChunk(chunk, tile_size, seed, db) {
                // We use the same seed across all Workers, so the smooth noise still works
                noise_module.seed(seed);
                var promiseList = [];

                postMessage({'type': 'progress', 'info' : "Begin Noise Creation"});

                for (var i = 0; i < chunk.width; i++) {
                    for (var j = 0; j < chunk.height; j++) {
                        
                        // Here we adjust the x and y values of the tile to map onto the simplex noise
                        var adjustedX = i + (chunk.position.x * chunk.width);
                        var adjustedY = j + (chunk.position.y * chunk.height);

                        // Find adjusted noise value, and remap that to 0, 1
                        var perlin_height = (noise_module.simplex2(adjustedX / 100, adjustedY / 100) + 1) / 2;

                        var tile = new Tile(chunk.chunk_id, i, j, tile_size, perlin_height);

                        // Here we add the tile to the database for later querying. 
                        // Also, we send a status update back to the main thread.
                        var prom = db.tiles.add(tile).then(function(db_tile) {
                            mytile = db_tile[0];
                            var tile_num = mytile.index.x * chunk.height + mytile.index.y;
                            var percentage = Math.floor((tile_num / (chunk.width * chunk.height)) * 100);
                            postMessage({'type': 'progress', 'info' : "Creating tiles: " + percentage + "%"});
                        });
                        promiseList.push(prom);
                    }
                }

                // Once all the tiles are in the DB, we tell the main thread that we are done.
                Promise.all(promiseList).then(function(e) {
                    console.log("worker " + chunk.chunk_id + " finished creating tiles");
                    postMessage({'type': 'finished'});
                });
            }

            dbjs.open({
                server: 'strata-db',
                version: 1,
            }).then(function(database) {
                GenerateChunk(data.chunk, data.tile_size, data.seed, database);
            });

        });
    }

}

function sleep(miliseconds) {
    var currentTime = new Date().getTime();
    while (currentTime + miliseconds >= new Date().getTime()) {}
}


