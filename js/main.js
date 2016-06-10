var RENDERER;
var STAGE;
var TILES_CONTAINER;
var FIRST_LAYER;
var SECOND_LAYER;
var THIRD_LAYER;

var game;
var camera;

var current_id = 0;
var TILE_SIZE = 16;

var fpsCounter = document.getElementById("fps");

requirejs(["js/lib/pixi/bin/pixi.js"], function(pixi) {
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
    
    
    requirejs(["js/strata_game.js", "js/camera.js"], function(StrataGame, Camera) {
        

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

        var text = new PIXI.Text("Loading...", {font:"24px Arial", fill:0xFFFFFF});
        text.x = 400;
        text.y = 300;
        STAGE.addChild(text);
        RENDERER.render(STAGE);

        // Load static assets and create a render texture

        var loader = PIXI.loader; 
        loader.add('white_square', "resources/generated/white_square.png");
        loader.add('white_rough', "resources/generated/white_rough.png");

        loader.once('complete', function() {
            STAGE.removeChild(text);
            game = new StrataGame();


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

        loader.load();


    });
});