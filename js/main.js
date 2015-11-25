var RENDERER;
var STAGE;

var game;

var current_id = 0;

requirejs(["js/lib/pixi/bin/pixi.js"], function(pixi) {
    RENDERER = new PIXI.autoDetectRenderer(800, 600, { antialias: true });

    // The renderer will create a canvas element for you that you can then insert into the DOM.
    document.getElementById("main").appendChild(RENDERER.view);

    // You need to create a root container that will hold the scene you want to draw.
    STAGE = new PIXI.Container();

    requirejs(["js/strata_game.js"], 
        function(StrataGame) {

        game = new StrataGame();
        
        function mainLoop() {
            requestAnimationFrame(mainLoop);
            
            game.draw();
            game.update(PIXI.ticker.shared.deltaTime);

            RENDERER.render(STAGE);
        }

        mainLoop();
    });
});