const request = require('supertest');
const server = require("../server");

describe("Event Search Test", ()=> {

    //dummy values for testing APIs
    const searchTitle = "ed sheeran";
    const lat = "37.7749";
    const long = "-122.4194";
    const category = "Default";
    const distance = "50";


    test("tests ticketmaster_eventsearch endpoint status code is 200", async()=> {
        await request(server).get(`/ticketmaster_eventsearch?lat=${lat}&long=${long}&keyword=${searchTitle}&category=${category}&distance=${distance}`)
        .expect(200)
    });
    test("tests ticketmaster_eventsearch endpoint content type is json", async()=> {
        await request(server).get(`/ticketmaster_eventsearch?lat=${lat}&long=${long}&keyword=${searchTitle}&category=${category}&distance=${distance}`)
        .expect("Content-Type", /json/)
    });
    test("tests ticketmaster_eventsearch endpoint response data length is greater than zero", async()=> {
        const response = await request(server).get(`/ticketmaster_eventsearch?lat=${lat}&long=${long}&keyword=${searchTitle}&category=${category}&distance=${distance}`);
        expect(response.body.data.length).toBeGreaterThan(0);
    });
    test("tests ticketmaster_eventsearch endpoint contains eventId property", async()=> {
        const response = await request(server).get(`/ticketmaster_eventsearch?lat=${lat}&long=${long}&keyword=${searchTitle}&category=${category}&distance=${distance}`);
        let resultsArray = response.body.data;
        for (let eventIndex = 0; eventIndex < resultsArray.length; eventIndex++) {
            expect(resultsArray[eventIndex]).toHaveProperty("eventId");
        }
    });

    //searching for event with name: devanshu
    test("tests ticketmaster_eventsearch endpoint response data length is zero (invalid search)", async()=> {
        const response = await request(server).get(`/ticketmaster_eventsearch?lat=${lat}&long=${long}&keyword=devanshu&category=${category}&distance=${distance}`);
        expect(response.body.data).toHaveLength(0);
    });

});

describe("Event Details Test", ()=> {

    //dummy values for testing APIs
    const eventId = "vvG1IZ9KBiqNAT";

    test("tests ticketmaster_eventdetails endpoint status code is 200", async()=> {
        await request(server).get(`/ticketmaster_eventdetails?eventId=${eventId}`)
        .expect(200)
    });
    test("tests ticketmaster_eventdetails endpoint content type is json", async()=> {
        await request(server).get(`/ticketmaster_eventdetails?eventId=${eventId}`)
        .expect("Content-Type", /json/)
    });
    test("tests ticketmaster_eventsearch endpoint contains artists property", async()=> {
        const response = await request(server).get(`/ticketmaster_eventdetails?eventId=${eventId}`)
        let resultObject = response.body.data;        
        expect(resultObject).toHaveProperty("artists");
    });
    test("tests ticketmaster_eventsearch endpoint artists length greater than zero", async()=> {
        const response = await request(server).get(`/ticketmaster_eventdetails?eventId=${eventId}`)
        let resultObject = response.body.data;        
        expect(resultObject.artists.length).toBeGreaterThan(0);
    });
    test("tests ticketmaster_eventdetails endpoint contains ticketStatus property", async()=> {
        const response = await request(server).get(`/ticketmaster_eventdetails?eventId=${eventId}`)
        expect(response.body.data).toHaveProperty("ticketStatus");
    });
    test("tests ticketmaster_eventdetails endpoint seatmap URL is valid", async()=> {
        const response = await request(server).get(`/ticketmaster_eventdetails?eventId=${eventId}`)
        if (response.body.data.hasOwnProperty("seatmap")) {
            expect(response.body.data.seatmap).toContain('.com');
            expect(response.body.data.seatmap).toContain('http');
        }
    });
    test("tests ticketmaster_eventdetails endpoint ticketBuyURL URL is valid", async()=> {
        const response = await request(server).get(`/ticketmaster_eventdetails?eventId=${eventId}`)
        if (response.body.data.hasOwnProperty("ticketBuyURL")) {
            expect(response.body.data.seatmap).toContain('.com');
            expect(response.body.data.seatmap).toContain('http');
        }
    });
});

describe("Venue Details Test", ()=> {

    //dummy values for testing APIs
    const venueName = "Crypto.com Arena";

    test("tests ticketmaster_venuedetails endpoint status code is 200", async()=> {
        await request(server).get(`/ticketmaster_venuedetails?venue=${venueName}`)
        .expect(200)
    });
    test("tests ticketmaster_venuedetails endpoint content type is json", async()=> {
        await request(server).get(`/ticketmaster_venuedetails?venue=${venueName}`)
        .expect("Content-Type", /json/)
    });
    test("tests ticketmaster_venuedetails endpoint contains name property", async()=> {
        const response = await request(server).get(`/ticketmaster_venuedetails?venue=${venueName}`)
        let resultObject = response.body.data;        
        expect(resultObject).toHaveProperty("name");
    });
    test("tests ticketmaster_venuedetails endpoint url URL is valid", async()=> {
        const response = await request(server).get(`/ticketmaster_venuedetails?venue=${venueName}`)
        if (response.body.data.hasOwnProperty("url")) {
            expect(response.body.data.url).toContain('.com');
            expect(response.body.data.url).toContain('http');
        }
    });
    test("tests ticketmaster_eventdetails endpoint logo URL is valid", async()=> {
        const response = await request(server).get(`/ticketmaster_venuedetails?venue=${venueName}`)
        if (response.body.data.hasOwnProperty("logo")) {
            expect(response.body.data.logo).toContain('.jpg');
            expect(response.body.data.logo).toContain('http');
        }
    });
});

