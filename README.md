# Supplyframe Full Stack Engineer Internship Challenge

**_Note: This app has been built keeping using Google Chrome Browser. Each browser can render elements differently. Please launch the app in Google Chrome for best experience._**

## Installation

### Please follow the below steps for installation:

<code> npm i</code>

For the next part, please enter the following command once installation is complete,
<code> npm start</code>

Navigate to Google Chrome and launch http://localhost:8080

## Usage

Hello everyone,

Welcome you all to the demo of SupplyFrame Event Search App using TicketMasterAPI.

Our app helps users to find details about the different events happening around them. To start, please navigate to the Search Page of the app (<code>/search</code>).

### Event Search

1. For starting search, enter the name with which you want to search, choose category (or can be left Default), enter the distance within which radius you want to search the event.
2. Lastly, we need to provide the location. Location can be provided either as an input or the user can choose to find the event based on his current location. The current location information is fetched using IP INFO API.
3. After requesting, a list of events will be populated. If the request results in more than 10 entries, only the first 10 will be shown. The user can navigate across the entries using the Previous/Next Button.
4. If the search does not return any event, an appropriate message will be shown.

### Event Details

1. From the lists of events populated, the user can click on any name of any event to fetch more information about the specific event.
2. With this, an event card containing the various information (as available with TicketMaster) is generated.
3. The user can choose to mark any event as their favorite by clicking the heart icon next to the event name. Also, if the event has already been marked as favorite, the user can click on the favorite icon to remove the selected event from favorites list.
4. If the user is interested in buying the ticket for the selected event, they can visit the Official TicketMaster URL for the event.

### Venue Details

1. If the user wishes to find more information about the venue like venue address, or more events scheduled at this venue, he can do that by pressing the down arrow (beneath Show venue details).
2. The user can find the event on Google Maps and can also see the list of events happening on this location.

### Favorites List

To view favorites, please navigate to the Favorites Page of the app (<code>/favorites</code>).

1. The events that the user chose to mark as their favorites will appear here. When the user launches the app for the first time, the list would be empty.
2. This information will be retained even if the user closes the Tab or shutting down browser.
3. Each event will have basic information like Date, Venue, Genre for the selected events.
4. The user can also empty out their favorites list by clicking the Trash Icon.

## Test

A couple of Backend Test has been defined in the tests folder. To start the tests, please run the following command inside root folder to Terminal:

<code> npm test</code>

# Thank You!

Thank you! I hope you liked the app.
