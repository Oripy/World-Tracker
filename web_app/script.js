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
mongoose.connect(mongoDB, {
  useMongoClient: true
});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var LocationSchema = new mongoose.Schema({
  location: String,
  date: Date,
  latitude: Number,
  longitude: Number,
  altitude: Number,
  accuracy: Number,
  altitudeAccuracy: Number,
  heading: Number,
  speed: Number
});

var Location = mongoose.model('Location', LocationSchema);

var NamedLocationSchema = new mongoose.Schema({
  name: String,
  date: Date,
  latitude: Number,
  longitude: Number,
  altitude: Number,
  accuracy: Number,
  altitudeAccuracy: Number,
  heading: Number,
  speed: Number
});

var NamedLocation = mongoose.model('NamedLocation', NamedLocationSchema);

app.get("/addcity", (req, res) => {
  res.sendFile(path.join(__dirname, 'private/index.html'));
});

app.post("/addcity", (req, res) => {
  var myData;
  if (req.body.name) {
    myData = new Location(req.body);
  } else {
    myData = new NamedLocation(req.body);
  }
  myData.save()
    .then(item => {
      res.send("Ville ajoutée");
    })
    .catch(err => {
      res.status(400).send("Impossible de sauvegarder dans la BDD");
    });
});

app.use("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

server.listen(app.get('port'), () => {
  console.log('Node app is running on port', app.get('port'));
})
