// importScripts('./tile.js', '../lib/perlin.js', '../lib/vector2.js', './chunk.js');

importScripts('lib/require.js');

onmessage = function(e) {
    var data = e.data;

    chunk = data.chunk;

    requirejs(['terrain/chunk.js', 'terrain/tile.js', 'lib/vector2.js', 'lib/perlin.js'], 
        function(Chunk, Tile, Vector2, noise_module) {

        function GenerateChunk(x, y, width, height) {

            var offsetX = x * chunk.width;
            var offsetY = y * chunk.height;

            var tilesList = [];

            for (var i = 0; i < chunk.width; i++) {
                tilesList[i] = [];

                for (var j = 0; j < chunk.height; j++) {
                    var adjustedX = i + offsetX;
                    var adjustedY = j + offsetY;
                    var perlin_height = (noise_module.simplex2(adjustedX / 100, adjustedY / 100) + 1) / 2;

                    tilesList[i][j] = {
                        'chunk_id': chunk.chunk_id,
                        'index': new Vector2(i, j),
                        'position': new Vector2(adjustedX * 16, adjustedY * 16),
                        'height': perlin_height
                    };
                }
            }

            postMessage(tilesList);
        }

        GenerateChunk(data.x, data.y, data.width, data.height);

    });


}


