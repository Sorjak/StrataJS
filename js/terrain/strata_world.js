define(['js/terrain/tile.js', 'js/lib/perlin.js', 'js/lib/vector2.js'], function(Tile, noise_module, Vector2) {
    
    function StrataWorld(width, height) {
        this.width = width;
        this.height = height;

        this.tile_size = 16;

        this.chunks = [];
        this.tiles = [];

        noise_module.seed(Math.random());

        var spritesheet = PIXI.Texture.fromImage("resources/generated/white_rough.png");

        this.sprites = {
            'center' : this.createSprite(spritesheet, 0, 0 * 16),
            'side'   : this.createSprite(spritesheet, 0, 1 * 16),
            'corner_inner' : this.createSprite(spritesheet, 0, 2 * 16),
            'corner_outer' : this.createSprite(spritesheet, 0, 3 * 16)
        };

        // TILES_CONTAINER.addChild(new PIXI.Sprite(spritesheet));
    };

    StrataWorld.prototype.createSprite = function(spritesheet, x, y) {
        var cropRect = new PIXI.Rectangle(x, y, this.tile_size, this.tile_size);
        var cropped = spritesheet.clone();
        cropped.frame = cropRect;
        cropped.crop = cropRect;

        var output = new PIXI.Sprite(cropped);
        output.position = new PIXI.Point(0, 0);

        return output;
    }

    StrataWorld.prototype.generateChunk = function(width, height) {
        var outputTiles = [];

        for (var i = 0; i < width - 1; i++) {
            outputTiles[i] = [];

            for (var j = 0; j < height; j++) {
                var perlin_height = (noise_module.perlin2(i / 100, j / 100) + 1) / 2;
                var tile = new Tile( i, j, perlin_height, TILES_CONTAINER);
                outputTiles[i][j] = tile;
            }
        }


        return outputTiles;
    }


    StrataWorld.prototype.generateTiles = function() {
        this.tiles = this.generateChunk(this.width, this.height);

        // this.chunks[0] = [this.tiles];

        for (var i = 0; i < this.width - 1; i++) {
            for (var j = 0; j < this.height; j++) {
                var tile = this.tiles[i][j];
                this.firstPass(tile);
                // TILES_CONTAINER.addChild(tile.sprite);
            }
        }

    };

    StrataWorld.prototype.firstPass = function(tile) {
        var newSprite = null;
        if (tile.height > .6) {
            newSprite = this.getOverlaySprite('center', 0);
            
        } else {

            var neighbors = this.getNeighborsForTile(tile, false);
            var qualifying = this.getNeighborsAboveValue(neighbors, .6);
            var left = right = up = down = false;

            if ((left || right) && !(up || down)) {
                if (left) newSprite = this.getOverlaySprite('side', 90);
                else newSprite = this.getOverlaySprite('side', 270);
            }
            if (!(left || right) && (up || down)) {
                if (up) newSprite = this.getOverlaySprite('side', 180);
            }
            if (left && up)
                newSprite = this.getOverlaySprite('')
        }

        if (newSprite != null) {
            newSprite.tint = 0x688358;
            tile.sprite.addChild(newSprite);
        }
    }

    StrataWorld.prototype.getNeighborsAboveValue = function(neighbors, value) {
        var output = [];
        for (var i = neighbors.length - 1; i >= 0; i--) {
            if (neighbors[i].height >= value) {
                output.push(neighbors[i]);
            }
        }

        return output;
    }

    StrataWorld.prototype.getTallestTile = function(tiles) {
        var max = 0;
        var tallest = 0;
        for (var i = tiles.length - 1; i >= 0; i--) {
            var t = tiles[i];
            if (t.height > max){
                max = t.height;
                tallest = t;
            }
        }

        return tallest;
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

    StrataWorld.prototype.getNeighborBitmask = function(neighbors) {
        // left = 1
        // top = 2
        // right = 4
        // down = 8

        var bitmask = 0;
        neighbors.forEach(function(t) {
            if (t.index.x + 1 == tile.index.x) bitmask |= 1;
            else if (t.index.x - 1 == tile.index.x) bitmask |= 4;

            if (t.index.y + 1 == tile.index.y) bitmask != 2;
            else if (t.index.y - 1 == tile.index.y) bitmask |= 8;
        });
    }

    StrataWorld.prototype.getOverlaySprite = function(index, rotation) {
        var ren = this.sprites[index].generateTexture(RENDERER);
        output = new PIXI.Sprite(ren);
        output.anchor = new PIXI.Point(.5, .5);
        output.position = new PIXI.Point(8, 8);
        output.rotation = rotation * (Math.PI / 180);

        return output;
    }


    return StrataWorld;
})