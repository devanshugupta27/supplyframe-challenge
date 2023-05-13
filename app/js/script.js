const eventForm = document.querySelector('form');
const searchBtn = document.querySelector("#search-btn");
const locationCheckBox = document.getElementById('location-checkbox');
const validSearchResult = document.getElementById("valid-search");
const errorSearchResult = document.getElementById("error-search");
const eventsTable = document.getElementById('events-table');
const clearBtn = document.getElementById("clear-btn");

window.onload = function(){
    // eventsTable.style.display = "none";
    errorSearchResult.style.display = "none";
    validSearchResult.style.display = "none";

    var button = document.querySelector('#search-btn');
    const locationCheckBox = document.getElementById('location-checkbox');
    
    // button.addEventListener('click', handleClick);
    clearBtn.addEventListener('click', clearBtnHandle);
    locationCheckBox.addEventListener('change', locationToggle);
}

function clearBtnHandle() {

    let keywordField = document.getElementsByName("keyword");
    keywordField.innerHTML = "";
    let locationField = document.getElementById("locationInput");
    locationField.innerHTML = "";

    if (validSearchResult.style.display == "block") {

        eventsTable.innerHTML = "";
    }
    if (errorSearchResult.style.display == "block") {
        errorSearchResult.innerHTML = "";
    }
}

