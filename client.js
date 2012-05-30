var value =  new Buffer(0.3 * 1024 * 1024);
var cluster = require('cluster')
, zmq = require('./')
, should = require('should')
, port = 'tcp://127.0.0.1:12344'
, os = require('os')
, util = require('util');

var nbWorker = 4;//os.cpus().length;
var nbTests = 10;
var workers = [];

var socket = zmq.socket('req');

socket.identity = 'client' + process.pid;

socket.connect(port);

var msg = 0;
// when worker will have flags from master : http://blog.nodejs.org/2012/03/30/version-0-7-7-unstable/ https://github.com/joyent/node/blob/master/lib/cluster.js
//    gc();
function start () {
    var startRss = process.memoryUsage().rss;

    for (i = 0; i < nbTests; ++i) {
	msg++;
	socket.send(value);
    }

    console.log({msg: msg,
		 endRss: process.memoryUsage().rss,
		 startRss: startRss,
		 cmd: 'end'
		});
}

start();