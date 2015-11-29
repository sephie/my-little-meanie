var cool = require('cool-ascii-faces');
var express = require('express');
var mongoose = require('mongoose'); // The reason for this demo.
var bodyParser = require('body-parser');

var dbUriString;

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

// Static page
// -----------
app = express();
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

app.get('/', function(request, response) {
  response.sendfile(__dirname + '/public/index.html');
});

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
      HeatPoint.find().lean().exec(function(err, docs) {
        if (err) return console.error(err);
        res.json(transformToHeatData(docs));
      });
    })
    .post(function(req, res) {
      console.log('Express: /heat POST: ', req.body);

      dbSaveThing(req).then(function() {
        res.json(req.body)
      });
    })
    .delete(function(req, res) {
      console.log('Express: /heat DELETE');
      HeatPoint.remove({}, function(err) {
        if (err) console.log(err);
        res.send('Deleted all the things');
      });
    });

function transformToHeatData(docs) {
  docs.forEach(function(el, index) {
    docs[index] = [el.x, el.y, el.opacity];
  });

  return docs;
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
    console.log('Saved a thing!');
  });
}