function handleClick(){
    
    const keywordValue = document.getElementById('eventForm').elements["keyword"].value;
    const distanceValue = document.getElementById('eventForm').elements["distance"].value;
    const categoryValue = document.getElementById('eventForm').elements["category"].value;
    
    console.log(keywordValue);
    console.log(distanceValue);
    console.log(categoryValue);

    
    if (validSearchResult.style.display == "block") {

        eventsTable.innerHTML = "";
    }

    let lat = 0.0;
    let long = 0.0;

    let locationCheckBoxStatus = locationBoxChecked();
    console.log(`The checkbox status is ${locationCheckBoxStatus}`);

    if (locationCheckBoxStatus == "true") {
        //auto location detection code

        const IPINFO_API_KEY = '3d6b4a83ca8810';

        fetch(`https://ipinfo.io/?token=${IPINFO_API_KEY}`
        ).then((response) => {
            return response.json();
        }).then(jsonData => {
            let locations = jsonData.loc.split(',');
            let lat = locations[0];
            let long = locations[1];

            //making call to backend
            fetch(`/ticketmaster_eventsearch?lat=${lat}&long=${long}&keyword=${keywordValue}&category=${categoryValue}&distance=${distanceValue}`, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    'accept': 'application/json'
                }
            }).then((response) => {
                response.json().then((data) => {
                    let show = "error";
                    if (Object.keys(data['data']).length > 0) {
                        show = "valid";
                    } 
                    determineDisplayState(show, data);
                })
            })
        })
        .catch(error => {
            console.log(error);
        });
    }
    else if (locationCheckBoxStatus == "false") {
        
        const locationValue = document.getElementById('eventForm').elements["location"].value;
        let encodedLocationValue = encodeURIComponent(locationValue);
        
        const GOOGLE_API_KEY = 'AIzaSyA0u47ghgMZH8QiAieRczXAxH1zkR8lgRM';

        fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodedLocationValue}&key=${GOOGLE_API_KEY}`
        ).then((response) => {
            return response.json();
        }).then(jsonData => {
            lat = jsonData.results[0].geometry.location.lat;
            long = jsonData.results[0].geometry.location.lng;
            //making call to backend
            // let location = lat +',' + long;
            fetch(`/ticketmaster_eventsearch?lat=${lat}&long=${long}&keyword=${keywordValue}&category=${categoryValue}&distance=${distanceValue}`, {
                method: "GET",
                "headers": {
                    'accept': 'application/json'
                }
            }).then((response) => {
                return response.json();
            }).then((data) => {         
                let show = "error";
                if (Object.keys(data['data']).length > 0) {
                    show = "valid";
                } 
                determineDisplayState(show, data);
            })
        })
        .catch(error => {
            console.log(error);
        });
    }
}

function locationToggle() {
    const locationInput = document.getElementById('locationInput');

    if (this.checked) {
        console.log("checkbox is checked");
        locationInput.style.display = "none";
        locationInput.removeAttribute("required");
    }
    else {
        console.log("checkbox is unchecked");
        locationInput.style.display = "block";

    }
};

function locationBoxChecked() {
    const locationInput = document.getElementById('location-checkbox');

    if (locationInput.checked) {
        return "true";
    }
    else
        return "false";
};

function determineDisplayState (show, responseJSON) {
    if (show == "valid") {
        
        generateTableHead(eventsTable, responseJSON['data']);
        generateTable(eventsTable, responseJSON['data']);
        validSearchResult.style.display = "block";
    }
    else if (show == "error") {
        console.log("no records found");
        
        let errorMessageDiv = document.createElement("div");
        let errorMessage = document.createTextNode("No Records found");
        errorMessageDiv.setAttribute("id", "errorMessage");
        errorMessageDiv.appendChild(errorMessage);
        errorSearchResult.appendChild(errorMessageDiv);
        errorSearchResult.style.display = "block";
    }
}

function generateTableHead(table) {
    let thead = table.createTHead();
    let row = thead.insertRow();
    row.class = 'tableHeader';


    let tableHeaders = ['Date', 'Icon', 'Event', 'Genre', 'Venue']

    tableHeaders.forEach(function(value, i) {

        let th = document.createElement("th");
        th.onclick = function(e) {
            
            e.preventDefault();
            sortTable(i);
        }
        
        
       let text = document.createTextNode(value);

        th.appendChild(text);
        row.appendChild(th);

    })
}
  
function generateTable(table, data) {
    let cell, text;
    let text1, text2;
    console.log("Printing length of data" + data.length);
    for (let element of data) {
        
        
        let row = table.insertRow();
        
        row.setAttribute('class', "events-table-row");
        

        let eventId = element["eventId"];
    
        //Date
        cell = row.insertCell();
        cell.id = "date-row";

        if (element.hasOwnProperty("date")) {
            let date = element["date"]
            text1 = document.createTextNode(date);

            if (element.hasOwnProperty("time")) {
                let time = element["time"];
                text2 = document.createTextNode(time);
            }
            let linebreak = document.createElement("br");
            cell.setAttribute('class', "table-content");
            cell.appendChild(text1);
            cell.appendChild(linebreak);
            cell.appendChild(text2);    
        }


        //Icon
        cell = row.insertCell();
        cell.id = "icon-row";

        if (element.hasOwnProperty("icon")) {
            let icon = element["icon"];
            let image = document.createElement('img');
            image.id = "icon-image"
            image.src = icon;
            cell.setAttribute('class', "table-content");
            cell.appendChild(image);
    
        }

        //Name
        cell = row.insertCell();
        if (element.hasOwnProperty("eventName")) {
            let name = element["eventName"];
            let anchor = document.createElement("a");
            anchor.setAttribute("class", "eventLink");
            anchor.setAttribute("href", "#facebook_ads_example");
    
            text = document.createTextNode(name);
            anchor.appendChild(text);
            cell.setAttribute('class', "table-content");
            cell.appendChild(anchor);
    
        }

        //Genre
        cell = row.insertCell();
        cell.id = "genre-row";
        if (element.hasOwnProperty("genre")) {
            let genre = element["genre"];
            text = document.createTextNode(genre);
            cell.setAttribute('class', "table-content");
            cell.appendChild(text);
    
        }

        //Venue
        cell = row.insertCell();
        cell.id = "venue-row";
        if (element.hasOwnProperty("venue")) {
            let venue = element["venue"];
            text = document.createTextNode(venue);
            cell.setAttribute('class', "table-content");
            cell.appendChild(text);
    
        }
    }
}