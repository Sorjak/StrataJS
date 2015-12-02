var RENDERER;
var STAGE;
var TILES_CONTAINER;
var ENTITY_CONTAINER;

var game;

var current_id = 0;
var TILE_SIZE = 24;

var fpsCounter = document.getElementById("fps");

requirejs(["js/lib/pixi/bin/pixi.js"], function(pixi) {
    RENDERER = new PIXI.autoDetectRenderer(800, 600, { antialias: true });

    // The renderer will create a canvas element for you that you can then insert into the DOM.
    document.getElementById("main").appendChild(RENDERER.view);

    // You need to create a root container that will hold the scene you want to draw.
    STAGE = new PIXI.Container();
    TILES_CONTAINER = new PIXI.Container();
    ENTITY_CONTAINER = new PIXI.Container();
    
    // STAGE.addChild(TILES_CONTAINER);
    
    
    requirejs(["js/strata_game.js"], function(StrataGame) {

        function mainLoop() {
            requestAnimationFrame(mainLoop);
            if (game.running) {
            
                game.draw();
                game.update(PIXI.ticker.shared.deltaTime);

                RENDERER.render(STAGE);
            }
            
            fpsCounter.textContent = "FPS: " + Math.floor(PIXI.ticker.shared.FPS);
        }

        // Load static assets and create a render texture

        var loader = PIXI.loader; 
        loader.add('grass',"resources/grass.jpg");
        loader.add('mountain',"resources/mountain.png");

        loader.once('complete', function() {
            game = new StrataGame();

            var tex = TILES_CONTAINER.generateTexture(RENDERER);
            var background = new PIXI.Sprite(tex);
            STAGE.addChild(background);
            STAGE.addChild(ENTITY_CONTAINER);
            
            mainLoop();
        });

        loader.load();


    });
});