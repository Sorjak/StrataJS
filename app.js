var fs = require('fs');
var path = require('path');
var express = require('express');
var app = express();

var server = require('http').Server(app);

// check for socket file and delete if exists


var walk    = require('walk');
var images  = require('images');
var terrain_images = {};
var fauna_images = {};

// Walker options
var terrain_walker  = walk.walk('./resources/terrain', { followLinks: false });

var fauna_walker = walk.walk('./resources/fauna', { followLinks: false });


function getMaxWidth(sub_object) {
    var max_width = 0;
    Object.keys(sub_object).forEach(function(key) {
        var sub_array = sub_object[key];
        if (sub_array.length > max_width)
            max_width = sub_array.length;
    });

    return max_width;
}

function createSpriteRow(sheet, values, row_idx) {
    values.forEach(function(frame, index) {
        var img = images(frame);
        sheet.draw(img, index * 16, row_idx * 16);
    });
}

terrain_walker.on('file', function(root, stat, next) {
    // Add this file to the list of files
    var realname = root + '/' + stat.name;
    var basename = path.basename(root);
    var keywords = basename.split("_");

    var main_key = keywords[1] + "_" + keywords[2];
    var sub_key = keywords[3];
    for (var i = 4; i < keywords.length; i++) {
        sub_key += "_" + keywords[i];
    }

    if (terrain_images[main_key] !== undefined){
        var main = terrain_images[main_key];
        if (main[sub_key] !== undefined)
            main[sub_key].push(realname);
        else {
            main[sub_key] = [realname];
        }
    } else {
        terrain_images[main_key] = {};
        terrain_images[main_key][sub_key] = [realname];
    }
    next();
});

terrain_walker.on('end', function() {
    Object.keys(terrain_images).forEach(function(key) {
        var filename = 'resources/generated/' + key + '.png';
        var val = terrain_images[key];

        var spritesheet = images(getMaxWidth(val) * 16, 4 * 16);
        createSpriteRow(spritesheet, val['center'], 0);
        createSpriteRow(spritesheet, val['side'], 1);
        createSpriteRow(spritesheet, val['corner_inner'], 2);
        createSpriteRow(spritesheet, val['corner_outer'], 3);

        spritesheet.save(filename, {'quality': 90});
    });
});


fauna_walker.on('file', function(root, stat, next) {
    var realname = root + '/' + stat.name;
    var basename = path.basename(root);
    var keywords = stat.name.split("_");

    var entity_name = keywords[1];

    var animation_name = keywords[2];
    for (var i = 3; i < keywords.length - 1; i++) {
        animation_name += "_" + keywords[i];
    }

    var animation_index = parseInt(keywords[keywords.length - 1].substring(0, 2), 10);
    if (fauna_images[entity_name] !== undefined) {
        var entity = fauna_images[entity_name];
        if (entity[animation_name] !== undefined) {
            entity[animation_name][animation_index] = realname;
        } else {
            entity[animation_name] = [];
            entity[animation_name][animation_index] = realname;
        }

    } else {
        fauna_images[entity_name] = {};
        fauna_images[entity_name][animation_name] = [];
        fauna_images[entity_name][animation_name][animation_index] = realname;
    }

    next();

});

fauna_walker.on('end', function() {
    console.log(fauna_images);

    Object.keys(fauna_images).forEach(function(entity_name) {
        var filename = 'resources/generated/' + entity_name + '.png';
        var entity = fauna_images[entity_name];
        var animations = Object.keys(entity);

        var widest = 0;
        animations.forEach(function(animation_name, index) {
            var width = entity[animation_name].length;
            if (width > widest) {
                widest = width;
            }
        });

        var spritesheet = images(widest * 16, animations.length * 16);

        animations.forEach(function(animation_name, index) {
            createSpriteRow(spritesheet, entity[animation_name], index);
        });

        spritesheet.save(filename, {'quality': 90});
    });
});

server.listen(8000);

app.use('/js', express.static(__dirname + '/js/'));
app.use('/css', express.static(__dirname + '/css/'));
app.use('/resources', express.static(__dirname + '/resources/'));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});