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
        requirejs(['terrain/tile.js', 'lib/vector2.js', 'lib/perlin.js', 'lib/db.min.js', 'utils.js'],
            function(Tile, Vector2, noise_module, dbjs, Utils) {

            function GenerateChunk(chunk, tile_size, seeds, db) {
                // We use the same seed across all Workers, so the smooth noise still works
                noise_module.seed(seeds.elevation);
                var promiseList = [];
                var tilesList = [];

                postMessage({'type': 'progress', 'info' : "Begin Noise Creation"});

                for (var i = 0; i < chunk.width; i++) {
                    tilesList[i] = [];
                    for (var j = 0; j < chunk.height; j++) {

                        // Here we adjust the x and y values of the tile to map onto the simplex noise
                        var adjustedX = i + (chunk.position.x * chunk.width);
                        var adjustedY = j + (chunk.position.y * chunk.height);

                        // Find adjusted noise value, and remap that to 0, 1
                        var perlin_height = noise_module.simplex2(adjustedX / 120, adjustedY / 120);

                        var tile = new Tile(chunk.chunk_id, i, j, tile_size, perlin_height);
                        tilesList[i][j] = tile;

                    }
                }

                for (var i = 0; i < chunk.width; i++) {
                    for (var j = 0; j < chunk.height; j++) {

                        var tile = tilesList[i][j];

                        if (tile.height > -0.3 && tile.height <= -0.1) {
                            tile.terrain_type = "beach";
                        } else if (tile.height > -0.1 && tile.height <= 0.3) {
                            tile.terrain_type = "lowGrass";
                        } else if (tile.height > 0.3 && tile.height <= 0.7) {
                            tile.terrain_type = "highGrass";
                        } else if (tile.height > 0.7 && tile.height <= 0.9) {
                            tile.terrain_type = "mountain";
                        } else if (tile.height > .9) {
                            tile.terrain_type = "snow";
                        }

                        var neighbors = Utils.getNeighborsForTile(tilesList, tile, true);
                        tile.neighbors.add(neighbors);

                        // var prom = db.tiles.add(tile).then(function(db_tile) {
                        var prom = new Promise(function(resolve, reject) {
                            var tile_num = tile.index.x * chunk.height + tile.index.y;
                            var percentage = Math.floor((tile_num / (chunk.width * chunk.height)) * 100);
                            postMessage({'type': 'progress', 'info' : "Creating tiles: " + percentage + "%"});
                            resolve(tile);
                        });

                        promiseList.push(prom);

                    }
                }

                // Once all the tiles are in the DB, we tell the main thread that we are done.
                Promise.all(promiseList).then(function(unsorted_tiles) {
                    console.log("worker " + chunk.chunk_id + " finished creating tiles");

                    postMessage({'type': 'finished', 'output' : tilesList});
                });
            }

            dbjs.open({
                server: 'strata-db',
                version: 1,
            }).then(function(database) {
                GenerateChunk(data.chunk, data.tile_size, data.seeds, database);
            });

        });
    }
}

function sleep(miliseconds) {
    var currentTime = new Date().getTime();
    while (currentTime + miliseconds >= new Date().getTime()) {}
}

