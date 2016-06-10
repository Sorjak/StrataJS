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

    Utils.cubicBezier = function(p0, p1, p2, p3, t) {
        var u = (1 - t);
        var tt = t*t;
        var uu = u*u;
        var uuu = uu * u;
        var ttt = tt * t;

        var p = p0.multiplyScalar(uuu).clone();
        p.add( p1.multiplyScalar(3 * uu * t) ); //second term
        p.add( p2.multiplyScalar(3 * u * tt) ); //third term
        p.add( p3.multiplyScalar(ttt) ); //fourth term

        return p;
    };


    return Utils;

});