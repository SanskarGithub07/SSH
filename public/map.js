let userCoords = [];
let restaurantsCoords = [];
let restaurantPlace = [];
let distCenter = [];
let poi = "";
let currentMarker = null; // Store the currently clicked marker

// Create an array to store marker coordinates
const markers = [];
fetch("/getPoi")
  .then((response) => response.json())
  .then((data) => {
    poi = data.poi;
    console.log(poi);
    // Now you can use the poi data in your client-side JavaScript
  })
  .catch((error) => {
    console.error("Error fetching poi data:", error);
  });

// Function to calculate and display the route
function calculateRoute(startLngLat, endLngLat, map) {
  // Remove previous route if it exists
  if (map.getSource("route")) {
    map.removeLayer("route");
    map.removeSource("route");
  }

  const apiUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${startLngLat[0]},${startLngLat[1]};${endLngLat[0]},${endLngLat[1]}?geometries=geojson&access_token=pk.eyJ1IjoiZHJhc3RpY2MxbmsiLCJhIjoiY2xtcXJpZzJmMDBkODJzbXloajQzdXd4NyJ9.xKoQBVmU8LiaOy0WJ2sHsg`;

  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      // Extract the route geometry from the response
      const route = data.routes[0].geometry;

      // Create a new LineString feature from the route geometry
      const routeGeoJSON = {
        type: "Feature",
        geometry: route,
      };

      // Add the route source and layer to the map
      map.addSource("route", {
        type: "geojson",
        data: routeGeoJSON,
      });

      map.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "blue", // Color of the route line
          "line-width": 5, // Width of the route line
        },
      });
    })
    .catch((error) => {
      console.error("Error calculating route:", error);
    });
}

function createRandomMarker(latitude, longitude, map, name) {
  fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=pk.eyJ1IjoiZHJhc3RpY2MxbmsiLCJhIjoiY2xtcXJpZzJmMDBkODJzbXloajQzdXd4NyJ9.xKoQBVmU8LiaOy0WJ2sHsg`
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      const placeNameN = data.features[0].place_name;

      // Create a new marker and set its coordinates
      const randomMarker = new mapboxgl.Marker({ color: "green", scale: 0.5 })
        .setLngLat([longitude, latitude])
        .addTo(map);

      // Create a popup and set its content
      const popupN = new mapboxgl.Popup({ closeOnClick: false })
        .setHTML(`<h1>${placeNameN}</h1>`)
        .addClassName("fontStyle");

        randomMarker.on("click", () => {
          popupN.addTo(map);
        });

      // Associate the popup with the marker
      randomMarker.setPopup(popupN);
      restaurantPlace.push(placeNameN);


      // Add a click event listener to the marker
      randomMarker.getElement().addEventListener("click", () => {
        if (currentMarker) {
          currentMarker.togglePopup();
        }
        randomMarker.togglePopup();
        calculateRoute(
          [userCoords[1], userCoords[0]],
          [longitude, latitude],
          map
        );
        currentMarker = randomMarker;
      });

      calculateRoute(
        [userCoords[1], userCoords[0]],
        [longitude, latitude],
        map
      );
    })
    .catch((error) => {
      console.error("Error fetching place name:", error);
    });
}

