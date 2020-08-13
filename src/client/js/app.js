/* Global Variables */
const geonamesLink = 'http://api.geonames.org/postalCodeSearchJSON?placename='
const geonamesKey = '&username=shreynolds'

const weatherbitForecastLink = 'https://api.weatherbit.io/v2.0/forecast/daily?units=I&'
const weaterbitHistoryLink = 'http://api.weatherbit.io/v2.0/history/daily?units=I&'
const weatherbitKey = '&key=0a157980943c4c6f97abaa81a20a174d'

const pixabayLink = 'https://pixabay.com/api/?image_type=photo&q='
const pixabayKey = '&key=17847818-c70cb11e4c9b27cb2b0bbea36'


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
    .then(getPhoto)
    .then(retreiveData) 
    .then(function(){
        placeElement.value = "";
        dateElement.value = "";
    })
}

const getPhoto = async()=>{
    console.log("in get photo")
    const url = "http://localhost:3000/all";
    const request = await fetch(url);
    try{
        const data = await(request.json())
        let place = data.city
        place = place.replace(' ', '+')
        console.log(place)
        let url2 = pixabayLink + place + pixabayKey
        const result = await fetch(url2)
        try{
            const photos = await result.json()
            console.log(photos)
            let photoURL = ""
            if (photos.hits.length != 0)
            {
                photoURL = photos.hits[0].webformatURL
            }
            else{
                photoURL = "NA"
            }
            postData('http://localhost:3000/addImage', {imageURL: photoURL})
                
        }
        catch (error){
            console.log("error", error)
        }
    }
    catch(error){
        console.log('error', error)
    }
}

const getWeatherInfo = async() =>{
    const url = "http://localhost:3000/all";
    const request = await fetch(url);
    try{
        const allData = await request.json();
        let difference = allData.countdown
        const lat = allData.lat
        const long = allData.long
        let url = ""
        if (difference < 16){
            url = weatherbitForecastLink + 'lat=' + lat + '&lon=' + long + weatherbitKey;
        }
        else{
            const date = new Date(allData.tripDate)
            let year = '2019-'
            if (difference < 0){
                year = date.getFullYear() + "-"
            }
            const startDate = '2019-' + (date.getMonth()+ 1) + '-' + date.getDate()
            console.log(startDate)
            date.setDate(date.getDate() + 1)
            const endDate = '2019-' + (date.getMonth() + 1) + '-' + date.getDate()
            console.log(endDate)
            url = '/weather'
            url = weaterbitHistoryLink + 'start_date=' + startDate + '&end_date=' + endDate + '&lat=' + lat + '&lon=' + long + weatherbitKey;
        }
        console.log(url)
        const res = await fetch(url, {
            headers: {
                'Access-Control-Allow-Origin': '*'
            }
        })
        try{
            const dat = await res.json();
            console.log(dat);
            let description = ""
            console.log(difference)
            if (difference < 0 || difference > 15){
                console.log("IN")
                difference = 0
            }
            console.log(difference)
            const weatherDay = dat.data[difference]
            console.log(weatherDay)
            try {
                description = weatherDay.weather.description
            }
            catch{
                description = "NA"
            }
            postData('http://localhost:3000/addWeather', {temp: weatherDay.temp, weather: description})
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
    postData('http://localhost:3000/addDate', {today: todayDate, trip: tripDate, countdown: difference})
}

function postPlaceData(data, city){
    console.log(data)
    let lat = data.postalCodes[0].lat
    let long = data.postalCodes[0].lng
    let country = data.postalCodes[0].countryCode
    console.log(country)
    postData('http://localhost:3000/addPlace', {lat:lat, long:long, country:country, city: city})
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
    const url = "http://localhost:3000/all";
    const request = await fetch(url);
    try{
        const allData = await request.json();
        console.log(allData)
        document.getElementById('location').innerHTML = "Destination: " + allData.city;
        let trip = new Date(allData.tripDate)
        document.getElementById('departure').innerHTML = "Departure Date: " + trip.toDateString();
        let count = allData.countdown
        let countString = ""
        let weatherString = ""
        if (count == 0) {
            countString = "You leave today!"
            weatherString = "Today's weather is " + allData.weather + ", with an average temp of " + allData.temp + "°F"
        }
        else if (count > 0 && count < 16) {
            countString = count + " more days until you leave!"
            weatherString = "The forecasted weather for your first day is " + allData.weather + ", with an average temp of " + allData.temp + "°F"
        }
        else if (count >= 16) {
            countString = count + " more days until you leave!"
            weatherString = "The predicted average temp for your first day is " + allData.temp + "°F"
        }
        else {
            countString = "This trip is in the past!"
            weatherString = "The average temp was " + allData.temp + "°F"
        }
        console.log("here!!")
        document.getElementById('countdown').innerHTML = countString
        document.getElementById('weather').innerHTML = weatherString 
        let imageURL = allData.imageURL
        console.log(imageURL)
        if (imageURL != "NA"){
            document.getElementById('cityimg').src=imageURL
        }
        const text = document.getElementById('entry')
        console.log(text.classList)
        text.classList.remove('hidden')
        console.log(text.classList)
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

export {whenClick, kelvinToFarenheit, getPlaceInfo, retreiveData, postData, postPlaceData, getDateInfo, getWeatherInfo, getPhoto}