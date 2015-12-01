// define(['js/strata_object.js'], function(StrataObject) {
define(function() {
    "use strict";
    
    function Tile(hindex, vindex) {
        this.position = new Vector2(hindex * TILE_SIZE, vindex * TILE_SIZE);
        this.index = new Vector2(hindex, vindex);
        
        var ran = Math.random() * 10;
        this.weight = ran > .3 ? 1 : 0;
        
        this.graphics = new PIXI.Graphics();

        this.occupants = new Set();
        
        this.initSprite();
    };

    Tile.prototype.initSprite = function() {
        if (this.weight == 1){
            this.sprite = new PIXI.Sprite.fromImage("resources/grass.jpg");
        } else {
            this.sprite = new PIXI.Sprite.fromImage("resources/mountain.png");
        }
        this.sprite.height = TILE_SIZE; 
        this.sprite.width = TILE_SIZE;
        
        this.sprite.position.x = this.position.x;
        this.sprite.position.y = this.position.y;
        
        TILES_CONTAINER.addChild(this.sprite);
    };

    Tile.prototype.enter = function(entity) {
        this.occupants.add(entity);
    };

    Tile.prototype.exit = function(entity) {
        this.occupants.delete(entity);
    };

    Tile.prototype.getOccupantsWithTag = function(tag) {
        output = [];
        this.occupants.forEach(function(entity) {
            if (entity.tags.has(tag))
                output.push(entity);
        });


        return output;
    }
    
    Tile.prototype.highlight = function() {
        this.graphics.lineStyle(1, 0xFF0000, 1);
        
        this.graphics.drawRect(this.position.x , this.position.y, TILE_SIZE, TILE_SIZE);

        TILES_CONTAINER.addChild(this.graphics);
    };

    Tile.prototype.distanceTo = function(other) {
        var dx = this.index.x - other.index.x; 
        var dy = this.index.y - other.index.y;
        return Math.sqrt(dx * dx + dy * dy);
    };

    return Tile;
});