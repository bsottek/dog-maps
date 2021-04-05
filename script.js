// //start map function

var map;

//Query URL to the NAVTEQ POI data source
var sdsDataSourceUrl = "https://spatial.virtualearth.net/REST/v1/data/Microsoft/PointsOfInterest";

function GetMap() {
    map = new Microsoft.Maps.Map('#map', {});

    //Create an infobox at the center of the map but don't show it.
    infobox = new Microsoft.Maps.Infobox(map.getCenter(), {
        visible: false
    });

    navigator.geolocation.getCurrentPosition(function (position) {
        var loc = new Microsoft.Maps.Location(
            position.coords.latitude,
            position.coords.longitude);

        //Add a pushpin at the user's location.
        var pin = new Microsoft.Maps.Pushpin(loc);
        map.entities.push(pin);

        //Center the map on the user's location.
        map.setView({ center: loc });
    });

    //Assign the infobox to a map instance.
    infobox.setMap(map);

    //Load the Bing Spatial Data Services module.
    Microsoft.Maps.loadModule('Microsoft.Maps.SpatialDataService', function () {
        //Add an event handler for when the map moves.
        Microsoft.Maps.Events.addHandler(map, 'viewchangeend', getNearByLocations);
        Microsoft.Maps.Events.addHandler(map, 'viewchangeend', removeList);

        //Trigger an initial search.
        getNearByLocations();

    });
}

function getNearByLocations() {
    //Remove any existing data from the map.
    map.entities.clear();

    //Create a query to get nearby data.
    var queryOptions = {
        queryUrl: sdsDataSourceUrl,
        spatialFilter: {
            spatialFilterType: 'nearby',
            location: map.getCenter(),
            radius: 25
        },
        //Filter to retrieve Parks.
        filter: new Microsoft.Maps.SpatialDataService.Filter('EntityTypeID', 'eq', 7947)
    };

    //Process the query.
    Microsoft.Maps.SpatialDataService.QueryAPIManager.search(queryOptions, map, function (data) {
        //Add results to the map.
        // map.entities.push(data);
        // console.log(data);
        // console.log(data[0].metadata.Locality);

        var localCityArr = [];


        for (var i = 0; i < data.length; i++) {

            var location = {
                latitude: data[i].geometry.y,
                longitude: data[i].geometry.x
            };

            var pin = new Microsoft.Maps.Pushpin(location , {
                icon: 'img/marker.png'
                // color: 'black'
            });

            // console.log(location);

            //Store some metadata with the pushpin.
            pin.metadata = {
                title: data[i].metadata.DisplayName,
                id: data[i].id,
                name: data[i].metadata.DisplayName,
                description: data[i].metadata.AddressLine
            };

            //display data on page

            var newTR = document.createElement('tr');
            var newTD = document.createElement('td');
            var newTD2 = document.createElement('td');

            newTD.setAttribute('id', '#list-' + i);
            newTD.innerText = data[i].metadata.DisplayName;
             
            if (data[i].metadata.AddressLine === "") {
                newTD2.innerText = "No address data.";
            } else {
                newTD2.innerText = data[i].metadata.AddressLine + ', ' + data[i].metadata.PostalCode;
            }

            document.getElementById('list-tab').appendChild(newTR).appendChild(newTD);
            newTR.appendChild(newTD2);
            // document.getElementById('list-' + i);
            // document.getElementById('list-' + i);

            localCityArr.push(newTR);

            // console.log(data[i].metadata);

            //Add pushpin to the map.
            map.entities.push(pin);

            //Add a click event handler to the pushpin.
            Microsoft.Maps.Events.addHandler(pin, 'click', pushpinClicked);

            weatherStart(data[0].metadata.PostalCode);
        }
    });
}

function pushpinClicked(e) {
    //Make sure the infobox has metadata to display.
    if (e.target.metadata) {
        //Set the infobox options with the metadata of the pushpin.
        infobox.setOptions({
            location: e.target.getLocation(),
            title: e.target.metadata.title,
            description: e.target.metadata.description,
            visible: true
        });
    }
}

function removeList() {
    console.log("Deleting");
    var node = document.getElementById('list-tab');
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}

// Weather Api

var api = 'https://api.openweathermap.org/data/2.5/forecast?zip=';
var apiKey = '&appid=8943dc0c0eb19de1fe9d843a0ca2f4fe';
var apiUV = 'https://api.openweathermap.org/data/2.5/uvi?';
var units = '&units=imperial&cnt=5';
var county = ",us";

