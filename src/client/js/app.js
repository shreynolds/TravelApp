/* Global Variables */
const geonamesLink = 'http://api.geonames.org/postalCodeSearchJSON?placename='
const geonamesKey = '&username=shreynolds'

const weatherbitForecastLink = 'https://api.weatherbit.io/v2.0/forecast/daily?units=I&'
const weaterbitHistoryLink = 'http://api.weatherbit.io/v2.0/history/daily?units=I&'
const weatherbitKey = '&key=0a157980943c4c6f97abaa81a20a174d'

const pixabayLink = 'https://pixabay.com/api/?image_type=photo&q='
const pixabayKey = '&key=17847818-c70cb11e4c9b27cb2b0bbea36'

const restCountriesLink = 'https://restcountries.eu/rest/v2/alpha/'


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
    .then(getCountryInfo)
    .then(getPhoto)
    .then(retreiveData) 
    .then(function(){
        placeElement.value = "";
        dateElement.value = "";
    })
}

const getCountryInfo = async() =>{
    const url = "http://localhost:3000/all";
    const request = await fetch(url);
    try{
        const data = await (request.json())
        const country = data.country
        const url = restCountriesLink + country
        const result = await fetch(url)
        try{
            const countryInfo = await(result.json())
            const countryName = countryInfo.name
            const capital = countryInfo.capital
            const population = countryInfo.population
            const language = countryInfo.languages[0].name
            const currency = countryInfo.currencies[0].name
            postData('http://localhost:3000/addCountryInfo', {name: countryName, capital:capital, population:population, language:language, currency:currency})
        }
        catch (e){
            console.log("error", e)
        }
    }
    catch (error) {
        console.log("error", error)
    }
}

const getPhoto = async()=>{
    const url = "http://localhost:3000/all";
    const request = await fetch(url);
    try{
        const data = await(request.json())
        let place = data.city
        place = place.replace(' ', '+')
        let url2 = pixabayLink + place + pixabayKey
        const result = await fetch(url2)
        try{
            const photos = await result.json()
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
            date.setDate(date.getDate() + 1)
            const endDate = '2019-' + (date.getMonth() + 1) + '-' + date.getDate()
            url = '/weather'
            url = weaterbitHistoryLink + 'start_date=' + startDate + '&end_date=' + endDate + '&lat=' + lat + '&lon=' + long + weatherbitKey;
        }
        const res = await fetch(url, {
            headers: {
                'Access-Control-Allow-Origin': '*'
            }
        })
        try{
            const dat = await res.json();
            let description = ""
            if (difference < 0 || difference > 15){
                difference = 0
            }
            const weatherDay = dat.data[difference]
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
    let tripDate = new Date(dateString);
    tripDate.setHours(todayDate.getHours())
    tripDate.setMinutes(todayDate.getMinutes())
    tripDate.setMilliseconds(todayDate.getMilliseconds())
    let difference = Math.round((tripDate - todayDate)/86400000)
    postData('http://localhost:3000/addDate', {today: todayDate, trip: tripDate, countdown: difference})
}

function postPlaceData(data, city){
    let lat = data.postalCodes[0].lat
    let long = data.postalCodes[0].lng
    let country = data.postalCodes[0].countryCode
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
        document.getElementById('location').innerHTML = "<b>Destination: </b>" + allData.city;
        let trip = new Date(allData.tripDate)
        document.getElementById('departure').innerHTML = "<b>Departure Date:</b> " + trip.toDateString();
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
        document.getElementById('countdown').innerHTML = countString
        document.getElementById('weather').innerHTML = weatherString 
        let imageURL = allData.imageURL
        if (imageURL != "NA"){
            document.getElementById('cityimg').src=imageURL
        }
        const countryInfo = document.getElementById('countryInfo')
        countryInfo.innerHTML = "<br> <b> Info About " + allData.countryName + "</b> <br> <b>Capital: </b>" + allData.capital + "<br> <b>Population: </b>" + allData.population +
         "<br> <b>Primary Language: </b>" + allData.language + "<br> <b>Primary Currency: </b>" + allData.currency
        const text = document.getElementById('entry')
        text.classList.remove('hidden')
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