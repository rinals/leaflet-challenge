// Step 1: Initialize the map

// Initialize the map and set it to the center of the United States
const map = L.map('map').setView([37.09, -95.71], 5);

// Add a base layer (tile layer) from OpenStreetMap
const tileLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Step 2: Fetch the earthquake data

// URL for USGS earthquake data (all earthquakes from the past 7 days)
const earthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Fetch earthquake data
d3.json(earthquakeUrl)
    .then(data => {
        // Call the function to add earthquake data to the map
        addEarthquakeData(data);
    })
    .catch(error => console.log("Error fetching earthquake data:", error));

// Step 3: Add earthquake data to the map

// Function to determine the color of the marker based on earthquake depth
function getColor(depth) {
    return depth > 90 ? '#FF0000' :
            depth > 70 ? '#FF4500' :
            depth > 50 ? '#FFA500' :
            depth > 30 ? '#FFD700' :
            depth > 10 ? '#ADFF2F' :
                         '#00FF00';
    }

// Function to determine marker size based on earthquake magnitude
function getRadius(magnitude) {
    return magnitude * 4; // Adjust scale factor as needed
}

// Function to add earthquake data to the map
function addEarthquakeData(data) {
    L.geoJSON(data, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, {
                radius: getRadius(feature.properties.mag),  // Radius based on magnitude
                fillColor: getColor(feature.geometry.coordinates[2]),  // Color based on depth
                color: "#000",
                weight: 0.5,
                opacity: 1,
                fillOpacity: 0.7
            });
        },
        onEachFeature: function(feature, layer) {
            // Add popup for each feature
            layer.bindPopup(`
                <h3>${feature.properties.place}</h3>
                <hr>
                <p>Magnitude: ${feature.properties.mag}</p>
                <p>Depth: ${feature.geometry.coordinates[2]} km</p>
                <p>Time: ${new Date(feature.properties.time)}</p>
            `);
        }
    }).addTo(map);
}

// Step 4: Add a legend

// Add a legend to the map
const legend = L.control({ position: "bottomright" });

legend.onAdd = function() {
    const div = L.DomUtil.create("div", "info legend");
    const depths = [-10, 10, 30, 50, 70, 90];
    const colors = ["#00FF00", "#ADFF2F", "#FFD700", "#FFA500", "#FF4500", "#FF0000"];

    // Add a title to the legend
    div.innerHTML = "<h4>Depth (km)</h4>"; 

    // Loop through depth intervals and create a label with a colored square for each interval
    for (let i = 0; i < depths.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(depths[i] + 1) + '"></i> ' +
            depths[i] + (depths[i + 1] ? "&ndash;" + depths[i + 1] + "<br>" : "+");
    }

    return div;
};

legend.addTo(map);

