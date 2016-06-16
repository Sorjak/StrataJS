define(['js/terrain/tile.js', 'js/lib/perlin.js', 'js/lib/vector2.js'], function(Tile, noise_module, Vector2) {

    var TILE_POSITION = {
            left:       1,
            up:         2,
            right:      4,
            down:       8,
            upleft:     16,
            upright:    32,
            downleft:   64,
            downright:  128
    };
    
    function StrataWorld(width, height) {
        this.width = width;
        this.height = height;

        this.tile_size = 16;

        this.chunks = [];
        this.tiles = [];

        noise_module.seed(Math.random());

        var grass_spritesheet = PIXI.Texture.fromImage("resources/generated/white_rough.png");

        this.sprites = {};

        this.sprites['grass'] = {
            'center' : [],
            'side'   : [],
            'corner_inner' : [],
            'corner_outer' : []
        };

        for (var i = 0; i < (grass_spritesheet.width / this.tile_size); i++) {

            this.sprites['grass']['center'].push(this.createSprite(grass_spritesheet, i * 16, 0 * 16));
            this.sprites['grass']['side'].push(this.createSprite(grass_spritesheet, i * 16, 1 * 16));
            this.sprites['grass']['corner_inner'].push(this.createSprite(grass_spritesheet, i * 16, 2 * 16));
            this.sprites['grass']['corner_outer'].push(this.createSprite(grass_spritesheet, i * 16, 3 * 16));
        }


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
                var perlin_height = (noise_module.simplex2(i / 100, j / 100) + 1) / 2;
                var tile = new Tile( i, j, perlin_height, TILES_CONTAINER);
                outputTiles[i][j] = tile;
            }
        }


        return outputTiles;
    }


    StrataWorld.prototype.generateTiles = function() {
        this.tiles = this.generateChunk(this.width, this.height);

        for (var i = 0; i < this.width - 1; i++) {
            for (var j = 0; j < this.height; j++) {
                var tile = this.tiles[i][j];
                if (this.processTile(tile, 'grass', 0x688358, .2, .5)) {
                    tile.tags.add('walkable');
                }
                else if (this.processTile(tile, 'grass', 0x68CC58, .5, .9)) {
                    
                }
                else if (this.processTile(tile, 'grass', 0xFFCC58, .9, 1)) {
                    
                }
            }
        }
    };

    StrataWorld.prototype.processTile = function(tile, sprite_type, tint, minheight, maxheight) {
        var newSprite = null;
        if (tile.height >= minheight && tile.height < maxheight) {
            newSprite = this.getOverlaySprite(sprite_type, 'center', 0);
            
        } else {

            var neighbors = this.getNeighborsForTile(tile, false);
            var qualifying = this.getQualifyingNeighbors(neighbors, minheight, maxheight);
            var bm = this.getNeighborBitmask(tile, qualifying);

            if      (bm == TILE_POSITION.left) newSprite        = this.getOverlaySprite(sprite_type, 'side', 90);
            else if (bm == TILE_POSITION.right) newSprite       = this.getOverlaySprite(sprite_type, 'side', 270);
            else if (bm == TILE_POSITION.up) newSprite          = this.getOverlaySprite(sprite_type, 'side', 180);
            else if (bm == TILE_POSITION.down) newSprite        = this.getOverlaySprite(sprite_type, 'side', 0);
            else if (bm == TILE_POSITION.upleft) newSprite      = this.getOverlaySprite(sprite_type, 'corner_outer', 0);
            else if (bm == TILE_POSITION.upright) newSprite     = this.getOverlaySprite(sprite_type, 'corner_outer', 90);
            else if (bm == TILE_POSITION.downleft) newSprite    = this.getOverlaySprite(sprite_type, 'corner_outer', 270);
            else if (bm == TILE_POSITION.downright) newSprite   = this.getOverlaySprite(sprite_type, 'corner_outer', 180);
            else if (bm == TILE_POSITION.left + TILE_POSITION.up) newSprite     = this.getOverlaySprite(sprite_type, 'corner_inner', 180);
            else if (bm == TILE_POSITION.left + TILE_POSITION.down) newSprite   = this.getOverlaySprite(sprite_type, 'corner_inner', 90);
            else if (bm == TILE_POSITION.right + TILE_POSITION.up) newSprite    = this.getOverlaySprite(sprite_type, 'corner_inner', 270);
            else if (bm == TILE_POSITION.right + TILE_POSITION.down) newSprite  = this.getOverlaySprite(sprite_type, 'corner_inner', 0);

        }

        if (newSprite != null) {
            newSprite.tint = tint;
            tile.sprite.addChild(newSprite);

            return true;
        }

        return false;
    }

    StrataWorld.prototype.getQualifyingNeighbors = function(neighbors, min, max) {
        var output = [];
        for (var i = neighbors.length - 1; i >= 0; i--) {
            if (neighbors[i].height >= min && neighbors[i].height < max) {
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

    StrataWorld.prototype.getNeighborBitmask = function(tile, neighbors) {
        var bitmask = 0;
        neighbors.forEach(function(t) {
            if (t.index.x + 1 == tile.index.x) {
                if (t.index.y + 1 == tile.index.y) bitmask |= TILE_POSITION.upleft;
                else if (t.index.y - 1 == tile.index.y) bitmask |= TILE_POSITION.downleft;
                else bitmask |= TILE_POSITION.left;
            } 
            else if (t.index.x - 1 == tile.index.x){
                if (t.index.y + 1 == tile.index.y) bitmask |= TILE_POSITION.upright;
                else if (t.index.y - 1 == tile.index.y) bitmask |= TILE_POSITION.downright;
                else bitmask |= TILE_POSITION.right;
            } else {
                if (t.index.y + 1 == tile.index.y) bitmask |= TILE_POSITION.up;
                else if (t.index.y - 1 == tile.index.y) bitmask |= TILE_POSITION.down;
            }
        });

        return bitmask
    }

    StrataWorld.prototype.getOverlaySprite = function(type, index, rotation) {
        var sprite_index = Math.floor(Math.random() * this.sprites[type][index].length);
        var ren = this.sprites[type][index][sprite_index].generateTexture(RENDERER);
        output = new PIXI.Sprite(ren);
        output.anchor = new PIXI.Point(.5, .5);
        output.position = new PIXI.Point(8, 8);
        output.rotation = rotation * (Math.PI / 180);

        return output;
    }

    // PUBLIC 

    StrataWorld.prototype.getTilesByTag = function(tag) {
        var output = [];
        for (var i = this.tiles.length - 1; i >= 0; i--) {
            output = output.concat(
                this.tiles[i].filter(function(tile){
                    return tile.tags.has(tag);
                })
            );
        };

        return output;
    }


    return StrataWorld;
})