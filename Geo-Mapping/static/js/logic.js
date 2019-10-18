// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
}

// Define function to create the circle radius based on the magnitude
function radiusSize(magnitude) {
    return magnitude * 15000;
  }

  function Color(magnitude) {
    if (magnitude > 5) {
        return '#ff3333'
    } else if (magnitude > 4) {
        return '#ff6633'
    } else if (magnitude > 3) {
        return '#ff9933'
    } else if (magnitude > 2) {
        return '#ffcc33'
    } else if (magnitude > 1) {
        return '#ffff33'
    } else {
        return '#ccff33'
    }
  };

// Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function(earthquakeData, latlng) {
      return L.circle(latlng, {
        radius: radiusSize(earthquakeData.properties.mag),
        color: Color(earthquakeData.properties.mag),
        fillOpacity: 1
      });
    },
    onEachFeature: onEachFeature
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

  function createMap(earthquakes) {

    // Define streetmap and darkmap layers
    var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.streets",
      accessToken: "pk.eyJ1IjoiYXlydG9uYmF5ZXIyNSIsImEiOiJjazA5bWg3cHAwNDc4M2NtaGZiNmRoNTY1In0.QLWGfQ7dwwyKqskwt96R9g"
    });
  
    var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.dark",
      accessToken: "pk.eyJ1IjoiYXlydG9uYmF5ZXIyNSIsImEiOiJjazA5bWg3cHAwNDc4M2NtaGZiNmRoNTY1In0.QLWGfQ7dwwyKqskwt96R9g"
    });
  
    // Define a baseMaps object to hold our base layers
    var baseMaps = {
      "Street Map": streetmap,
      "Dark Map": darkmap
    };
  
    // Create overlay object to hold our overlay layer
    var overlayMaps = {
      Earthquakes: earthquakes
    };
  
    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
      center: [
        37.09, -95.71
      ],
      zoom: 5,
      layers: [streetmap, earthquakes]
    });
  
    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);
  }
  // color function to be used when creating the legend
  function getColor(d) {
    return d < 1 ? '#ff4433' :
          d < 2  ? '#ff6443' :
          d < 3  ? '#ff9943' :
          d < 4  ? '#ffcc43' :
          d < 5  ? '#ffff33' :
                    '#ccff33';
  }

  // Set up the legend
  var legend = L.control({position: 'bottomleft'});
  legend.onAdd = function (map) {
      var div = L.DomUtil.create('div', 'info legend'),
      grades = [0, 1, 2, 3, 4, 5],
      labels = [];
      div.innerHTML+='Earthquake Magnitude<br><hr>'
      // legend lables
  for (var i = 0; i < grades.length; i++) {
          div.innerHTML +=
              '<i style="background:' + getColor(grades[i] + 1) + '">&nbsp&nbsp&nbsp&nbsp</i> ' +
              grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
  }
    return div;
  };
  legend.addTo(myMap);
