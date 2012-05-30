var cluster = require('cluster')
, zmq = require('./')
, should = require('should')
, port = 'tcp://127.0.0.1:12344'
, os = require('os')
, util = require('util');


var nbWorker = 4;//os.cpus().length;
var nbTests = 10;
var workers = [];

var socket = zmq.socket('rep');

socket.identity = 'server' + process.pid;

socket.bind(port, function(err) {
    if (err) throw err;
    var msg = 0;
    socket.on('message', function(data) {
	msg++;
	console.log('msg received');
	socket.send(data);
	if (msg == nbTests -1) {

	}
    });
});



