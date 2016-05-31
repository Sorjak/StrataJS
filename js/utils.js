define( function() {
    "use strict";

    var spriteWidth = 64;
    var spriteHeight = 32;

    function Utils() {


    }
    /*
        Loads a spritesheet with a single row into a PIXI movieclip with an array of textures.
    */

    Utils.loadSpritesheet = function( path) {
        var texture = PIXI.Texture.fromImage(path);
        var textureArray = [];

        var numFrames = texture.width / spriteWidth;

        for (var i = 0; i < numFrames; i++) {
            var cropRect = new PIXI.Rectangle(i * spriteWidth, 0, spriteWidth, spriteHeight);
            var cropped = texture.clone();
            cropped.frame = cropRect;
            cropped.crop = cropRect;
            textureArray.push(cropped);

        }


        return textureArray;
    }


    return Utils;

});