var RENDERER;
var STAGE;
var TILES_CONTAINER;
var FIRST_LAYER;
var SECOND_LAYER;
var THIRD_LAYER;

var DATABASE;

var LOAD_TEXT;

var game;

var camera;

var current_id = 0;
var TILE_SIZE = 16;

var fpsCounter = document.getElementById("fps");

requirejs(["js/lib/pixi/bin/pixi.js", "js/lib/db.min.js"], function(pixi, dbjs) {
    RENDERER = new PIXI.autoDetectRenderer(800, 600, { antialias: true });

    // The renderer will create a canvas element for you that you can then insert into the DOM.
    document.getElementById("main").appendChild(RENDERER.view);

    // You need to create a root container that will hold the scene you want to draw.
    STAGE = new PIXI.Container();
    TILES_CONTAINER = new PIXI.Container();
    FIRST_LAYER = new PIXI.Container();
    SECOND_LAYER = new PIXI.Container();
    THIRD_LAYER = new PIXI.Container();
    
    // STAGE.addChild(TILES_CONTAINER);

    dbjs.delete("strata-db").then(function (ev) {

    }, function (err) {
        // Error during database deletion
    });

    dbjs.open( {
        server: 'strata-db',
        version: 1,
        schema: {
            tiles: {
                key : { keyPath: 'tile_id', autoIncrement: true},
            },
            chunks: {
                key : { keyPath: 'chunk_id', autoIncrement: true},
            }
        }
    }).then(function(s) {
        console.log("opened database");
        DATABASE = s;
    
        requirejs(["js/strata_game.js", "js/camera.js", "js/terrain/chunk.js"], 
            function(StrataGame, Camera, Chunk) {
            

            function mainLoop() {
                requestAnimationFrame(mainLoop);

                if (game.running) {
                    game.draw();
                    game.update(PIXI.ticker.shared.deltaTime);
                }
                
                camera.update();
                RENDERER.render(STAGE);
                
                fpsCounter.textContent = "FPS: " + Math.floor(PIXI.ticker.shared.FPS);
            }

            LOAD_TEXT = new PIXI.Text("Generating Terrain...", {font:"24px Arial", fill:0xFFFFFF});
            LOAD_TEXT.x = 350;
            LOAD_TEXT.y = 300;
            STAGE.addChild(LOAD_TEXT);
            RENDERER.render(STAGE);

            // Load static assets and create a render texture

            var loader = PIXI.loader; 
            loader.add('white_square', "resources/generated/white_square.png");
            loader.add('white_rough', "resources/generated/white_rough.png");

            loader.once('complete', function() {
                
                game = new StrataGame();

                game.start().then(function() {
                    STAGE.removeChild(LOAD_TEXT);
                    var tex = TILES_CONTAINER.generateTexture(RENDERER);
                    var background = new PIXI.Sprite(tex);

                    STAGE.addChild(background);
                    STAGE.addChild(FIRST_LAYER);
                    STAGE.addChild(SECOND_LAYER);
                    STAGE.addChild(THIRD_LAYER);
                    STAGE.addChild(game.graphics);

                    camera = new Camera(STAGE);
                    
                    mainLoop();
                });


            });

            loader.load();


        });
    });
});