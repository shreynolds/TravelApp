projectData = {}
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

// Initialize the main project folder
app.use(express.static('dist'));


//Get Route that returns the project data
app.get('/all', send);

//Function for the Get Route -- sending projectData
function send (req, res) {
    res.send(projectData);
};

//Post Route that adds the incoming data to projectData
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

app.post('/addDate', addDateData);

function addDateData(req, res){
    let data = req.body;
	projectData["today"] = data.today;
    projectData["tripDate"] = data.trip;
    projectData["countdown"] = data.countdown
    res.send({message: "POST received"});
}

// Setup Server
const port = 3000;
const server = app.listen(port, ()=>{
    console.log(`server running on port ${port}`);
});
