var cool = require('cool-ascii-faces');
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

var dbUriString;

var server;
var io;
var app = express();

// Static page
// -----------
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

server = require('http').Server(app);
io = require('socket.io')(server);

server.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

app.get('/', function(request, response) {
  response.sendfile(__dirname + '/public/index.html');
});

io.on('connection', function (socket) {
  //socket.emit('connected', { hello: 'world' });
  //socket.on('heatAdded', function (data) {
  //  console.log('heatAdded: ', data);
  //});
});


// DB
// --
dbUriString = process.env.MONGOLAB_URI || 'mongodb://localhost:27017';

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


// REST API
// --------
app.get('/cool', function(request, response) {
  var result = '';
  var times = process.env.TIMES || 1;
  for (var i = 0; i < times; i++)
    result += cool() + ' ';
  response.send(result);
});

app.route('/heat')

    .get(function(req, res) {
      dbGetHeatData().then(function(data) {
        res.json(data);
      })
    })

    .post(function(req, res) {
      console.log('Express: /heat POST: ', req.body);
      dbSaveThing(req).then(function() {
        io.emit('heatAdded', req.body);
        res.json(req.body)
      });
    })

    .delete(function(req, res) {
      console.log('Express: /heat DELETE');
      dbDeleteHeat().then(function() {
        res.send('Deleted all the things');
      });
    })
;

function dbGetHeatData() {
  return HeatPoint.find().exec(function(err, docs) {
    if (err) console.log(err);

    docs.forEach(function(el, index) {
      docs[index] = [el.x, el.y, el.opacity];
    });
  });
}

function dbSaveThing(data) {
  var newThing = new HeatPoint(
      {
        x: data.body[0],
        y: data.body[1],
        opacity: data.body[2]
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