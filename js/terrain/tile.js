// define(['js/strata_object.js'], function(StrataObject) {
define(function() {
    // "use strict";
    
    function Tile(chunk_id, x, y, size, height) {
        this.chunk_id = chunk_id;
        this.position = new Vector2(x * size, y * size);

        this.index = new Vector2(x, y);
        this.size = size;

        this.height = height;
        // this.weight = Math.floor((this.height * 100) / 25);
        this.neighbors = new Set();   
        this.occupants = new Set();
        this.tags = new Set();

        this.terrain_type = "water";
    };

    Tile.initSprite = function(x, y, width, height, defaultColor) {
        var sprite = new PIXI.Container();
        sprite.width = width;        
        sprite.height = height; 

        sprite.position.x = x;
        sprite.position.y = y; 
                          
        var graphics = new PIXI.Graphics();
        graphics.beginFill(defaultColor);
        graphics.drawRect(0, 0, width, height);

        sprite.addChild(graphics);

        return sprite;
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