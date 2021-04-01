//start map function

var sdsDataSourceUrl = "http://spatial.virtualearth.net/REST/v1/data/Microsoft/PointsOfInterest";

function GetMap() {
    map = new Microsoft.Maps.Map('#map', {
        credentials: 'AuqWN0H7ork1R33gaSwoiQ-0J7A6XmwHHtCD5UUwQBYa9KYVH9KZL_3i17KseieW',
        //need to sub in a variable containing user input
        center: new Microsoft.Maps.Location(37.151, -86.856)
    });

    //Create an infobox at the center of the map but don't show it.
    infobox = new Microsoft.Maps.Infobox(map.getCenter(), {
        visible: false
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
        //Filter to retrieve parks.
        filter: new Microsoft.Maps.SpatialDataService.Filter('EntityTypeID', 'eq', 7947)
    };

    //Process the query.
    Microsoft.Maps.SpatialDataService.QueryAPIManager.search(queryOptions, map, function (data) {
        //Add results to the map.
        // map.entities.push(data);
        console.log(data);

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

//end map function


class Fetch {
    async getCurrent(input) {
        const myKey = "d4894b22956346da85b407624cc70a42";

        //make request to url

        const response = await fetch(
            `http://api.weatherbit.io/v2.0/forecast/daily?key=${myKey}&units=I&days=1&postal_code=${input}&city=${input}`
        );

        const data = await response.json();
        //return zip code out of data
        console.log(data);

        return data;
    }

}

// this is where the api for the weather begins 
class UI {
    constructor() {
        this.uiContainer = document.getElementById("content");
        this.city;
        this.defaultCity = "Nashville";
    }

    populateUI(data) {
        //de-structure vars
        console.log(data);
        console.log(data.data);
        console.log(data.data[0]);
        console.log(data.data[0].high_temp);
        //add them to inner HTML

        this.uiContainer.innerHTML = `
        
        <div class="card mx-auto mt-5" style="width: 18rem;">
            <div class="card-body justify-content-center">
                <h5 class="card-title">${data.data[0].datetime}-Date</h5>
                <h5 class="card-title">${data.data[0].high_temp}-High-Temp</h5>
                <h5 class="card-title">${data.data[0].low_temp}-Low-Temp</h5>
                <h5 class="card-title">${data.data[0].wind_gust_spd}-Wind Gust Speed</h5>
                

                
                
            </div>
        </div>
        
        
        `;
    }


    clearUI() {
        uiContainer.innerHTML = "";
    }

    saveToLS(data) {
        localStorage.setItem("city", JSON.stringify(data));
    }

    getFromLS() {
        if (localStorage.getItem("city" == null)) {
            return this.defaultCity;
        } else {
            this.city = JSON.parse(localStorage.getItem("city"));
        }

        return this.city;
    }

    clearLS() {
        localStorage.clear();
    }
}

//app beggins but can be split maybe.
//inst classes//

const ft = new Fetch();
const ui = new UI();

//add event listeners//

const search = document.getElementById("searchUser");
const button = document.getElementById("submit");
button.addEventListener("click", () => {
    const currentVal = search.value;

    ft.getCurrent(currentVal).then((data) => {
        console.log(data);
        //call a UI method//
        ui.populateUI(data);
        //call saveToLS
        ui.saveToLS(data);
    });
});

//event listener for local storage

window.addEventListener("DOMContentLoaded", () => {
    const dataSaved = ui.getFromLS();
    // ui.populateUI(dataSaved);
});

//this is where the weather api ends