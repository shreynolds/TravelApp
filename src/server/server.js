let projectData = {}
// Require Express to run server and routes
const express = require('express');
// Start up an instance of app
const app = express();

/* Middleware*/
//Here we are configuring express to use body-parser as middle-ware.
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Cors for cross origin allowance
const cors = require('cors');
app.use(cors());

const mockAPIResponse = require('./mockAPI.js')

const fetch = require("node-fetch");


app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
  });

// Initialize the main project folder
app.use(express.static('dist'));


//Get Route that returns the project data
app.get('/all', send);

//Function for the Get Route -- sending projectData
function send (req, res) {
    res.send(projectData);
};

app.get('/',function (req,res) {
    res.status(200).sendFile('dist/index.html');
});

//Post Route that adds the incoming weather data to projectData
app.post('/addWeather', addWeatherData)

function addWeatherData(req, res){
    let data = req.body
    projectData['temp'] = data.temp
    projectData['weather'] = data.weather
    res.send({message: "POST received"});
}


//Post Route that adds the incoming Place data to projectData
app.post('/addPlace', addPlaceData);

//Function for the Post Route -- adding the data to projectData
function addPlaceData(req, res){
    let data = req.body;
	projectData["lat"] = data.lat;
	projectData["long"] = data.long;
    projectData["country"] = data.country;
    projectData["city"] = data.city
    res.send({message: "POST received"});
}

//Post Route that adds the incoming date data to projectData
app.post('/addDate', addDateData);

function addDateData(req, res){
    let data = req.body;
	projectData["today"] = data.today;
    projectData["tripDate"] = data.trip;
    projectData["countdown"] = data.countdown
    res.send({message: "POST received"});
}

//Post Route that adds the incoming image data to projectData
app.post('/addImage', addImageData);

function addImageData(req, res){
    let data = req.body;
    projectData['imageURL'] = data.imageURL
    res.send({message: "POST received"});
}

//Post Route that adds the incoming counry data to projectData
app.post('/addCountryInfo', addCountryData);

function addCountryData(req, res){
    let data = req.body;
    projectData['countryName'] = data.name
    projectData['population'] = data.population
    projectData['capital'] = data.capital
    projectData['language'] = data.language
    projectData['currency'] = data.currency
    res.send({message: "POST received"});
}

// Setup Server
const port = 3000;
const server = app.listen(port, ()=>{
    console.log(`server running on port ${port}`);
});

module.exports = app
