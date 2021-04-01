// //start map function

var map;

//Query URL to the NAVTEQ POI data source
var sdsDataSourceUrl = "http://spatial.virtualearth.net/REST/v1/data/Microsoft/PointsOfInterest";

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
        console.log(data);
        console.log(data[0].metadata.Locality);

        for (var i = 0; i < data.length; i++) {

            var location = {
                latitude: data[i].geometry.y,
                longitude: data[i].geometry.x
            };

            var pin = new Microsoft.Maps.Pushpin(location);

            console.log(location);

            //Store some metadata with the pushpin.
            pin.metadata = {
                title: data[i].metadata.DisplayName,
                id: data[i].id,
                name: data[i].metadata.DisplayName,
                description: data[i].metadata.AddressLine
            };

            console.log(pin.metadata);

            //Add pushpin to the map.
            map.entities.push(pin);
            // debugger;
            //Add a click event handler to the pushpin.
            Microsoft.Maps.Events.addHandler(pin, 'click', pushpinClicked);

            weatherStart(data[0].metadata.Locality);
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

// Weather Api

var api = 'https://api.openweathermap.org/data/2.5/forecast?q=';
var apiKey = '&appid=8943dc0c0eb19de1fe9d843a0ca2f4fe';
var apiUV = 'https://api.openweathermap.org/data/2.5/uvi?';
var units = '&units=imperial&cnt=5';

function weatherStart(locality) {
    // change city in url
    console.log("here");
    var city = locality;
    console.log(city);

    var url = api + city + apiKey + units;

    fetch(url)
        .then(response => response.json())
        .then(data => getData(data));
};

function getData(data) {
    var i = 0;

    var city = data.city.name;

    while (i < data.list.length) {
        // use moment to format day text

        var day = moment(data.list[i].dt_txt, 'YYYY-MM-DD HH:mm:ss').format('LLL');
        dayElementArr[i].innerText = day;

        var temp = data.list[i].main.temp;
        tempElementArr[i].innerText = temp + " °F";

        var humidity = data.list[i].main.humidity;
        humidityElementArr[i].innerText = "Humidity: " + humidity + "%";

        var condition = data.list[i].weather[0].main;
        conditionElementArr[i].innerText = condition;

        if (condition === "Rain") {
            imgArr[i].src = "assets/rain.png";
        };
        if (condition === "Clear") {
            imgArr[i].src = "assets/sunny.png";
        };
        if (condition === "Clouds") {
            imgArr[i].src = "assets/cloudy.png";
        };
        if (condition === "Snow") {
            imgArr[i].src = "assets/snow.png";
        };

        console.log(day, temp, humidity, city, condition);
        i++;
    };

    $('#city-jumbo').text(city);
    $('#temp-jumbo').text(data.list[0].main.temp + " °F");
    $('#humidity-jumbo').text("Humidity: " + data.list[0].main.humidity + "%");
    $('#wind-jumbo').text("Wind Speed: " + data.list[0].wind.speed + " MPH");

    var lat = data.city.coord.lat;
    var lon = data.city.coord.lon;

    var url2 = apiUV + "lat=" + lat + "&lon=" + lon + apiKey;

    fetch(url2)
        .then(response => response.json())
        .then(data => getUV(data));

};

// function getUV(data) {
//     var uv = data.value;
//     $('#uv-jumbo').text("UV Index: " + uv);

//     if (uv <= 2) {
//         //color blue
//         $('#uv-jumbo').removeClass("bg-success");
//         $('#uv-jumbo').removeClass("bg-warning");
//         $('#uv-jumbo').removeClass("bg-danger");
//         $('#uv-jumbo').removeClass("bg-dark");
//         $('#uv-jumbo').removeClass("text-dark");
//         $('#uv-jumbo').addClass("text-white");
//         $('#uv-jumbo').addClass("bg-primary");
//     };
//     if (uv >= 2.00 && uv <= 5.00) {
//         //color green
//         $('#uv-jumbo').removeClass("bg-primary");
//         $('#uv-jumbo').removeClass("bg-warning");
//         $('#uv-jumbo').removeClass("bg-danger");
//         $('#uv-jumbo').removeClass("bg-dark");
//         $('#uv-jumbo').removeClass("text-dark");
//         $('#uv-jumbo').addClass("text-white");
//         $('#uv-jumbo').addClass("bg-success");
//     };
//     if (uv >= 5.00 && uv <= 7.00) {
//         //color yellow
//         $('#uv-jumbo').removeClass("bg-success");
//         $('#uv-jumbo').removeClass("bg-primary");
//         $('#uv-jumbo').removeClass("bg-danger");
//         $('#uv-jumbo').removeClass("bg-dark");
//         $('#uv-jumbo').removeClass("text-white");
//         $('#uv-jumbo').addClass("text-dark");
//         $('#uv-jumbo').addClass("bg-warning");
//     };
//     if (uv >= 7.00 && uv <= 10.00) {
//         //color red
//         $('#uv-jumbo').removeClass("bg-warning");
//         $('#uv-jumbo').removeClass("bg-success");
//         $('#uv-jumbo').removeClass("bg-primary");
//         $('#uv-jumbo').removeClass("bg-dark");
//         $('#uv-jumbo').removeClass("text-dark");
//         $('#uv-jumbo').addClass("text-white");
//         $('#uv-jumbo').addClass("bg-danger");
//     };
//     if (uv >= 10.00) {
//         //color black
//         $('#uv-jumbo').removeClass("bg-danger");
//         $('#uv-jumbo').removeClass("bg-warning");
//         $('#uv-jumbo').removeClass("bg-success");
//         $('#uv-jumbo').removeClass("bg-primary");
//         $('#uv-jumbo').removeClass("text-dark");
//         $('#uv-jumbo').addClass("text-white");
//         $('#uv-jumbo').addClass("bg-dark");
//     };

// };