function weatherStart(zipcode) {
    // change city in url
    // console.log("here");
    var zip = zipcode;
    // console.log(zip);

    var url = api + zip + county + apiKey + units;

    // console.log(url);

    fetch(url)
        .then(response => response.json())
        .then(data => getData(data));
};

function getData(data) {

    var city = data.city.name;

    var temp = data.list[0].main.temp;
    $("#temp").text(temp + " °F");

    var humidity = data.list[0].main.humidity;
    $("#humi").text("Humidity: " + humidity + "%");

    var condition = data.list[0].weather[0].main;
    $("#condi").text(condition);

    // console.log(temp, humidity, city, condition);




    var lat = data.city.coord.lat;
    var lon = data.city.coord.lon;

    var url2 = apiUV + "lat=" + lat + "&lon=" + lon + apiKey;

    fetch(url2)
        .then(response => response.json())
        .then(data => getUV(data));

};

function getUV(data) {
    var uv = data.value;
    $('#uv').text("UV Index: " + uv);

    // if (uv <= 2) {
    //     //color blue
    //     $('#uv-jumbo').removeClass("bg-success");
    //     $('#uv-jumbo').removeClass("bg-warning");
    //     $('#uv-jumbo').removeClass("bg-danger");
    //     $('#uv-jumbo').removeClass("bg-dark");
    //     $('#uv-jumbo').removeClass("text-dark");
    //     $('#uv-jumbo').addClass("text-white");
    //     $('#uv-jumbo').addClass("bg-primary");
    // };
    // if (uv >= 2.00 && uv <= 5.00) {
    //     //color green
    //     $('#uv-jumbo').removeClass("bg-primary");
    //     $('#uv-jumbo').removeClass("bg-warning");
    //     $('#uv-jumbo').removeClass("bg-danger");
    //     $('#uv-jumbo').removeClass("bg-dark");
    //     $('#uv-jumbo').removeClass("text-dark");
    //     $('#uv-jumbo').addClass("text-white");
    //     $('#uv-jumbo').addClass("bg-success");
    // };
    // if (uv >= 5.00 && uv <= 7.00) {
    //     //color yellow
    //     $('#uv-jumbo').removeClass("bg-success");
    //     $('#uv-jumbo').removeClass("bg-primary");
    //     $('#uv-jumbo').removeClass("bg-danger");
    //     $('#uv-jumbo').removeClass("bg-dark");
    //     $('#uv-jumbo').removeClass("text-white");
    //     $('#uv-jumbo').addClass("text-dark");
    //     $('#uv-jumbo').addClass("bg-warning");
    // };
    // if (uv >= 7.00 && uv <= 10.00) {
    //     //color red
    //     $('#uv-jumbo').removeClass("bg-warning");
    //     $('#uv-jumbo').removeClass("bg-success");
    //     $('#uv-jumbo').removeClass("bg-primary");
    //     $('#uv-jumbo').removeClass("bg-dark");
    //     $('#uv-jumbo').removeClass("text-dark");
    //     $('#uv-jumbo').addClass("text-white");
    //     $('#uv-jumbo').addClass("bg-danger");
    // };
    // if (uv >= 10.00) {
    //     //color black
    //     $('#uv-jumbo').removeClass("bg-danger");
    //     $('#uv-jumbo').removeClass("bg-warning");
    //     $('#uv-jumbo').removeClass("bg-success");
    //     $('#uv-jumbo').removeClass("bg-primary");
    //     $('#uv-jumbo').removeClass("text-dark");
    //     $('#uv-jumbo').addClass("text-white");
    //     $('#uv-jumbo').addClass("bg-dark");
    // };

};

// Random Dog Pic
// function to perform a get request
function httpGet(theUrl)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

// Random Dog Pic
// function to perform a get request
function httpGet(theUrl)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

// function to get a random image
function getRandomImage()
{
  // get the json from the server
  var json = httpGet('https://dog.ceo/api/breeds/image/random');
  console.log(json);

  // decode the json into an array
  var array = JSON.parse(json);
  console.log(array);
  
  // get the image url from the array
  var url = array.message;
  console.log(url);
  
  // get the image object
  var image = document.getElementById('dogImage');
  
  // set the src of the image object
  image.src = url;
}