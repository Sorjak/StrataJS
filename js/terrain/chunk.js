define(['js/terrain/tile.js', 'js/lib/perlin.js', 'js/lib/vector2.js'], function(Tile, noise_module, Vector2) {

    function Chunk(width, height) {
        this.width = width;
        this.height = height;

        this.tiles = [];
    }

    return Chunk;

});