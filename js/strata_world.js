define(['js/tile.js'], function(Tile) {
    
    function StrataWorld(width, height) {
        this.width = width;
        this.height = height;

        this.tiles = [];
    };


    StrataWorld.prototype.generateTiles = function() {
        for (var i = 0; i < this.width - 1; i++) {
            this.tiles[i] = [];
            for (var j = 0; j < this.height ; j++) {
                tile = new Tile( i, j, TILES_CONTAINER);
                this.tiles[i][j] = tile;
            }
        }
    };


    return StrataWorld;
});