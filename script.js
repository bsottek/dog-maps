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