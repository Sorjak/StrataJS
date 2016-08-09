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

        this.colors = {
            "water"      : 0x3C5C91,
            "beach"      : 0xC2B280,
            "lowGrass"   : 0x688358,
            "highGrass"  : 0x68CC58,
            "mountain"  : 0x895B48,
            "snow"       : 0xFFFFFF
        }

        this.max_workers = navigator.hardwareConcurrency || 4;
        this.worker_index = 0;
        this.total_workers = 0;
        console.log("Max workers: " + this.max_workers);

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

        return world.generateChunks().then(function(results) {
            LOAD_TEXT.removeChildren();
            var drawPromises = [];

            results.forEach(function(data) {
                world.chunks[data.chunk.chunk_id] = data.tiles;

                var drawing_text = new PIXI.Text("Drawing Sprites...", 
                    {font:"24px Arial", fill:0xFFFFFF});
                drawing_text.x = 10;
                drawing_text.y = 30;
                LOAD_TEXT.addChild(drawing_text);
                RENDERER.render(STAGE);

                var prom = world.drawChunk(data.chunk, data.tiles);
                drawPromises.push(prom);
            });

            return Promise.all(drawPromises);
        });
    };

    StrataWorld.prototype.generateChunks = function() {
        var world = this;
        var chunksPromises = [];
        
        for (var x = 0; x < world.width; x++) {
            for (var y = 0; y < world.height; y++) {
                var prom = world.createDBChunk(x, y, world.chunk_size, world.chunk_size)

                chunksPromises.push(prom);
                world.total_workers++;
            }
        }

        return Promise.all(chunksPromises).then(function(chunks) {
            var workerPromises = [];
            
            for (var i = 0; i < chunks.length; i++) {
                var prom = world.startChunkWorker(i, chunks[i]);
                workerPromises.push(prom);
            }

            return Promise.all(workerPromises);

        });
    }

    StrataWorld.prototype.createDBChunk = function(x, y, width, height) {
        var c = new Chunk(x, y, width, height);
        var world = this;

        return DATABASE.chunks.add(c).then(function(dbchunk) {
            var chunk = dbchunk[0];

            return chunk;
        });
    }

    StrataWorld.prototype.startChunkWorker = function(index, chunk) {
        var world = this;

        var chunk_text = new PIXI.Text("Chunk " + chunk.chunk_id + " Loading", 
            {font:"12px Arial", fill:0xFFFFFF});
        chunk_text.x = 10;
        chunk_text.y = 15 * chunk.chunk_id;
        LOAD_TEXT.addChild(chunk_text);
        RENDERER.render(STAGE);

        return new Promise(function(resolve, reject) {
            worker = new Worker("js/generate_chunk_async.js");

            worker.onmessage = function(e) {
                if (e.data.type == "finished") {
                    chunk_text.text = "Chunk " + chunk.chunk_id + " Finished";
                    chunk_text.tint = 0x00FF00;
                    RENDERER.render(STAGE);

                    resolve({'index': index, 'chunk' : chunk, 'tiles' : e.data.output });

                } else if (e.data.type == "progress") {
                    chunk_text.text = "Chunk " + chunk.chunk_id + " " + e.data.info;
                    RENDERER.render(STAGE);
                }
                
            } // end onmessage

            worker.onerror = function(e) {
                console.error(e);
            }

            worker.postMessage({
                'type' : 'init',
                'chunk' : chunk,
                'tile_size': world.tile_size,
                'seeds' : world.seeds
            });
        }); // end worker promise
    }

    StrataWorld.prototype.drawChunk = function(chunk, tiles) {
        var world = this;

        // return Chunk.getTilesAs2DArray(chunk.chunk_id)
        // .then(function (tiles) {
        var chunkContainer = new PIXI.Container();
        var promiseList = [];

        for (var i = 0; i < chunk.width; i++) {
            for (var j = 0; j < chunk.height; j++) {

                var tile = tiles[i][j];

                // console.log(tile);

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

                    // var color = world.mapHeightToColor(tile.height, 100);

                    var color = world.colors[tile.terrain_type];

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

            var neighbors = Utils.getNeighborsForTile(tiles, tile, false);
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
        var clean_height = Math.floor(height * resolution) / resolution;

        var output = 0;
        var step = .20;

        var blue    = world.getBlue(clean_height);
        var green   = world.getGreen(clean_height) * Math.pow(16, 2);
        var red     = world.getRed(clean_height) * Math.pow(16, 4);

        output =  red + green + blue;

        return output;

    }

    StrataWorld.prototype.getBlue = function(val) {
        if (val < 0) return 255;

        var time = Math.min(val, .5) / .5;
        var bezierValue = Utils.cubicBezier(
            new Vector2(0, 1),
            new Vector2(.58, 1),
            new Vector2(.42, 0),
            new Vector2(1, 0), 
            time).y;
        return Math.floor(bezierValue * 255);
    }

    StrataWorld.prototype.getRed = function(val) {
        if (val < 0) return 0;

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
        if (val < 0) return 0;

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