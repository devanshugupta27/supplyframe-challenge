const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");

const PORT = 8080 || process.env.PORT;
const app=  express();

app.use(bodyParser.json());
app.use(cors());

app.listen(PORT, ()=> {
    console.log(`Listening on port ${PORT}`);
})