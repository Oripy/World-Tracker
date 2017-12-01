var db;
var openRequest = window.indexedDB.open("LocationsHistory", 1);

const website = "https://mysterious-basin-24267.herokuapp.com/";

openRequest.onerror = function (error) {
  alert("Database error: " + openRequest.errorCode);
  console.log(openRequest.errorCode);
};
openRequest.onsuccess = function () {
  // Database is open and initialized - we're good to proceed.
  db = openRequest.result;
};
openRequest.onupgradeneeded = function () {
  db = openRequest.result;
  var objectStore = db.createObjectStore("locations", { keyPath: "timestamp" });
  var index = objectStore.createIndex("timestamp", ["timestamp"]);
  // objectStore.transaction.oncomplete = function(event) {
  //   // Store values in the newly created objectStore.
  //   var locationObjectStore = db.transaction("locations", "readwrite").objectStore("locations");
  //   // for (var i in locationData) {
  //   //   locationObjectStore.add(locationData[i]);
  //   // }
  // };
};

//document.addEventListener("deviceready", function(){
//}

var sendData = function() {
  console.log("Displaying data...");
  $("#info").html('<p id="info_top"></p>');

  var transaction = db.transaction("locations", "readwrite");
  var objectStore = transaction.objectStore("locations");
  var locations = [];

  objectStore.openCursor().onsuccess = function(event) {
    var cursor = event.target.result;
    if (cursor) {
      if (cursor.value["uploaded"] == false) {
        locations.push(cursor.value);
        $.post(website+"/addlocation", cursor.value, function() {
          let newval = cursor.value;
          newval["uploaded"] = true;
          let trans = db.transaction("locations", "readwrite");
          var objectSt = trans.objectStore("locations");
          var req = objectSt.put(newval);
          req.onsuccess = function(event) {
            $("#info_top").after(".");
          };
        });
      }
      cursor.continue();
    } else {
      for (var i = 0; i < locations.length; i++) {
        var date = new Date(locations[i].timestamp);
        $("#info_top").after("<p>" + date + ", " + locations[i].latitude + ", " + locations[i].longitude + ", " + locations[i].uploaded +"</p>");
      }
    }
  };
};

var onSuccess = function(position) {
  var data = [ {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    altitude: position.coords.altitude,
    accuracy: position.coords.accuracy,
    altitudeAccuracy: position.coords.altitudeAccuracy,
    heading: position.coords.heading,
    speed: position.coords.speed,
    timestamp: new Date(position.timestamp),
    uploaded: false
  } ];

  var transaction = db.transaction("locations", "readwrite");
  // transaction.oncomplete = function(event) {
  //   alert("All done!");
  // };
  // transaction.onerror = function(event) {
  //   // Don't forget to handle errors!
  //   alert("Error adding item to database")
  // };
  var objectStore = transaction.objectStore("locations");
  var request = objectStore.put(data[0]);
  request.onsuccess = function(event) {
    $("#info_top").after("<p>" + position.coords.latitude + ", " + position.coords.longitude);
  };
};

function onError(error) {
    alert('code: '    + error.code    + '\n' +
          'message: ' + error.message + '\n');
}
$("#add").click(function(){
  navigator.geolocation.getCurrentPosition(onSuccess, onError, {timeout: 30000});
});

$("#upload").click(function(){
  if (navigator.network.connection.type != Connection.NONE) {
    sendData();
  } else {
    alert("Pas de connection réseau");
  }
});

$("#clear").click(function(){
  if (confirm("Effacer tout l'historique ?")) {
    if (confirm("Vraiment sûr ?")) {
      cleardata();
    }
  }
});

cleardata = function() {
  var transaction = db.transaction("locations", "readwrite");
  var objectStore = transaction.objectStore("locations");
  var request = objectStore.clear();
  request.onsuccess = function(event) {
    alert("All data cleared!");
  };
}
