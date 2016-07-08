define(['js/terrain/tile.js', 'js/lib/perlin.js', 'js/lib/vector2.js', 'js/terrain/chunk.js'], 
    function(Tile, noise_module, Vector2, Chunk) {

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
    
    function StrataWorld(width, height, tile_size, chunk_size) {

        console.log(width + " " + height + " " + tile_size + " " + chunk_size);
        this.width = parseInt(width, 10);
        this.height = parseInt(height, 10);

        this.tile_size = parseInt(tile_size, 10);
        this.chunk_size = parseInt(chunk_size, 10);

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

    StrataWorld.prototype.generateTiles = function() {
        var waterColor      = 0x3C5C91;
        var grassColor      = 0x688358;
        var highlandsColor  = 0x68CC58;
        var mountainsColor  = 0xFFCC58;

        var self = this;
        var promiseList = [];

        for (var x = 0; x < self.width; x++) {

            for (var y = 0; y < self.height; y++) {

                var prom = self.generateChunk(x, y, self.chunk_size, self.chunk_size)
                .then(function(chunk) {
                return Chunk.getTilesAs2DArray(chunk.chunk_id)
                    .catch(function(err) {
                        console.log(err);
                    })
                    .then(function (tiles) {
                        for (var i = 0; i < chunk.width; i++) {
                            for (var j = 0; j < chunk.height; j++) {

                                var tile = tiles[i][j];

                                LOAD_TEXT.text = "Generating Tile " + tile.tile_id 
                                + "/" + (chunk.width * chunk.height) * (self.width * self.height);
                                RENDERER.render(STAGE);

                                var sprite = new PIXI.Container();
                                sprite.height = self.tile_size; 
                                sprite.width = self.tile_size;
                                
                                sprite.position.x = tile.position.x;
                                sprite.position.y = tile.position.y;

                                var backgroundColor = 0x3C5C91;

                                var graphics = new PIXI.Graphics();
                                graphics.beginFill(backgroundColor);
                                graphics.drawRect(0, 0, self.tile_size, self.tile_size);

                                sprite.addChild(graphics);

                                if (self.processTile(sprite, tiles, tile, 'grass', mountainsColor, .8, 1)) {
                                    graphics.beginFill(highlandsColor);
                                    graphics.drawRect(0, 0, TILE_SIZE, TILE_SIZE);  
                                }
                                else if (self.processTile(sprite, tiles, tile, 'grass', highlandsColor, .3, .8)) {
                                    graphics.beginFill(grassColor);
                                    graphics.drawRect(0, 0, TILE_SIZE, TILE_SIZE);
                                    // tile.tags.add('walkable');
                                }
                                else if (self.processTile(sprite, tiles, tile, 'grass', grassColor, .2, .3)) {
                                    graphics.beginFill(waterColor);
                                    graphics.drawRect(0, 0, TILE_SIZE, TILE_SIZE);
                                    // tile.tags.add('walkable');
                                }

                                TILES_CONTAINER.addChild(sprite);
                            }
                        }
                    }); // end db query

                }); // end generateChunk

                promiseList.push(prom);
            }
        }
        return Promise.all(promiseList);
    };

    StrataWorld.prototype.generateChunk = function(x, y, width, height) {
        var c = new Chunk(width, height);
        var self = this;

        return DATABASE.chunks.add(c).then(function(dbchunk) {
            var chunk = dbchunk[0];

            LOAD_TEXT.text = "Generating Chunk " + chunk.chunk_id;
            RENDERER.render(STAGE);

            var offsetX = x * chunk.width;
            var offsetY = y * chunk.height;

            for (var i = 0; i < chunk.width; i++) {

                for (var j = 0; j < chunk.height; j++) {
                    var adjustedX = i + offsetX;
                    var adjustedY = j + offsetY;
                    var perlin_height = (noise_module.simplex2(adjustedX / 100, adjustedY / 100) + 1) / 2;
                    // var tile = new Tile(i, j, offsetX, offsetY, perlin_height, TILES_CONTAINER);
                    var tile = {
                        'chunk_id': chunk.chunk_id,
                        'index': new Vector2(i, j),
                        'position': new Vector2(adjustedX * self.tile_size, adjustedY * self.tile_size),
                        'height': perlin_height
                    };
                    Chunk.addTile(tile);
                }
            }

            return chunk;
        }).catch(function(e) {
            console.log(e);
            return null;
        });  
        
    }

    StrataWorld.prototype.processTile = function(container, tiles, tile, sprite_type, tint, minheight, maxheight) {
        var newSprite = null;
        if (tile.height >= minheight && tile.height < maxheight) {
            newSprite = this.getOverlaySprite(sprite_type, 'center', 0);
            
        } else {

            var neighbors = this.getNeighborsForTile(tiles, tile, false);
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
            container.addChild(newSprite);

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

    StrataWorld.prototype.getNeighborsForTile = function(tiles, tile, diagonal) {
        var x = tile.index.x;
        var y = tile.index.y;
        var output = [];
        
        //west
        if (tiles[x-1] && tiles[x-1][y]) {
            output.push(tiles[x-1][y]);
        }
        
        //north
        if (tiles[x] && tiles[x][y-1]) {
            output.push(tiles[x][y-1]);
        }
        
        //east
        if (tiles[x+1] && tiles[x+1][y]) {
            output.push(tiles[x+1][y]);
        }
        
        //south
        if (tiles[x] && tiles[x][y+1]) {
            output.push(tiles[x][y+1]);
        }
        

        if (diagonal) {
            //northwest
            if (tiles[x-1] && tiles[x-1][y-1]) {
                output.push(tiles[x-1][y-1]);
            }
            
            //northeast
            if (tiles[x+1] && tiles[x+1][y+1]) {
                output.push(tiles[x+1][y+1]);
            }
            
            //southwest
            if (tiles[x-1] && tiles[x-1][y+1]) {
                output.push(tiles[x-1][y+1]);
            }
            
            //southeast
            if (tiles[x+1] && tiles[x+1][y-1]) {
                output.push(tiles[x+1][y-1]);
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
        // for (var i = this.tiles.length - 1; i >= 0; i--) {
        //     output = output.concat(
        //         this.tiles[i].filter(function(tile){
        //             return tile.tags.has(tag);
        //         })
        //     );
        // };

        return output;
    }


    return StrataWorld;
})