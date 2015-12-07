var cool = require('cool-ascii-faces');
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

var dbUriString = process.env.MONGOLAB_URI || 'mongodb://localhost:27017';

var app;
var server;
var io;

// APP STARTUP
// -----------
app = express();
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
server = require('http').Server(app);
io = require('socket.io')(server);

server.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

// no fancy templates, just a static page
app.get('/', function(request, response) {
  response.sendfile(__dirname + '/public/index.html');
});


// MONGO CONNECTION + MONGOOSE SCHEMA
// ----------------------------------

// Makes connection asynchronously.  Mongoose will queue up database
// operations and release them when the connection is complete.
mongoose.connect(dbUriString, function(err, res) {
  if (err) {
    console.log('ERROR connecting to: ' + dbUriString + '. ' + err);
  } else {
    console.log('Succeeded connected to: ' + dbUriString);
  }
});

var heatPointSchema = new mongoose.Schema({
  x: Number,
  y: Number,
  opacity: Number
});
var HeatPoint = mongoose.model('HeatPoint', heatPointSchema);


// SOCKET.IO
// ---------
io.on('connection', function(socket) {

  dbGetHeatData().then(function(data) {
    //send complete heat set to newly opened socket
    socket.emit('totalHeat', data);
  });

  socket.on('clientHeat', function(data) {
    dbSaveThing(data).then(function() {
      io.emit('serverHeat', data);
    });
  });
});


// REST API/ROUTER
// ---------------
app.get('/cool', function(request, response) {
  // where the MEAN adventure began..
  var result = '';
  var times = process.env.TIMES || 1;
  for (var i = 0; i < times; i++)
    result += cool() + ' ';
  response.send(result);
});

app.route('/heat')
  // can use this to get the raw heat JSON.
    .get(function(req, res) {
      dbGetHeatData().then(function(data) {
        res.json(data);
      })
    })

    .delete(function(req, res) {
      // use with care :"|
      console.log('Express: /heat DELETE');
      dbDeleteHeat().then(function() {
        res.send('Deleted all the things');
      });
    });


// DB operations
// -------------
function dbGetHeatData() {
  return HeatPoint.find().exec(function(err, docs) {
    if (err) console.log(err);

    docs.forEach(function(el, index) {
      docs[index] = [el.x, el.y, el.opacity];
    });
  });
}

function dbSaveThing(point) {
  var newThing = new HeatPoint(
      {
        x: point[0],
        y: point[1],
        opacity: point[2]
      }
  );
  return newThing.save(function(err, thing) {
    if (err) console.log(err);
  });
}

function dbDeleteHeat() {
  return HeatPoint.remove({}, function(err) {
    if (err) console.log(err);
  });
}
