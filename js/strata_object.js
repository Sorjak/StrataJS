define(['js/lib/vector2.js'], function(Vector2) {
    "use strict";

    function StrataObject(id, tile, path, scale, anchor) {
        this.id = id;
        this.tags = [];

        this.initSprite(new PIXI.Point(tile.position.x, tile.position.y), path, scale, anchor);

        
        this.rotation = this.sprite.rotation;
        
        this.currentTile = tile;
        this.movePath = null;
        this.moveIndex = 0;
        this.targetTile = null;

        this.speedMultiplier = 1;

        var myObj = this;

        this.sprite.on('mousedown', function() {
            myObj.onDown();
        });
        this.sprite.on('touchstart', function() {
            myObj.onDown();
        });
        
    };

    StrataObject.prototype.initSprite = function(pos, path, scale, anchor) {
        this.sprite = new PIXI.Sprite.fromImage(path);

        this.sprite.position = pos;

        this.sprite.scale = typeof scale !== 'undefined' ? scale : new PIXI.Point(.1, .1);
        this.sprite.anchor = typeof anchor !== 'undefined' ? anchor : new PIXI.Point(0, 0);

        this.sprite.interactive = true;

        ENTITY_CONTAINER.addChild(this.sprite);
    }

    StrataObject.prototype.draw = function() {

    }
    
    StrataObject.prototype.update = function(deltaTime) {
        
        if (this.targetTile != null && this.movePath == null) {
            this.movePath = game.astar.search(this.currentTile, this.targetTile);
            this.moveIndex = 0;
            this.moveFrame = 0;
            
        } else if (this.targetTile != null && this.movePath != null) {
            
            if (this.currentTile != this.targetTile) {
                
                if (this.moveFrame < this.speedMultiplier) {
                    this.moveFrame += deltaTime;
                    
                } else {
                    var nextTile = this.movePath[this.moveIndex];
                    // nextTile.highlight();
                    this.moveToTile(nextTile);
                }
            } else {
                this.movePath = null;
                this.targetTile = null;
            }
        }
        
        this.sprite.position.x = this.currentTile.position.x; 
        this.sprite.position.y = this.currentTile.position.y;
    }
    
    StrataObject.prototype.moveToTile = function(tile) {
        // potentially make this a tween.
        this.currentTile = tile;
        this.moveFrame = 0;
        this.moveIndex++;
    }

    StrataObject.prototype.onDown = function() {
        this._log("id: " + this.id 
            + " | index: (" + 
            Math.floor(this.currentTile.index.x) + "," + Math.floor(this.currentTile.index.y) 
            + ")"
        );
    }

    StrataObject.prototype._log = function(message) {
        var textarea = document.getElementById("console-text");
        textarea.textContent += message + "\n";
        textarea.scrollTop = textarea.scrollHeight;
    }


    return StrataObject;
});