var db;
var openRequest = window.indexedDB.open("LocationsHistory", 1);
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

var displayData = function() {
  console.log("Displaying data...");
  $("#info").html('<p id="info_top"></p>');

  var transaction = db.transaction("locations", "readwrite");
  var objectStore = transaction.objectStore("locations");
  var locations = [];

  objectStore.openCursor().onsuccess = function(event) {
    var cursor = event.target.result;
    if (cursor) {
      locations.push(cursor.value);
      cursor.continue();
    }
    else {
      for (var i = 0; i < locations.length; i++) {
        var date = new Date(locations[i].timestamp);
        $("#info_top").after("<p>" + date + ", " + locations[i].latitude + ", " + locations[i].longitude + "</p>");
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
    timestamp: position.timestamp,
    uploaded: false
  } ];
  console.log(data[0].latitude);
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
    // event.target.result == customerData[i].ssn;
    alert("Location saved!");
  };

  $("#info_end").after("<p>" + position.coords.latitude + ", " + position.coords.longitude);
  alert('Latitude: '          + position.coords.latitude          + '\n' +
        'Longitude: '         + position.coords.longitude         + '\n' +
        'Altitude: '          + position.coords.altitude          + '\n' +
        'Accuracy: '          + position.coords.accuracy          + '\n' +
        'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
        'Heading: '           + position.coords.heading           + '\n' +
        'Speed: '             + position.coords.speed             + '\n' +
        'Timestamp: '         + position.timestamp                + '\n');
};

function onError(error) {
    alert('code: '    + error.code    + '\n' +
          'message: ' + error.message + '\n');
}
$("#add").click(function(){
  console.log("Add button clicked");
  navigator.geolocation.getCurrentPosition(onSuccess, onError, {timeout: 30000});
    // // Start tracking the User
    // watch_id = navigator.geolocation.watchPosition(
    //
    //     // Success
    //     function(position){
    //         tracking_data.push(position);
    //     },
    //
    //     // Error
    //     function(error){
    //         console.log(error);
    //     },
    //
    //     // Settings
    //     { frequency: 3000, enableHighAccuracy: true });
});
$("#upload").click(function(){
  console.log("Upload button clicked");
  displayData();
});
