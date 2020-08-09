/* Global Variables */
const geonamesLink = 'http://api.geonames.org/postalCodeSearchJSON?placename='
const geonamesKey = '&username=shreynolds'

const weatherbitCurrentLink = 'https://api.weatherbit.io/v2.0/current?'
const weatherbitKey = '&key=0a157980943c4c6f97abaa81a20a174d'



function whenClick(){
    let placeElement = document.getElementById('place');
    let dateElement = document.getElementById('date');
    let place = placeElement.value;
    getPlaceInfo(geonamesLink, place, geonamesKey)
    .then(function(data){
        postPlaceData(data, place)
    })
    .then(getDateInfo)
    .then(getWeatherInfo)
    .then(function(){
            retreiveData();
        }) 
    .then(function(){
        placeElement.value = "";
        dateElement.value = "";
    })
}

const getWeatherInfo = async() =>{
    const url = "/all";
    const request = await fetch(url);
    try{
        const allData = await request.json();
        const tripDate = allData.tripDate
        const todayDate = allData.today
        const difference = allData.countdown
        const lat = allData.lat
        const long = allData.long
        let url = ""
        if (difference == 0){
            console.log("in if")
            url = weatherbitCurrentLink + 'lat=' + lat + '&lon=' + long + weatherbitKey;
        }
        console.log(url)
        const result = await fetch(url);
        try{
            const data = await result.json();
            console.log(data)

        } catch (error) {
        console.log("error", error);
        }
    } catch(error) {
        console.log("error", error);
    }
}

function getDateInfo(){
    let dateElement = document.getElementById('date');
    let dateString = dateElement.value + "T00:00:00"
    let todayDate = new Date();
    console.log(todayDate)
    let tripDate = new Date(dateString);
    tripDate.setHours(todayDate.getHours())
    tripDate.setMinutes(todayDate.getMinutes())
    tripDate.setMilliseconds(todayDate.getMilliseconds())
    let difference = Math.round((tripDate - todayDate)/86400000)
    postData('/addDate', {today: todayDate, trip: tripDate, countdown: difference})
}

function postPlaceData(data, city){
    console.log(data)
    let lat = data.postalCodes[0].lat
    let long = data.postalCodes[0].lng
    let country = data.postalCodes[0].countryCode
    console.log(country)
    postData('/addPlace', {lat:lat, long:long, country:country, city: city})
}

//Converts Kelvin to Farenheit
function kelvinToFarenheit(tempK){
    return Math.round((tempK - 273.15) * 9/5 + 32);
}

//Makes an async call to the openWeaterMap API to get the weather based on the zip
const getPlaceInfo = async(link, place, key) =>{
    place = place.replace(' ', '%20')
    const url = link+place+key;
    console.log(url)
    const result = await fetch(url);
    try{
        const data = await result.json();
        return data;
    } catch (error) {
        console.log("error", error);
    }
}

//Makes a get request to the server side to get the data and add it to the
//front-end view
const retreiveData = async()=>{
    const url = "/all";
    const request = await fetch(url);
    try{
        const allData = await request.json();
        document.getElementById('location').innerHTML = "Destination: " + allData.city;
        document.getElementById('departure').innerHTML = "Departure Date: " + allData.tripDate;
        document.getElementById('countdown').innerHTML = allData.countdown + " more days!"
        //document.getElementById('weather')
    } catch(error) {
        console.log("error", error);
    }
};

//Makes a post request to the server side to add the recently entered data 
//to the server side
const postData = async (url = '', data = {}) =>{
    const response = await fetch(url, {
    method: 'POST', 
    credentials: 'same-origin', 
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    body: JSON.stringify(data),   
  });

    try {
      const newData = await response.json();
    } 
    catch(error) {
    console.log("error", error);
    }
};

export {whenClick, kelvinToFarenheit, getPlaceInfo, retreiveData, postData, postPlaceData, getDateInfo, getWeatherInfo}