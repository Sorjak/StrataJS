var RENDERER;
var STAGE;

var bunny;

requirejs(["js/lib/pixi/bin/pixi.js"], function(pixi) {
    RENDERER = new PIXI.autoDetectRenderer(800, 600, { antialias: true });

    // The renderer will create a canvas element for you that you can then insert into the DOM.
    document.body.appendChild(RENDERER.view);

    // You need to create a root container that will hold the scene you want to draw.
    STAGE = new PIXI.Container();

    requirejs(["js/bunny.js"], function(Bunny) {

        bunny = new Bunny( new PIXI.Point(50, 100) );

        function mainLoop() {
            requestAnimationFrame(mainLoop);
            
            draw();
            update();

            RENDERER.render(STAGE);
        }

        function update() {
            bunny.update();
        }

        function draw() {
            bunny.draw();
        }

        function handleInput() {
            console.log("handling input");
        }

        mainLoop();
    });
});