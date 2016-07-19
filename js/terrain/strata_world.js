define(['js/terrain/tile.js', 'js/lib/vector2.js', 'js/terrain/chunk.js', 'js/utils.js'], 
    function(Tile, Vector2, Chunk, Utils) {

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
        this.width = parseInt(width, 10);
        this.height = parseInt(height, 10);

        this.tile_size = parseInt(tile_size, 10);
        this.chunk_size = parseInt(chunk_size, 10);

        this.chunks = {};

        this.seeds = {
            'elevation' : Math.random(),
            'fertility' : Math.random(),
        };

        var grass_spritesheet = PIXI.Texture.fromImage("resources/generated/white_rough.png");

        this.waterColor      = 0x3C5C91;
        this.grassColor      = 0x688358;
        this.highlandsColor  = 0x68CC58;
        this.mountainsColor  = 0xFFCC58;

        // this.sprites = {};

        // this.sprites['grass'] = {
        //     'center' : [],
        //     'side'   : [],
        //     'corner_inner' : [],
        //     'corner_outer' : []
        // };

        // for (var i = 0; i < (grass_spritesheet.width / this.tile_size); i++) {

        //     this.sprites['grass']['center'].push(this.createSprite(grass_spritesheet, i * 16, 0 * 16));
        //     this.sprites['grass']['side'].push(this.createSprite(grass_spritesheet, i * 16, 1 * 16));
        //     this.sprites['grass']['corner_inner'].push(this.createSprite(grass_spritesheet, i * 16, 2 * 16));
        //     this.sprites['grass']['corner_outer'].push(this.createSprite(grass_spritesheet, i * 16, 3 * 16));
        // }

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

    StrataWorld.prototype.generateWorld = function() {
        var world = this;
        var promiseList = [];

        for (var x = 0; x < world.width; x++) {

            for (var y = 0; y < world.height; y++) {

                var prom = world.generateChunkAsync(x, y, world.chunk_size, world.chunk_size)

                promiseList.push(prom);
            }
        }

        return Promise.all(promiseList).then(function(chunks) {
            LOAD_TEXT.removeChildren();
            var drawPromises = []
            chunks.forEach(function(data) {
                var prom = world.drawChunk(data.chunk, data.tiles);
                drawPromises.push(prom);
            });

            return Promise.all(drawPromises);
        });
    };

    StrataWorld.prototype.generateChunkAsync = function(x, y, width, height) {
        var c = new Chunk(x, y, width, height);
        var world = this;

        return DATABASE.chunks.add(c).then(function(dbchunk) {
            var chunk = dbchunk[0];
            var chunk_text = new PIXI.Text("Chunk " + chunk.chunk_id + " Loading", 
                {font:"24px Arial", fill:0xFFFFFF});
            chunk_text.x = 10;
            chunk_text.y = 30 * chunk.chunk_id;
            LOAD_TEXT.addChild(chunk_text);
            RENDERER.render(STAGE);
            
            return new Promise(function(resolve, reject) {
                w = new Worker("js/generate_chunk_async.js");

                w.postMessage(
                    {
                        'type' : 'init',
                        'chunk' : chunk,
                        'tile_size': world.tile_size,
                        'seeds' : world.seeds
                    }
                );

                w.onmessage = function(e) {
                    if (e.data.type == "finished") {
                        chunk_text.text = "Chunk " + chunk.chunk_id + " Finished";
                        chunk_text.tint = 0x00FF00;
                        RENDERER.render(STAGE);

                        resolve({'chunk' : chunk, 'tiles' : e.data.output });   

                    } else if (e.data.type == "progress") {
                        chunk_text.text = "Chunk " + chunk.chunk_id + " " + e.data.info;
                        RENDERER.render(STAGE);
                    }
                    
                } // end onmessage

                w.onerror = function(e) {
                    console.error(e);
                }

            }); // end worker promise

        }); // end database add
    }

    StrataWorld.prototype.drawChunk = function(chunk, tiles) {
        var world = this;
        var chunk_text = new PIXI.Text("Chunk " + chunk.chunk_id + " Drawing", 
            {font:"24px Arial", fill:0xFFFFFF});
        chunk_text.x = 10;
        chunk_text.y = 30 * chunk.chunk_id;
        LOAD_TEXT.addChild(chunk_text);
        RENDERER.render(STAGE);

        // return Chunk.getTilesAs2DArray(chunk.chunk_id)
        // .then(function (tiles) {
            var chunkContainer = new PIXI.Container();
            var promiseList = [];

            for (var i = 0; i < chunk.width; i++) {
                for (var j = 0; j < chunk.height; j++) {

                    var tile = tiles[i][j];

                    var prom = new Promise(function(resolve, reject) {

                        var sprite = Tile.initSprite(tile.position.x, tile.position.y, 
                            world.tile_size, world.tile_size, world.waterColor);
                        var graphics = sprite.children[0];

                        // if (world.processTile(sprite, tiles, tile, 'grass', world.mountainsColor, .8, 1)) {
                        //     graphics.beginFill(world.highlandsColor);
                        //     graphics.drawRect(0, 0, TILE_SIZE, TILE_SIZE);  
                        // }
                        // else if (world.processTile(sprite, tiles, tile, 'grass', world.highlandsColor, .3, .8)) {
                        //     graphics.beginFill(world.grassColor);
                        //     graphics.drawRect(0, 0, TILE_SIZE, TILE_SIZE);
                        // }
                        // else if (world.processTile(sprite, tiles, tile, 'grass', world.grassColor, .2, .3)) {
                        //     graphics.beginFill(world.waterColor);
                        //     graphics.drawRect(0, 0, TILE_SIZE, TILE_SIZE);
                        // }

                        var color = world.mapHeightToColor(tile.height, 10000);

                        graphics.beginFill(color);
                        graphics.drawRect(0, 0, world.tile_size, world.tile_size);

                        chunkContainer.addChild(sprite);
                        resolve(sprite);
                    });

                    promiseList.push(prom);
                }
            }

            return Promise.all(promiseList).then(function(sprites) {
                var offsetX = chunk.position.x * chunk.width * world.tile_size;
                var offsetY = chunk.position.y * chunk.height * world.tile_size;

                var tex = chunkContainer.generateTexture(RENDERER);
                var chunkSprite = new PIXI.Sprite(tex);
                chunkSprite.position = new PIXI.Point(offsetX, offsetY);

                TILES_CONTAINER.addChild(chunkSprite);
            });
        // });
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

    StrataWorld.prototype.mapHeightToColor = function(height, resolution) {
        var world = this;
        // var clean_height = 1 - (Math.floor(height * resolution) / resolution);
        var clean_height = Math.floor(height * resolution) / resolution;

        var output = 0;
        var step = .20;

        var blue    = world.getBlue(clean_height);
        var green   = world.getGreen(clean_height) * Math.pow(16, 2); //world.getScaledColor(clean_height, 1) * Math.pow(16, 2);
        var red     = world.getRed(clean_height) * Math.pow(16, 4);

        output =  red + green + blue;

        return output;

        // if (clean_height <= step) {
        //     var ratio = clean_height / step;
        //     var blue = (1 - Math.floor(ratio * 255));
        //     output = blue;

        // } else if (clean_height > step && clean_height <= (step * 2)) {
        //     var ratio = (clean_height - step) / step;
        //     var green = Math.floor(ratio * 255) * (Math.pow(16, 2));
        //     var blue = Math.floor(ratio * 255);
        //     output =  green + blue;

        // } else if (clean_height > (step * 2) && clean_height <= (step * 3)) {
        //     var ratio = (clean_height - (step * 2)) / step;
        //     var green = Math.floor(ratio * 255) * (Math.pow(16, 2));
        //     output = green;

        // } else if (clean_height > (step * 3) && clean_height <= (step * 4)) {
        //     var ratio = (clean_height - (step * 3)) / step;
        //     var red = Math.floor(ratio * 255) * (Math.pow(16, 4));
        //     var green = Math.floor(ratio * 255) * (Math.pow(16, 2));
        //     output = red + green;

        // } else {
        //     var ratio = (clean_height - (step * 4)) / step;
        //     var red = Math.floor(ratio * 255) * (Math.pow(16, 4));
        //     output = red;
        // }

        // return output;

    }

    StrataWorld.prototype.getBlue = function(val) {
        var time = Math.min(val, .3) / .3;
        var bezierValue = Utils.cubicBezier(
            new Vector2(0, 1),
            new Vector2(.58, 1),
            new Vector2(.42, 0),
            new Vector2(1, 0), 
            time).y;
        return Math.floor(bezierValue * 255);
    }

    StrataWorld.prototype.getRed = function(val) {
        var time = (Math.max(val, .7) - .7) / .3;
        var bezierValue = Utils.cubicBezier(
            new Vector2(0, 0),
            new Vector2(.42, 0),
            new Vector2(.58, 1),
            new Vector2(1, 1), 
            time).y;
        return Math.floor(bezierValue * 255);
    }

    StrataWorld.prototype.getGreen = function(val) {

        var bezierValue = Utils.cubicBezier(
            new Vector2(0, 0),
            new Vector2(.3, 1),
            new Vector2(.7, 1),
            new Vector2(1, 0), 
            val).y;
        return Math.floor(bezierValue * 255);
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