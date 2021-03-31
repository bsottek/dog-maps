// This is a prototype for google maps api
// by Dallas Yatsinko

const apiKey = "key=AIzaSyB17S8T5EobvJH287-4DKPnyZxSzb5GP9s";


let map;

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 8,
    });
}
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

//this is where the api for the weather begins 
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