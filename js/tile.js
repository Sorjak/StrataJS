// define(['js/strata_object.js'], function(StrataObject) {
define(function() {
    "use strict";
    
    function Tile(hindex, vindex) {
        this.position = new Vector2(hindex * TILE_SIZE, vindex * TILE_SIZE);
        this.index = new Vector2(hindex, vindex);
        
        var ran = Math.random() * 10;
        this.weight = ran > .3 ? 1 : 0;
        
        this.graphics = new PIXI.Graphics();
        
        this.initSprite();
    };

    Tile.prototype.initSprite = function() {
        this.sprite = new PIXI.Sprite.fromImage("resources/grass.jpg");
        this.sprite.height = TILE_SIZE; 
        this.sprite.width = TILE_SIZE;
        
        this.sprite.position.x = this.position.x;
        this.sprite.position.y = this.position.y;
        
        if (this.weight === 0)
            this.sprite.visible = false;
        
        TILES_CONTAINER.addChild(this.sprite);
    };
    
    Tile.prototype.highlight = function() {
        this.graphics.lineStyle(1, 0xFF0000, 1);
        
        this.graphics.drawRect(this.position.x , this.position.y, TILE_SIZE, TILE_SIZE);

        TILES_CONTAINER.addChild(this.graphics);
    };

    return Tile;
});