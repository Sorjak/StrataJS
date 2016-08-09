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

    Utils.labToXYZ = function(L, a, b) {
        var var_Y = ( L + 16 ) / 116
        var var_X = a / 500 + var_Y
        var var_Z = var_Y - b / 200

        if ( var_Y^3 > 0.008856 ) var_Y = var_Y^3;
        else                      var_Y = ( var_Y - 16 / 116 ) / 7.787;

        if ( var_X^3 > 0.008856 ) var_X = var_X^3;
        else                      var_X = ( var_X - 16 / 116 ) / 7.787;

        if ( var_Z^3 > 0.008856 ) var_Z = var_Z^3;
        else                      var_Z = ( var_Z - 16 / 116 ) / 7.787;

        // var ref_X = 95.047;
        // var ref_Y = 100.000;
        // var ref_Z = 108.883;

        // var X = ref_X * var_X     //ref_X =  95.047     Observer= 2°, Illuminant= D65
        // var Y = ref_Y * var_Y     //ref_Y = 100.000
        // var Z = ref_Z * var_Z     //ref_Z = 108.883

        return {x : var_X, y : var_Y, z : var_Z}
    }

    Utils.XYZtoRGB = function(color) {
        var var_X = color.x / 100        //X from 0 to  95.047      (Observer = 2°, Illuminant = D65)
        var var_Y = color.y / 100        //Y from 0 to 100.000
        var var_Z = color.z / 100        //Z from 0 to 108.883

        var var_R = var_X *  3.2406 + var_Y * -1.5372 + var_Z * -0.4986
        var var_G = var_X * -0.9689 + var_Y *  1.8758 + var_Z *  0.0415
        var var_B = var_X *  0.0557 + var_Y * -0.2040 + var_Z *  1.0570

        if ( var_R > 0.0031308 ) var_R = 1.055 * ( var_R ^ ( 1 / 2.4 ) ) - 0.055
        else                     var_R = 12.92 * var_R
        if ( var_G > 0.0031308 ) var_G = 1.055 * ( var_G ^ ( 1 / 2.4 ) ) - 0.055
        else                     var_G = 12.92 * var_G
        if ( var_B > 0.0031308 ) var_B = 1.055 * ( var_B ^ ( 1 / 2.4 ) ) - 0.055
        else                     var_B = 12.92 * var_B

        var R = var_R * 255;
        var G = var_G * 255;
        var B = var_B * 255;

        return {r : R, g : G, b : B}
    }


    Utils.getNeighborsForTile = function(tiles, tile, diagonal) {
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


    return Utils;

});