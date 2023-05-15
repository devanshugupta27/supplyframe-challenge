const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");
const geohash = require("ngeohash");
const ejs = require("ejs");
const path = require('path');

const PORT = 8080 || process.env.PORT;
const app=  express();

app.use(bodyParser.json());
app.use(cors());

// Setup ejs engine and views location
app.set('view engine', 'ejs')
app.use(express.static('app'));


const API_KEY='CcjeWAmoKRWnQKHlkdFCOsoJTXvZedLe';

let segmentDict = {
    'music': 'KZFzniwnSyZfZ7v7nJ',
    'sports': 'KZFzniwnSyZfZ7v7nE',
    'arts & theatre': 'KZFzniwnSyZfZ7v7na',
    'film': 'KZFzniwnSyZfZ7v7nn',
    'miscellaneous': 'KZFzniwnSyZfZ7v7n1',
    'default':''
}

app.get('/', (req, res) => {
    res.render("pages/index");
});

app.get('/ticketmaster_eventsearch', (req, res) => {
    
    let lat = req.query.lat;
    let long = req.query.long;
    let keyword = req.query.keyword;
    let category = req.query.category;
    let distance = req.query.distance;

    let hash = geohash.encode(lat, long, precision = 7);

    let segmentId = segmentDict[category.toLowerCase()];

    let eventsJSONArray = {"data":[]};
    
    let url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${API_KEY}&keyword=${keyword}&segmentId=${segmentId}&radius=${distance}&unit=miles&geoPoint=${hash}&size=50`
    axios.get(url)
        .then((response) => {
            let resultDict = response.data;

            if (resultDict.hasOwnProperty("_embedded")) {
                if (resultDict["_embedded"].hasOwnProperty("events")) {
                    if (resultDict["_embedded"]['events'].length > 0) {
                        let eventsLen = Math.min(22, resultDict["_embedded"]['events'].length);

                        for (let eventIndex = 0; eventIndex < eventsLen; eventIndex++) {
                            let eventJSON = {
                                "date": "",
                                "time":"",
                                "icon":"",
                                "eventName": "",
                                "genre":"",
                                "venue":"",
                                "eventId":""
                            }

                            let event = resultDict["_embedded"]['events'][eventIndex];
                            if (event.hasOwnProperty("dates")) {
                                if (event["dates"].hasOwnProperty("start")) {
                                    if (event['dates']['start'].hasOwnProperty("localDate")) {
                                        eventJSON['date'] = event['dates']['start']['localDate'];
                                    }
                                    if (event['dates']['start'].hasOwnProperty("localTime")) {
                                        eventJSON['time'] = event['dates']['start']['localTime'];
                                    }
                                }
                            }
                            if (event.hasOwnProperty("images")) {
                                if (event["images"].length > 0) {
                                    if (event['images'][0].hasOwnProperty("url")) {
                                        eventJSON['icon'] = event['images'][0]['url'];
                                    }
                                }
                            }
                            
                            if (event.hasOwnProperty("name")) {
                                eventJSON['eventName'] = event['name']
                            }
                                
                            if (event.hasOwnProperty("classifications")) {
                                if (event['classifications'].length > 0) {
                                    if (event['classifications'][0].hasOwnProperty("segment")){
                                        if (event['classifications'][0]['segment'].hasOwnProperty("name")) {
                                            if (event['classifications'][0]['segment']["name"].toLowerCase() != "undefined") {
                                                
                                                eventJSON['genre'] = event['classifications'][0]['segment']['name'];
                                            }
                                        }
                                    }
                                }
                            }

                            if (event.hasOwnProperty("_embedded")) {
                                if (event['_embedded'].hasOwnProperty("venues")) {
                                    if (event['_embedded']['venues'].length > 0) {
                                        if (event['_embedded']['venues'][0].hasOwnProperty("name")) {
                                            eventJSON['venue'] = event['_embedded']['venues'][0]['name'];
                                        }
                                    }
                                }
                            }

                            if (event.hasOwnProperty("id")) {
                                eventJSON['eventId'] = event['id']
                            }

                            eventsJSONArray['data'].push(eventJSON);
                        }
                    }
                }
            }    
        })
        .catch((error)=> {
            eventsJSONArray ['data'][0] = error;
        })
        .finally(()=> {
            res.send(eventsJSONArray)});
            
        })

app.get('/ticketmaster_eventdetails', (req, res) => {

    let eventId = req.query.eventId;

    let eventJSON = {"data": {"eventId": eventId}};

    let url = `https://app.ticketmaster.com/discovery/v2/events/${eventId}?apikey=${API_KEY}`

    axios.get(url)
        .then((response) => {
            let resultDict = response.data;
            
            //name
            if (resultDict.hasOwnProperty("name")) {
                eventJSON["data"]['name'] = resultDict['name'];
            }
            //date and time
            if (resultDict.hasOwnProperty("dates")) {
                 if (resultDict['dates'].hasOwnProperty("start")) {
                    if (resultDict['dates']['start'].hasOwnProperty("localDate")) {
                        eventJSON["data"]['date'] = resultDict['dates']['start']['localDate'];
                    }
                    if (resultDict['dates']['start'].hasOwnProperty("localTime")) {
                        eventJSON["data"]['time'] = resultDict['dates']['start']['localTime'];
                    }
                 }
            }
            //artist
            if (resultDict.hasOwnProperty("_embedded")) {
                if (resultDict['_embedded'].hasOwnProperty("attractions")) {
                    let artistsList = [];
                    let musicArtistsList = [];
                    if (resultDict['_embedded']['attractions'].length > 0) {
                        for (let i = 0; i < resultDict['_embedded']['attractions'].length; i++) {
                            if (resultDict['_embedded']['attractions'][i].hasOwnProperty("name")) {
                                if (resultDict['_embedded']['attractions'][i].hasOwnProperty("url")) {
                                    artistsList.push({
                                        "name": resultDict['_embedded']['attractions'][i]["name"],
                                        "url":  resultDict['_embedded']['attractions'][i]["url"]
                                    })
                                }
                                else {
                                    artistsList.push({
                                        "name": resultDict['_embedded']['attractions'][i]["name"]
                                    })
                                }

                                //searching for music artists names...
                                if (resultDict['_embedded']['attractions'][i].hasOwnProperty("classifications")) {
                                    if (resultDict['_embedded']['attractions'][i]["classifications"].length > 0) {
                                        if (resultDict['_embedded']['attractions'][i]["classifications"][0].hasOwnProperty("segment")) {
                                            if (resultDict['_embedded']['attractions'][i]["classifications"][0]["segment"].hasOwnProperty("name")) {
                                                if (resultDict['_embedded']['attractions'][i]["classifications"][0]["segment"]["name"] == "Music") {
                                                    musicArtistsList.push(resultDict['_embedded']['attractions'][i]["name"]);
                                                }
                                                
                                            }   
                                        }   
                                    }
                                }

                            }
                        }
                        eventJSON["data"]["artists"] = artistsList;
                        eventJSON["data"]["musicArtists"] = musicArtistsList;
                    }
                }

                //venue
                if (resultDict['_embedded'].hasOwnProperty("venues")){
                    if (resultDict['_embedded']['venues'].length > 0) {
                        if (resultDict['_embedded']['venues'][0].hasOwnProperty("name")){
                            eventJSON["data"]["venue"] = resultDict['_embedded']['venues'][0]['name']
                        }
                    }
                }
            }

            //genre
            if (resultDict.hasOwnProperty("classifications")) {
                if (resultDict['classifications'].length > 0) {
                    let genres = [];
                    let classificationList = resultDict['classifications'][0];

                    if (classificationList.hasOwnProperty("segment")) {
                        if (classificationList['segment'].hasOwnProperty("name")) {
                            if (classificationList['segment']['name'].toLowerCase() != "undefined") {
                                genres.push(classificationList['segment']['name']);
                            }
                        }
                    }

                    if (classificationList.hasOwnProperty("genre")) {
                        if (classificationList['genre'].hasOwnProperty("name")){
                            if (classificationList['genre']['name'].toLowerCase() != "undefined") {
                                genres.push(classificationList['genre']['name']);
                            }

                        }
                    }
                    
                    if (classificationList.hasOwnProperty("subGenre")) {
                        if (classificationList['subGenre'].hasOwnProperty("name")){
                            if (classificationList['subGenre']['name'].toLowerCase() != "undefined") {
                                genres.push(classificationList['subGenre']['name']);
                            }

                        }
                    }

                    if (classificationList.hasOwnProperty("type")) {
                        if (classificationList['type'].hasOwnProperty("name")){
                            if (classificationList['type']['name'].toLowerCase() != "undefined") {
                                genres.push(classificationList['type']['name']);
                            }

                        }
                    }

                    if (classificationList.hasOwnProperty("subType")) {
                        if (classificationList['subType'].hasOwnProperty("name")){
                            if (classificationList['subType']['name'].toLowerCase() != "undefined") {
                                genres.push(classificationList['subType']['name']);
                            }

                        }
                    }
                    eventJSON["data"]['genres'] = genres;
                }
            }
            
            //price
            if (resultDict.hasOwnProperty("priceRanges")) {
                if (resultDict['priceRanges'].length > 0) {
                    let price = {};

                    if (resultDict['priceRanges'][0].hasOwnProperty("min")) {
                        price["min"] = resultDict['priceRanges'][0]["min"];
                    }
                    if (resultDict['priceRanges'][0].hasOwnProperty("max")) {
                        price["max"] = resultDict['priceRanges'][0]["max"];
                    }
                    
                    eventJSON["data"]["price"] = price;
                }
            }
            
            //ticket status
            if (resultDict.hasOwnProperty("dates")) {
                if (resultDict["dates"].hasOwnProperty("status")){
                    if (resultDict["dates"]["status"].hasOwnProperty("code")) {
                        eventJSON["data"]['ticketStatus'] = resultDict['dates']['status']['code'];
                    }
                }
            }
            
            //buy ticket at
            if (resultDict.hasOwnProperty("url")){
                eventJSON["data"]['ticketBuyURL'] = resultDict['url'];
            } 
                        
            //seat map
            if (resultDict.hasOwnProperty("seatmap")) {
                if (resultDict['seatmap'].hasOwnProperty("staticUrl")) {
                    eventJSON["data"]['seatmap'] = resultDict['seatmap']['staticUrl'];
                }
            }
        })
        .catch((err) => {
            eventJSON["data"] = err;
        })
        .finally(()=> {
            res.send(eventJSON);
        })
})
app.get('/ticketmaster_venuedetails', (req, res) =>{

    let venue = req.query.venue;
    let venueJSON = {"data": {}};
    let url = `https://app.ticketmaster.com/discovery/v2/venues.json?apikey=${API_KEY}&keyword=${venue}`;


    axios.get(url)
    .then((response) => {
        let resultDict = response.data;
        if (resultDict.hasOwnProperty("_embedded")){
            if (resultDict["_embedded"].hasOwnProperty("venues")) {
                if (resultDict["_embedded"]["venues"].length > 0) {

                    for (let venueIndex = 0; venueIndex < resultDict["_embedded"]["venues"].length; venueIndex++) {
                        if (resultDict["_embedded"]["venues"][venueIndex].hasOwnProperty("name")){
                            if (resultDict["_embedded"]["venues"][venueIndex]["name"].toLowerCase() == venue.toLowerCase()) {
                                //found the venue

                                venueJSON["data"]["name"] = resultDict["_embedded"]["venues"][venueIndex]["name"];

                                if (resultDict["_embedded"]["venues"][venueIndex].hasOwnProperty("address")){
                                    if (resultDict["_embedded"]["venues"][venueIndex]["address"].hasOwnProperty("line1")){
                                        venueJSON["data"]["address"] = resultDict["_embedded"]["venues"][venueIndex]["address"]["line1"];
                                    }
                                }
                                let location;
                                let city = '';
                                let state = '';
                                if (resultDict["_embedded"]["venues"][venueIndex].hasOwnProperty("city")){
                                    if (resultDict["_embedded"]["venues"][venueIndex]["city"].hasOwnProperty("name")){
                                        city = resultDict["_embedded"]["venues"][venueIndex]["city"]["name"];
                                    }
                                }
                                if (resultDict["_embedded"]["venues"][venueIndex].hasOwnProperty("state")){
                                    if (resultDict["_embedded"]["venues"][venueIndex]["state"].hasOwnProperty("name")){
                                        state = resultDict["_embedded"]["venues"][venueIndex]["state"]["name"];
                                    }
                                }
                                if (city != '') {
                                    location = city;
                                    if (state != '') {
                                        location += ", " + state;
                                    }
                                }
                                else {
                                    if (state != '') {
                                        location = state;
                                    }
                                }

                                venueJSON["data"]["location"] = location;

                                if (resultDict["_embedded"]["venues"][venueIndex].hasOwnProperty("boxOfficeInfo")){
                                    if (resultDict["_embedded"]["venues"][venueIndex]["boxOfficeInfo"].hasOwnProperty("phoneNumberDetail")){
                                        venueJSON["data"]["phoneNum"] = resultDict["_embedded"]["venues"][venueIndex]["boxOfficeInfo"]["phoneNumberDetail"];
                                    }
                                    if (resultDict["_embedded"]["venues"][venueIndex]["boxOfficeInfo"].hasOwnProperty("openHoursDetail")){
                                        venueJSON["data"]["openHrDetails"] = resultDict["_embedded"]["venues"][venueIndex]["boxOfficeInfo"]["openHoursDetail"];
                                    }
                                }

                                if (resultDict["_embedded"]["venues"][venueIndex].hasOwnProperty("generalInfo")){
                                    if (resultDict["_embedded"]["venues"][venueIndex]["generalInfo"].hasOwnProperty("generalRule")){
                                        venueJSON["data"]["generalRule"] = resultDict["_embedded"]["venues"][venueIndex]["generalInfo"]["generalRule"];
                                    }
                                    if (resultDict["_embedded"]["venues"][venueIndex]["generalInfo"].hasOwnProperty("childRule")){
                                        venueJSON["data"]["childRule"] = resultDict["_embedded"]["venues"][venueIndex]["generalInfo"]["childRule"];
                                    }
                                }

                            }
                        }
                    }
                }
            }
        }
    })
    .catch((err) => {
        venueJSON["data"] = err;
    })
    .finally(()=> {
        res.send(venueJSON);
    })
});

app.listen(PORT, ()=> {
    console.log(`Listening on port ${PORT}`);
})