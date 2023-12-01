function callDataPointAPI() {

    const xhr = new XMLHttpRequest();
    //EXAMPLE 3 HOURLY 5 DAY FORECAST
    //const url = "http://datapoint.metoffice.gov.uk/public/data/val/wxfcs/all/json/3840?res=3hourly&key=";
    //GET ALL SITES IN JSON FORMAT
    //const url = "http://datapoint.metoffice.gov.uk/public/data/val/wxfcs/all/json/sitelist?key";
    //GET 3-HOURLY 5 DAY FORECAST FOR YORK
    const url = "http://datapoint.metoffice.gov.uk/public/data/val/wxfcs/all/json/310169?res=3hourly&key";


    xhr.open("GET", url);
    xhr.send();

    xhr.onload = function() {
        //alert(`Loaded: ${xhr.status} ${xhr.response}`);
        const response = xhr.response;
        //console.log(response);

        //output the Rep value for the current weather information
        responseObject = JSON.parse(response);
        const current = responseObject["SiteRep"]["DV"]["Location"]["Period"][0]["Rep"][0];
        //console.log(current);

        evaluateDataPoint(current);

      };
      
      xhr.onerror = function() { // only triggers if the request couldn't be made at all
        alert(`Network Error`);
      };

}

//takes a Rep object as input and evaluates each metric and gives it a green/amber/red rating
function evaluateDataPoint(rep) {

  const weatherType = rep["W"];

  const speed = {
    data: parseInt(rep["S"]),
    red: 35,
    amber: 24,
    green: 0
  }

  const gust = {
    data: parseInt(rep["G"]),
    red: 40,
    amber: 30,
    green: 0
  }

  const temp = {
    data: parseInt(rep["F"]),
    redHigh: 40,
    redLow: -8,
    amberHigh: 30,
    amberLow: -6, //must specifically check for -7 and -8c as some boats CAN go out
    green: 0
  }

  const rain = {
    data: weatherType.toString(),
    red: "13",
    amber: "12"
  }

  const snow = {
    data: weatherType.toString(),
    red: "27",
    amber: "24"
  }

  const electricalStorms = {
    data: weatherType.toString(),
    red: ["W29", "W30"]
  }

  const visibility = {
    data: rep["V"].toString(),
    red: "VP",
    amber: "PO"
  }

  //we want to store all of the relevant data in one data structure
  //which can be passed into the table generator
  const weatherInfo = {
    speed: [],
    gust: [],
    temp: [],
    rain: [],
    snow: [],
    electricalStorms: [],
    visibility: []
  }

  //WIND SPEED
  if (speed.data > speed.red) {
    console.log("RED WIND SPEED");
    weatherInfo.speed[0] = speed.data;
    weatherInfo.speed[1] = "R";
  } else if (speed.data > speed.amber) {
    console.log("AMBER WIND SPEED");
    weatherInfo.speed[0] = speed.data;
    weatherInfo.speed[1] = "A";
  } else {
    console.log("GREEN WIND SPEED");
    weatherInfo.speed[0] = speed.data;
    weatherInfo.speed[1] = "G";
  }

  //WIND GUST
  if (gust.data > gust.red) {
    console.log("RED WIND GUST");
    weatherInfo.gust[0] = gust.data;
    weatherInfo.gust[1] = "R";
  } else if (gust.data > gust.amber) {
    console.log("AMBER WIND GUST");
    weatherInfo.gust[0] = gust.data;
    weatherInfo.gust[1] = "A";
  } else {
    console.log("GREEN WIND GUST");
    weatherInfo.gust[0] = gust.data;
    weatherInfo.gust[1] = "G";
  }

  //TEMPERATURE
  if (temp.data > temp.redHigh) {
    console.log("RED TEMPERATURE (HIGH");
    weatherInfo.temp[0] = temp.data;
    weatherInfo.temp[1] = "RH";
  } else if (temp.data > temp.amberHigh) {
    console.log("AMBER TEMPERATURE (HIGH");
    weatherInfo.temp[0] = temp.data;
    weatherInfo.temp[1] = "AH";
  } else if (temp.data >= temp.green) {
    console.log("GREEN TEMPERATURE");
    weatherInfo.temp[0] = temp.data;
    weatherInfo.temp[1] = "G";
  } else if (temp.data > temp.amberLow) {
    console.log("AMBER TEMPERATURE (LOW)");
    weatherInfo.temp[0] = temp.data;
    weatherInfo.temp[1] = "AL";
  } else if (temp.data >= temp.redLow) {
    console.log("AMBER TEMPERATURE (LOW) - EXPERIENCED COXLESS BOATS ONLY");
    weatherInfo.temp[0] = temp.data;
    weatherInfo.temp[1] = "AL*"
  } else {
    console.log("RED TEMPERATURE (LOW)");
    weatherInfo.temp[0] = temp.data;
    weatherInfo.temp[1] = "RL";
  }

  //WEATHER TYPE
  //RAIN
  if (rain.data == rain.red) {
    console.log("RED RAIN");
    weatherInfo.rain[0] = rain.data;
    weatherInfo.rain[1] = "R";
  } else if (rain.data == rain.amber) {
    console.log("AMBER RAIN");
    weatherInfo.rain[0] = rain.data;
    weatherInfo.rain[1] = "A";
  } else {
    console.log("GREEN RAIN");
    weatherInfo.rain[0] = rain.data;
    weatherInfo.rain[1] = "G";
  }

  //SNOW
  if (snow.data == snow.red) {
    console.log("RED SNOW");
    weatherInfo.snow[0] = snow.data;
    weatherInfo.snow[1] = "R";
  } else if (snow.data == snow.amber) {
    console.log("AMBER SNOW");
    weatherInfo.snow[0] = snow.data;
    weatherInfo.snow[1] = "A";
  } else {
    console.log("GREEN SNOW");
    weatherInfo.snow[0] = snow.data;
    weatherInfo.snow[1] = "G";
  }

  //ELECTRICAL STORMS
  if (electricalStorms.red.includes(electricalStorms.data)) {
    console.log("RED ELECTRICAL STORMS");
    weatherInfo.electricalStorms[0] = electricalStorms.data;
    weatherInfo.electricalStorms[1] = "R";
  } else {
    console.log("GREEN ELECTRICAL STORMS");
    weatherInfo.electricalStorms[0] = electricalStorms.data;
    weatherInfo.electricalStorms[1] = "G";
  }

  //VISIBILITY
  if (visibility.data == visibility.red) {
    console.log("RED VISIBILITY");
    weatherInfo.visibility[0] = visibility.data;
    weatherInfo.visibility[1] = "R";
  } else if (visibility.data == visibility.amber) {
    console.log("AMBER VISIBILITY");
    weatherInfo.visibility[0] = visibility.data;
    weatherInfo.visibility[1] = "A";
  } else {
    console.log("GREEN VISIBILITY");
    weatherInfo.visibility[0] = visibility.data;
    weatherInfo.visibility[1] = "G";
  }

  generateWeatherTable(weatherInfo);

}

function generateWeatherTable(weatherInfo) {
  //want to add a row to the weather table in index.html (id="weatherTable")
  //each row contains Time, Wind Speed, Wind Gust, Temp, Rain, Snow, Electrical Storms, Visibility
  //give the value for each cell
  //style each cell green/amber/red based on it's severity. time is styled based on the highest severity

  console.log("generating");

  //get the table
  const weatherTable = document.getElementById("weatherTable");

  //create a table body
  const tblBody = document.createElement("tbody");
  //for the number of desired rows
  for (let i = 0; i < 3; i++) {
    // creates a table row
    const row = document.createElement("tr");

    //for the number of elements in each row
    for (let j = 0; j < 8; j++) {
      // Create a <td> element and a text node, make the text
      // node the contents of the <td>, and put the <td> at
      // the end of the table row
      const cell = document.createElement("td");
      const cellText = document.createTextNode(`cell in row ${i}, column ${j}`);
      console.log(weatherInfo.speed[1]);
      cell.appendChild(cellText);
      row.appendChild(cell);
    }

    // add the row to the end of the table body
    tblBody.appendChild(row);

  }
  //append the body to the table
  weatherTable.appendChild(tblBody);
  console.log("done");

}
