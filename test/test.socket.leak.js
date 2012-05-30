/*
 *
 * One responseder two requesters
 *
 */

var value =  new Buffer(0.3 * 1024 * 1024);
var cluster = require('cluster')
, zmq = require('../')
, should = require('should')
, port = 'tcp://127.0.0.1:12344'
, os = require('os')
, util = require('util');

var nbWorker = 4;//os.cpus().length;
var nbTests = 12;
var workers = [];

if (cluster.isMaster) {
    var socket = zmq.socket('rep');

    socket.identity = 'server' + process.pid;

    socket.bind(port, function(err) {
	if (err) throw err;
	var msg = 0;
	socket.on('message', function(data) {
	    msg++;
	    socket.send(data);
	    if (msg == nbTests -1) {
		workers.forEach(function (worker, index) {
		    worker.send('memory');
		});
	    }

	});
    });


    var w = 0;

    for (var i = 0; i < nbWorker; i++) {
	(function (worker) {
	    workers.push(worker);
	    worker.on('message', function(msg) {
		if (msg.cmd && msg.cmd === 'end' ){
		    // msg.endRss.should.not.be.above(msg.startRss * 2.5)
		    console.log(msg);
		    //		    msg.endRss.should.not.be.above(msg.startRss * 2.5)
		    w++;
//		    worker.kill();
//		    if (w == nbWorker)
//			process.exit();
		}
 	    })
	})(cluster.fork());
    }

  //responseder = server

} else {
  //requester = client

    var socket = zmq.socket('req');

    socket.identity = 'client' + process.pid;

    socket.connect(port);

    var msg = 0;
    // when worker will have flags from master : http://blog.nodejs.org/2012/03/30/version-0-7-7-unstable/ https://github.com/joyent/node/blob/master/lib/cluster.js
    //    gc();
    var startRss = process.memoryUsage().rss;

    var inter = setInterval( function() {
	msg++;
	socket.send(value);
    }, 100);

    process.on('message', function () {
	clearInterval(inter);
	setInterval( function() {
	    process.send({msg: msg,
			  endRss: process.memoryUsage().rss,
			  startRss: startRss,
			  cmd: 'end'
			 });
	}, 1000);
    });
}