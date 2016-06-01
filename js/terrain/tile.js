// define(['js/strata_object.js'], function(StrataObject) {
define(function() {
    "use strict";
    
    function Tile(hindex, vindex, height, container) {
        this.position = new Vector2(hindex * TILE_SIZE, vindex * TILE_SIZE);
        this.index = new Vector2(hindex, vindex);
        this.container = container;
        
        this.height = height;
        this.weight = Math.floor((this.height * 100) / 25);        
        this.occupants = new Set();

        this.initSprite();

        this.graphics = new PIXI.Graphics();

        // var backgroundColor = 0xFFFFFF;
        // if (this.height <= .1) {
        var backgroundColor = 0x3C5C91;
        // } else {
        //     backgroundColor = 0x688358;
        // }

        this.graphics.beginFill(backgroundColor);
        this.graphics.drawRect(0, 0, TILE_SIZE, TILE_SIZE);

        this.sprite.addChild(this.graphics);
    };

    Tile.prototype.initSprite = function() {
        this.sprite = new PIXI.Container();
        this.sprite.height = TILE_SIZE; 
        this.sprite.width = TILE_SIZE;
        
        this.sprite.position.x = this.position.x;
        this.sprite.position.y = this.position.y;
        
        this.container.addChild(this.sprite);
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

    Tile.prototype.hasOccupantWithTag = function(tag) {
        var output = false;
        this.occupants.forEach(function(entity) {
            if (entity.tags.has(tag))
                output = true;
        });


        return output;
    }

    Tile.prototype.hasOccupantOfType = function(type) {
        var output = false;
        this.occupants.forEach(function(entity) {
            if (entity.constructor.name == type)
                output = true;
        });


        return output;
    }


    
    Tile.prototype.highlight = function() {
        this.graphics.lineStyle(1, 0xFF0000, 1);
        
        this.graphics.drawRect(this.position.x , this.position.y, TILE_SIZE, TILE_SIZE);
    };

    Tile.prototype.distanceTo = function(other) {
        var dx = this.index.x - other.index.x; 
        var dy = this.index.y - other.index.y;
        return Math.sqrt(dx * dx + dy * dy);
    };

    Tile.prototype.screenDistanceTo = function(other) {
        var dx = this.position.x - other.position.x; 
        var dy = this.position.y - other.position.y;
        return Math.sqrt(dx * dx + dy * dy);
    };

    Tile.prototype.screenDistanceToVector = function(v) {
        var dx = this.position.x - v.x; 
        var dy = this.position.y - v.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    return Tile;
});