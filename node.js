var fs = require('fs');
var express = require('express');
var app = express();

var server = require('http').Server(app);

// check for socket file and delete if exists

server.listen(8000);

app.use('/js', express.static(__dirname + '/js/'));
app.use('/css', express.static(__dirname + '/css/'));
app.use('/resources', express.static(__dirname + '/resources/'));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});