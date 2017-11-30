require('dotenv').config()

const express = require('express');
const app = express();
const server = require('http').Server(app);
const path = require('path');

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('port', (process.env.PORT || 5000));

// set up Mongoose connection
const mongoose = require('mongoose');
var mongoDB = process.env.MONGODB_URI;
mongoose.Promise = global.Promise
mongoose.connect(mongoDB);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var LocationSchema = new mongoose.Schema({
  date: Date,
  latitude: Number,
  longitude: Number
});

var Location = mongoose.model('Location', LocationSchema);

var NamedLocationSchema = new mongoose.Schema({
  name: String,
  date: Date,
  latitude: Number,
  longitude: Number
});

var NamedLocation = mongoose.model('NamedLocation', NamedLocationSchema);

var googleMapsClient = require('@google/maps').createClient({
  key: process.env.GOOGLE_MAPS_API
});

app.get("/getplan", (req, res) => {
  NamedLocation.find().sort({date: 1}).exec(function(err, data) {
    res.json(data);
  });
});

app.get("/getpath", (req, res) => {
  Location.find({}).sort({date: 1}).exec(function(err, data) {
    res.json(data);
  });
});

app.get("/addcity", (req, res) => {
  res.sendFile(path.join(__dirname, 'private/index.html'));
});

app.post("/addcity", (req, res) => {
  var myData;
  // Geocode an address.
  googleMapsClient.geocode({
    address: req.body.name
  }, function(err, response) {
    if (!err) {
      myData = new NamedLocation({
        name: req.body.name,
        date: new Date(req.body.date),
        latitude: response.json.results[0].geometry.location.lat,
        longitude: response.json.results[0].geometry.location.lng
      });
      myData.save()
        .then(item => {
          res.send("Ville ajoutée");
        })
        .catch(err => {
          res.status(400).send("Impossible de sauvegarder dans la BDD");
        });
      res.sendFile(path.join(__dirname, 'private/index.html'));
    }
  });
});

app.post("/addlocation", (req, res) => {
  var myData;
  console.log(req.body);
  // for (let i = 0; i < req.body.length; i++) {
    myData = new Location({
      date: req.body.timestamp,
      latitude: req.body.latitude,
      longitude: req.body.longitude
    });
    myData.save()
      .then(item => {
        res.send("Point ajouté");
      })
      .catch(err => {
        res.status(400).send("Impossible de sauvegarder dans la BDD");
      });
  // }
});

app.use("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

server.listen(app.get('port'), () => {
  console.log('Node app is running on port', app.get('port'));
})
