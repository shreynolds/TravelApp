/* Global Variables */
const link = 'http://api.openweathermap.org/data/2.5/weather?zip='
const key = '&appid=0d002347fe543ee21f35b26cc949411c'

// Create a new date instance dynamically with JS
let d = new Date();
let newDate = d.getMonth()+'.'+ d.getDate()+'.'+ d.getFullYear();

//Global Elements: the DOM Elements of the button and the input values
let generate = document.getElementById('generate');
let zipElement = document.getElementById('zip');
let userElement = document.getElementById('feelings');

//Adding an event listener for clicking the button
generate.addEventListener('click', whenClick);

function whenClick(){
    zip = zipElement.value;
    getWeather(link, zip, key).then(function(data){
        tempF = kelvinToFarenheit(data.main.temp);
        userFeelings = userElement.value;
        postData('/add', {temp:tempF, date:newDate, feelings:userFeelings}).then(function(){
            retreiveData();
        }) 
    }).then(function(){
        zipElement.value = "";
        userElement.value = "";
    })
}
    

//Converts Kelvin to Farenheit
function kelvinToFarenheit(tempK){
    tempF = (tempK - 273.15) * 9/5 + 32;
    return Math.round(tempF);
}

//Makes an async call to the openWeaterMap API to get the weather based on the zip
const getWeather = async(link, zip, key) =>{
    const url = link+zip+key;
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
    url = "/all";
    const request = await fetch(url);
    try{
        const allData = await request.json();
        document.getElementById('temp').innerHTML = "Temperature: " + Math.round(allData.temp)+ ' degrees';
        document.getElementById('content').innerHTML = "Feelings: " + allData.feel;
        document.getElementById("date").innerHTML = "Date: " + allData.date;
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

export {whenClick, kelvinToFarenheit, getWeather, retreiveData, postData}