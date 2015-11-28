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
    
    STAGE.addChild(TILES_CONTAINER);
    STAGE.addChild(ENTITY_CONTAINER);
    

    requirejs(["js/strata_game.js"], function(StrataGame) {

        game = new StrataGame();
        // var mapTexture = new PIXI.RenderTexture(RENDERER);
        // console.log(TILES_CONTAINER);
        // mapTexture.render(TILES_CONTAINER);
        // var background = new PIXI.Sprite(mapTexture);
        // STAGE.addChild(background);

        
        function mainLoop() {
            requestAnimationFrame(mainLoop);
            if (game.running) {
            
                game.draw();
                game.update(PIXI.ticker.shared.deltaTime);

                RENDERER.render(STAGE);
            }
            
            fpsCounter.textContent = "FPS: " + Math.floor(PIXI.ticker.shared.FPS);
        }

        mainLoop();
    });
});