const eventForm = document.querySelector('form');
const searchBtn = document.querySelector("#search-btn");
const locationCheckBox = document.getElementById('location-checkbox');
const validSearchResult = document.getElementById("valid-search");
const errorSearchResult = document.getElementById("error-search");
const eventsTable = document.getElementById('events-table');
const eventCardResult = document.getElementById("event-card");
const showVenueDetails = document.getElementById("showVenueDetails");
const downArrow = document.getElementById("arrow-down");
const venueCardResult = document.getElementById("venue-card");
const clearBtn = document.getElementById("clear-btn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

let eventTableResponse;
let currStartingIndex = 0;
$(document).ready(function () {
    // $('#events-table').DataTable();
    $('#dummy-table').DataTable();
});

window.onload = function(){
    // eventsTable.style.display = "none";
    errorSearchResult.style.display = "none";
    validSearchResult.style.display = "none";
    eventCardResult.style.display = "none";
    showVenueDetails.style.display = "none";
    venueCardResult.style.display = "none";

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
    if (eventCardResult.style.display == "block") {
        eventCardResult.style.display = "none";
        eventCardResult.innerHTML= "";
    }
    if (showVenueDetails.style.display == "block") {
        showVenueDetails.style.display = "none";
        
    }
    console.log("printing state of venue card" + venueCardResult.style.display);
    if (venueCardResult.style.display == "block") {
        console.log("inside if statement");
        venueCardResult.style.display = "none";
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
    if (eventCardResult.style.display == "block") {
        eventCardResult.innerHTML= "";
    }
    if (showVenueDetails.innerHTML == "block") {
        showVenueDetails.style.display = "none";
        // showVenueDetails.innerHTML = "";
    }
    if (venueCardResult.innerHTML == "block") {
        venueCardResult.innerHTML = "";
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
            fetch(`http://localhost:8080/ticketmaster_eventsearch?lat=${lat}&long=${long}&keyword=${keywordValue}&category=${categoryValue}&distance=${distanceValue}`, {
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
                    eventTableResponse = data; 
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
            fetch(`http://localhost:8080/ticketmaster_eventsearch?lat=${lat}&long=${long}&keyword=${keywordValue}&category=${categoryValue}&distance=${distanceValue}`, {
                method: "GET",
                "headers": {
                    'accept': 'application/json'
                }
            }).then((response) => {
                return response.json();
            }).then((data) => {        
                console.log(data); 
                let show = "error";
                if (Object.keys(data['data']).length > 0) {
                    show = "valid";
                } 
                eventTableResponse = data;
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
        
        generateTableHead();
        // generateTable(eventsTable, responseJSON['data']);
        // generateTable("new");
        generateTableRows("new");
        
        
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

function generateTableHead() {
    let thead = eventsTable.createTHead();
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
  

function generateTableRows(type) {

    if (type == "new") {
        //show first 10 rows
        currStartingIndex = 0;
        generateTable(currStartingIndex);
    }
    else if (type == "next") {
        //show next 10 rows & update start index
        currStartingIndex = currStartingIndex + 10;
        generateTable(currStartingIndex);
        if (prevBtn.disabled) {
            prevBtn.removeAttribute("disabled");
        }
    }
    else if (type == "prev") {
        //show prev 10 rows and update start index
        currStartingIndex -= 10;
        generateTable(currStartingIndex);
        if (nextBtn.disabled) {
            nextBtn.removeAttribute("disabled");
        }
    }
    console.log(currStartingIndex);
}

function generateTable(index) {
    let cell, text;
    let text1, text2;

    eventsTable.innerHTML = "";
    generateTableHead();

    let limit = index + 10 <= eventTableResponse['data'].length ? index + 10 : eventTableResponse['data'].length;

    if (limit == eventTableResponse['data'].length) {
        nextBtn.setAttribute("disabled", "disabled");
    }
    if (index == 0) {
        prevBtn.setAttribute("disabled", "disabled");
    }

    console.log(limit);
    for (let elementIndex = index; elementIndex < limit; elementIndex++) {
        
        let rowData = {};
        
        let row = eventsTable.insertRow();
        
        row.setAttribute('class', "events-table-row");
        

        let eventId = eventTableResponse['data'][elementIndex]["eventId"];
    
        //Date
        cell = row.insertCell();
        cell.id = "date-row";

        if (eventTableResponse['data'][elementIndex].hasOwnProperty("date")) {
            let date = eventTableResponse['data'][elementIndex]["date"];
            
            text1 = document.createTextNode(date);

            if (eventTableResponse['data'][elementIndex].hasOwnProperty("time")) {
                let time = eventTableResponse['data'][elementIndex]["time"];
                text2 = document.createTextNode(time);
            }
            let linebreak = document.createElement("br");
            cell.setAttribute('class', "table-content");
            rowData.date = text1 + ' ' + text2;
            cell.appendChild(text1);
            cell.appendChild(linebreak);
            cell.appendChild(text2);    
        }


        //Icon
        cell = row.insertCell();
        cell.id = "icon-row";

        if (eventTableResponse['data'][elementIndex].hasOwnProperty("icon")) {
            let icon = eventTableResponse['data'][elementIndex]["icon"];
            let image = document.createElement('img');
            image.id = "icon-image"
            image.src = icon;
            cell.setAttribute('class', "table-content");
            cell.appendChild(image);
            rowData.icon = icon;
    
        }

        //Name
        cell = row.insertCell();
        if (eventTableResponse['data'][elementIndex].hasOwnProperty("eventName")) {
            let name = eventTableResponse['data'][elementIndex]["eventName"];
            let anchor = document.createElement("a");
            rowData.name = name;
            anchor.setAttribute("class", "eventLink");
            anchor.setAttribute("href", "#facebook_ads_example");
    
            let eventCard = document.getElementById('event-card');
            anchor.onclick = function(e) {
                console.log("clicked");

                if (eventCardResult.style.display == "block") {
                    eventCardResult.innerHTML = "";
                }
                if (showVenueDetails.style.display == "block") {
                    showVenueDetails.style.display = "none";
                }
                if (venueCardResult.style.display == "block") {
                    // venueCardResult.style.display = "none";
                    venueCardResult.innerHTML = "";
                }

                eventCardResult.style.display = "block";
                e.preventDefault();
                eventCard.scrollIntoView();
                console.log(eventId);
                eventCardCreation(eventId);
            }
            text = document.createTextNode(name);
            anchor.appendChild(text);
            cell.setAttribute('class', "table-content");
            cell.appendChild(anchor);
    
        }

        //Genre
        cell = row.insertCell();
        cell.id = "genre-row";
        if (eventTableResponse['data'][elementIndex].hasOwnProperty("genre")) {
            let genre = eventTableResponse['data'][elementIndex]["genre"];
            rowData.genre = genre;
            text = document.createTextNode(genre);
            cell.setAttribute('class', "table-content");
            cell.appendChild(text);
    
        }

        //Venue
        cell = row.insertCell();
        cell.id = "venue-row";
        if (eventTableResponse['data'][elementIndex].hasOwnProperty("venue")) {
            let venue = eventTableResponse['data'][elementIndex]["venue"];
            rowData.venue = venue;
            text = document.createTextNode(venue);
            cell.setAttribute('class', "table-content");
            cell.appendChild(text);
    
        }
    }
}

function eventCardCreation (eventId) {

    fetch(`http://localhost:8080/ticketmaster_eventdetails?eventId=${eventId}`, {
        method: "GET",
        "headers": {
            'accept': 'application/json'
        }
    }).then((response) => {
        return response.json();
    }).then((data) => {     
        data = data['data'];
        console.log(data);

        let venue;
        //this div is for the whole card
        let eventCardDiv = document.getElementById("event-card");

        if (data.hasOwnProperty("name")) {
            let title = document.createTextNode(data["name"]);
            
            var h2 = document.createElement("H2");
            h2.setAttribute("id", "eventTitle");
            h2.appendChild(title);
            eventCardDiv.appendChild(h2);            
        }
        
        //this div is for the event details displayed on the left
        let eventDetailsDiv = document.createElement("div");
        eventDetailsDiv.setAttribute("id", "eventDetails");

        //Date
        if (data.hasOwnProperty("date")) {

            let fieldValue;
            let dateDiv = document.createElement("div");
            let dateField = document.createTextNode("Date");
            dateDiv.setAttribute("class", "eventCardFields");
            dateDiv.appendChild(dateField);

            let date = data["date"];
            fieldValue = date;
            let time;
            
            if (data.hasOwnProperty("time")) {
                time = data["time"];
                fieldValue = date + " " + time;
            }
            
            let dateValueDiv = document.createElement("div");
            dateValueDiv.setAttribute("class", "eventCardFieldValue");
            let dateValue = document.createTextNode(fieldValue);
            dateValueDiv.append(dateValue);

            eventDetailsDiv.appendChild(dateDiv);
            eventDetailsDiv.appendChild(dateValueDiv);
        }

        //Artist/Team
        if (data.hasOwnProperty("artist")) {

            let artistDiv = document.createElement("div");
            let artistField = document.createTextNode("Artist/Team");
            artistDiv.setAttribute("class", "eventCardFields");
            artistDiv.appendChild(artistField);

            let artistNameDiv = document.createElement("div");
            let delim = " | ";

            
            for (let i = 0; i < data["artist"].length; i++) {

                if (data["artist"][i].length == 2) {
                    
                    let artistName = document.createElement("div");
                    artistName.style = "display:inline-block;";
                    let artistAnchor = document.createElement("a");
                    artistAnchor.setAttribute("class", "eventCardURL");
                    artistAnchor.setAttribute("href", data["artist"][i][1]);
                    artistAnchor.setAttribute("target", "_blank");
                    
                    artistAnchor.text = data["artist"][i][0];
                    
                    artistName.append(artistAnchor);
                    artistNameDiv.append(artistName);


                    if (i < data["artist"].length - 1) {
                        let delimTag = document.createTextNode(delim);
                        delimTag.style = "display:inline-block;";
                        artistNameDiv.append(delimTag);
                    }
                }

                else {
                    let text = document.createTextNode(data["artist"][i]);
                    artistNameDiv.append(text);

                
                    if (i < data["artist"].length - 1) {
                        let delimTag = document.createTextNode(delim);
                        artistNameDiv.append(delimTag);
                    }
                }
            }
            
            artistNameDiv.setAttribute("class", "eventCardFieldValue");
            eventDetailsDiv.appendChild(artistDiv);
            eventDetailsDiv.appendChild(artistNameDiv);
        }

        //Venue
        if (data.hasOwnProperty("venue")) {

            let venueDiv = document.createElement("div");
            let venueField = document.createTextNode("Venue");
            venueDiv.setAttribute("class", "eventCardFields");
            venueDiv.appendChild(venueField);

            venue = data["venue"];

            let fieldValue = venue;
            
            let venueValueDiv = document.createElement("div");
            let venueValue = document.createTextNode(fieldValue);
            
            venueValueDiv.append(venueValue);
            venueValueDiv.setAttribute("class", "eventCardFieldValue");
            eventDetailsDiv.appendChild(venueDiv);
            eventDetailsDiv.appendChild(venueValueDiv);
        }

        //Genre
        if (data.hasOwnProperty("genre")) {

            let genreDiv = document.createElement("div");
            let genreField = document.createTextNode("Genres");
            genreDiv.setAttribute("class", "eventCardFields");
            genreDiv.appendChild(genreField);

            let genresValue = "";

            for (let i = 0; i < data["genre"].length; i++) {
                console.log(data["genre"][i]);
                genresValue = genresValue + data["genre"][i];
                
                if (i < data["genre"].length - 1) {
                    genresValue = genresValue + " | ";
                }
            }
            console.log(genresValue);
            let fieldValue = genresValue;
            
            let genreValueDiv = document.createElement("div");
            let genreValue = document.createTextNode(fieldValue);
            genreValueDiv.setAttribute("class", "eventCardFieldValue");
            genreValueDiv.append(genreValue);

            eventDetailsDiv.appendChild(genreDiv);
            eventDetailsDiv.appendChild(genreValueDiv);
        }

        //Price Ranges
        if (data.hasOwnProperty("price")) {

            let priceDiv = document.createElement("div");
            let priceField = document.createTextNode("Price Ranges");
            priceDiv.setAttribute("class", "eventCardFields");
            priceDiv.appendChild(priceField);

            let price = data["price"]["min"] + " - " + data["price"]["max"] + " USD";

            let fieldValue = price;
            
            let priceValueDiv = document.createElement("div");
            let priceValue = document.createTextNode(fieldValue);
            priceValueDiv.setAttribute("class", "eventCardFieldValue");
            priceValueDiv.append(priceValue);

            eventDetailsDiv.appendChild(priceDiv);
            eventDetailsDiv.appendChild(priceValueDiv);
        }

        //Ticket status
        if (data.hasOwnProperty("ticketStatus")) {

            let ticketStatusDiv = document.createElement("div");
            let ticketStatusField = document.createTextNode("Ticket Status");
            ticketStatusDiv.setAttribute("class", "eventCardFields");
            ticketStatusDiv.appendChild(ticketStatusField);

            let ticketStatus = data['ticketStatus'];
            
            
            let ticketStatusValueDiv = document.createElement("div");
            ticketStatusValueDiv.id = "ticketStatus";
            let widthSize;
            
            let fieldValue;
            let color;
            if (ticketStatus == "onsale") {
                fieldValue = "On Sale";
                widthSize = 70;
                color = "green";
                
            }
            else if (ticketStatus == "offsale") {
                fieldValue = "Off Sale";
                widthSize = 70;
                color = "red";
            }
            else if (ticketStatus == "canceled" || ticketStatus == "cancelled") {
                fieldValue = "Canceled";
                widthSize = 80;
                color = "black";
            }
            else if (ticketStatus == "postponed") {
                fieldValue = "Postponed";
                widthSize = 80;
                color = "orange";
            }
            else if (ticketStatus == "rescheduled"){
                fieldValue = "Rescheduled";
                widthSize = 90;
                color = "orange";
            }

            ticketStatusValueDiv.style = `background-color: ${color}; width: ${widthSize};`;
            
            let ticketStatusValue = document.createTextNode(fieldValue);
            ticketStatusValueDiv.setAttribute("class", "eventCardFieldValue");
            ticketStatusValueDiv.append(ticketStatusValue);

            eventDetailsDiv.appendChild(ticketStatusDiv);
            eventDetailsDiv.appendChild(ticketStatusValueDiv);
        }
        //Ticket buying URL
        if (data.hasOwnProperty("ticketBuyURL")) {

            let ticketBuyDiv = document.createElement("div");
            let ticketBuyField = document.createTextNode("Buy Ticket At");
            ticketBuyDiv.setAttribute("class", "eventCardFields");
            ticketBuyDiv.appendChild(ticketBuyField);

            let ticketBuy = data["ticketBuyURL"];

            let ticketBuyURL = document.createElement("a");
            ticketBuyURL.setAttribute("href", ticketBuy);
            ticketBuyURL.setAttribute("target", "_blank")

            let ticketBuyURLDiv = document.createElement("div");
            ticketBuyURLDiv.setAttribute("class", "eventCardFieldValue");

            let text = document.createTextNode("Ticketmaster");
            ticketBuyURL.append(text);
            ticketBuyURLDiv.append(ticketBuyURL);

            ticketBuyURL.setAttribute("class", "eventCardURL");
            eventDetailsDiv.appendChild(ticketBuyDiv);
            eventDetailsDiv.appendChild(ticketBuyURLDiv);
        }

        //seatmap
        if (data.hasOwnProperty("seatmap")) {

            let image = document.createElement('img');
            image.style = "max-height:650px; max-width:650px;";
            image.id = "seatmap";
            image.src = data["seatmap"];
            
            eventCardDiv.appendChild(image);
        }


        eventCardDiv.append(eventDetailsDiv);
        if (venueCardResult.style.display = "block") {
            venueCardResult.style.display = "none";
            venueCardResult.innerHTML = "";
        }
        showVenueDetails.style.display = "block";

        downArrow.onclick = function(e) {
            
            venueCardResult.style.display = "block";
            e.preventDefault();
            venueCardResult.scrollIntoView();
            venueCardCreation(venue);
        }
    })

}


function venueCardCreation (venue) {

    fetch(`http://localhost:8080/ticketmaster_venuedetails?venue=${venue}`, {
        method: "GET",
        "headers": {
            'accept': 'application/json'
        }
    }).then((response) => {
        return response.json();
    }).then((data) => {  
        
        venueCardResult.innerHTML = "";
        if (venueCardResult.style.display == "none"){
            venueCardResult.style.display = "block";
        }
        //this div is for the whole card
        let venueCardDiv = document.getElementById("venue-card");
        let line1addDiv;
        let fullAddress = "";
        let addressDiv = document.createElement("div");
        
        addressDiv.setAttribute("class", "addressBlock");

        if (data.hasOwnProperty("name")) {
            let title = document.createTextNode(data["name"]);
            fullAddress += data["name"];

            var h2 = document.createElement("H4");
            h2.setAttribute("id", "venueTitle");
            h2.appendChild(title);
            venueCardDiv.appendChild(h2);            
        }

        let verticalLine = document.createElement("div");
        verticalLine.setAttribute("class", "vl");

        if (data.hasOwnProperty("logo")) {

            let image = document.createElement('img');
            image.id = "venueLogo";
            image.src = data["logo"];
            venueCardDiv.appendChild(image);
        }

        if (data.hasOwnProperty("address")) {

            let addressTextField = document.createElement("b");
            let addressField = document.createTextNode("Address: ");
            addressTextField.appendChild(addressField);
            // addressTextDiv.appendChild(addressField);

            let line1Address = data["address"];

            fullAddress = fullAddress + " " + line1Address;
            
            line1addDiv = document.createElement("div");
            line1addDiv.setAttribute("class", "venueAddressValue");

            let line1add = document.createTextNode(`${line1Address} `);
            line1addDiv.appendChild(addressTextField);
            line1addDiv.appendChild(line1add);
            
        }

        if (data.hasOwnProperty("city")){
            
            let city = data["city"];
            fullAddress = fullAddress + " " + city;
            let br = document.createElement("br");
            let cityValue = document.createTextNode(city);

            line1addDiv.appendChild(br);
            line1addDiv.appendChild(cityValue);
            
        }

        if (data.hasOwnProperty("state")){
            
            let state = ", " + data["state"];

            fullAddress = fullAddress + " " + state;
            let stateValue = document.createTextNode(state);
            line1addDiv.appendChild(stateValue);
        }

        if (data.hasOwnProperty("postalCode")){
            
            let postalCode = data["postalCode"];

            fullAddress = fullAddress + " " + postalCode;
            let postalCodeValue = document.createTextNode(postalCode);
            let br = document.createElement("br");

            line1addDiv.appendChild(br);
            line1addDiv.appendChild(postalCodeValue);
        }
            addressDiv.appendChild(line1addDiv);
            
            venueCardDiv.appendChild(addressDiv);
        
            let gmapsLinkURL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`

            let mapsLinkDiv = document.createElement("div");
            // mapsLinkDiv.setAttribute("class", "addressBlock");
            mapsLinkDiv.id = "mapsLink";
            let gMapsLink = document.createElement("a");
            gMapsLink.setAttribute("class", "mapsURL");
            gMapsLink.setAttribute("href", gmapsLinkURL);
            gMapsLink.setAttribute("target", "_blank");
            
            gMapsLink.text = "Open in Google Maps";
            
            mapsLinkDiv.append(gMapsLink);
            venueCardDiv.appendChild(mapsLinkDiv);



        if (data.hasOwnProperty("logo")) {
            verticalLine.style = "height: 140px;"; 
        }
        else {
            verticalLine.style = "height: 210px;"
        }
        venueCardDiv.append(verticalLine);

        if (data.hasOwnProperty("url")) {

            let moreEventsURL = data["url"];

            let moreEventsLinkDiv = document.createElement("div");
            
            moreEventsLinkDiv.id = "moreEventsLink";
            let moreEventLink = document.createElement("a");
            moreEventLink.setAttribute("class", "moreEventsURL");
            moreEventLink.setAttribute("href", moreEventsURL);
            moreEventLink.setAttribute("target", "_blank");
            
            moreEventLink.text = "More events at this venue";
            
            moreEventsLinkDiv.append(moreEventLink);
            venueCardDiv.appendChild(moreEventsLinkDiv);

        }
        
    })
}