function success(pos) {
  const crd = pos.coords;
  let userLat = crd.latitude;
  let userLng = crd.longitude;

  userCoords.push(userLat);
  userCoords.push(userLng);

  console.log("Your current position is:");
  console.log(`Latitude : ${crd.latitude}`);
  console.log(`Longitude: ${crd.longitude}`);
  console.log(`More or less ${crd.accuracy} meters.`);

  // Initialize the map
  mapboxgl.accessToken =
    "pk.eyJ1IjoiZHJhc3RpY2MxbmsiLCJhIjoiY2xtcXJpZzJmMDBkODJzbXloajQzdXd4NyJ9.xKoQBVmU8LiaOy0WJ2sHsg";

  // These options control the camera position after animation
  const start = {
    center: [80, 36],
    zoom: 1,
    pitch: 0,
    bearing: 0,
  };
  const end = {
    center: [userCoords[1], userCoords[0]],
    zoom: 9,
    bearing: 130,
    pitch: 75,
  };
  const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v12",
    ...start,
  });

  map.on("style.load", () => {
    map.setFog({
      color: "rgb(220, 159, 159)",
      "high-color": "rgb(36, 92, 223)",
      "horizon-blend": 0.2,
    });

    map.addSource("mapbox-dem", {
      type: "raster-dem",
      url: "mapbox://mapbox.terrain-rgb",
    });

    map.setTerrain({
      source: "mapbox-dem",
      exaggeration: 1.5,
    });
  });

  let isAtStart = true;

  document.getElementById("fly").addEventListener("click", () => {
    const target = isAtStart ? end : start;
    isAtStart = !isAtStart;

    map.flyTo({
      ...target,
      duration: 5000,
      essential: true,
    });
  });

  const marker1 = new mapboxgl.Marker({ color: "red", scale: 1 })
    .setLngLat([userCoords[1], userCoords[0]])
    .addTo(map);

  fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${userCoords[1]},${userCoords[0]}.json?access_token=${mapboxgl.accessToken}`
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      const placeName = data.features[0].place_name;

      const popup = new mapboxgl.Popup({ closeOnClick: false })
        .setHTML(`<h1>${placeName}</h1>`)
        .addTo(map)
        .addClassName("fontStyle");

      marker1.setPopup(popup);
    })
    .catch((error) => {
      console.error("Error fetching place name:", error);
    });

  map.addControl(
    new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
      showUserHeading: true,
    })
  );

  map.on("load", () => {
    map.addLayer({
      id: "restaurant-layer",
      type: "circle",
      source: {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      },
      paint: {
        "circle-color": "blue",
        "circle-radius": 6,
        "circle-stroke-width": 2,
        "circle-stroke-color": "white",
      },
    });

    const radiusInMeters = 50000;
    const restaurantQuery = `https://api.mapbox.com/geocoding/v5/mapbox.places/${poi}.json?proximity=${userCoords[1]},${userCoords[0]}&radius=${radiusInMeters}&access_token=${mapboxgl.accessToken}`;
    fetch(restaurantQuery)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        const restaurantFeatures = data.features;
        const arrayInfo = [];
        restaurantFeatures.forEach((restaurant) => {
          const coordinates = restaurant.geometry.coordinates;
          const arr = [];
          let i = 0;
          let j = 0;
          for (const key in coordinates) {
            if (coordinates.hasOwnProperty(key)) {
              const value = coordinates[key];
              arr[i] = value;
              i++;
            }
          }
          const res = new mapboxgl.LngLat(arr[0], arr[1]);
          const userLoc = new mapboxgl.LngLat(userCoords[1], userCoords[0]);
          const resDistance = res.distanceTo(userLoc);
          distCenter.push(resDistance);
          createRandomMarker(arr[1], arr[0], map);
          // Add a click event listener to the marker
          // Build restaurant information including coordinates and POI
          const restaurantInfo = {
            coordinates: coordinates,
            poi: poi,
            resDistance: resDistance
          };

          arrayInfo.push(restaurantInfo);
          console.log("Coordinates:", coordinates);
        });

        const restaurantInfoDiv = document.getElementById("restaurant-info");
        // Display restaurant information in the HTML div
        arrayInfo.forEach((info) => {
          restaurantInfoDiv.innerHTML += `<ul>
  <li>Coordinates: ${info.coordinates}</li>
  <li>Distance(in kilometres): ${Math.floor(info.resDistance) / 1000 + "km"}</li>
  <li>POI Value: ${info.poi}</li></ul>`;
        });
      })
      .catch((error) => {
        console.error("Error fetching restaurant data:", error);
      });
  });
}

const options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
};

function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

navigator.geolocation.getCurrentPosition(success, error, options);
console.log(restaurantPlace);
console.log(distCenter);
