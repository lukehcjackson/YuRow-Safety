function callDataPointAPI() {

    //weatherInfoArray stores multiple weatherInfo objects
    //each weatherInfo object stores the relevant weather values and severities for one time period
    weatherInfoArray = []

    const xhr = new XMLHttpRequest();
    //EXAMPLE 3 HOURLY 5 DAY FORECAST
    //const url = "http://datapoint.metoffice.gov.uk/public/data/val/wxfcs/all/json/3840?res=3hourly&key=";
    //GET ALL SITES IN JSON FORMAT
    //const url = "http://datapoint.metoffice.gov.uk/public/data/val/wxfcs/all/json/sitelist?key";
    //GET 3-HOURLY 5 DAY FORECAST FOR YORK
    const url = "http://datapoint.metoffice.gov.uk/public/data/val/wxfcs/all/json/310169?res=3hourly&key=";
    //consider changing url to use https if it still works


    xhr.open("GET", url);
    xhr.send();

    xhr.onload = function() {
        //alert(`Loaded: ${xhr.status} ${xhr.response}`);
        const response = xhr.response;

        //parse the response as JSON
        responseObject = JSON.parse(response);

        //calculate time of most recent measurement
        //stores just the hour in 24hr time (so like 09 or 18)
        //TODO: DOES THIS WORK WITH SINGLE DIGIT TIMES?????
        timeOfMeasurement = responseObject["SiteRep"]["DV"]["dataDate"].toString();
        const Tpos = timeOfMeasurement.indexOf("T");
        timeOfMeasurement = timeOfMeasurement.slice(Tpos+1, Tpos+3);

        //process the Rep value for the current weather information
        const current = responseObject["SiteRep"]["DV"]["Location"]["Period"][0]["Rep"][0];
        //weatherInfoArray.push(evaluateDataPoint(current, timeOfMeasurement));

        
        //[0]   [1]   [2]   [3]      [5]      [9]      [17]
        const todayMeasurement = responseObject["SiteRep"]["DV"]["Location"]["Period"][0]["Rep"];
        const tomorrowMeasurement = responseObject["SiteRep"]["DV"]["Location"]["Period"][1]["Rep"];

        const desiredMeasurements = [];
        const desiredTimes = [0,3,6,9,12,24];
        const itemPositions = [0,1,2,3,5,9];

        itemsFromToday = todayMeasurement.length;
        if (itemsFromToday > 5) {
          itemsFromToday = 5;
        } else if (itemsFromToday > 3) {
          itemsFromToday = 3;
        }

        //needs to run up until the last desired item stored in today's measurements set
        for (let i = 0; i < itemPositions.indexOf(itemsFromToday); i++) {
          //skip the measurements i don't want to include
          if ([4,6,7,8].includes(i)) {
            continue;
          }
          //console.log("i".concat(i.toString()));
          desiredMeasurements.push(todayMeasurement[i]);
          desiredTimes[itemPositions.indexOf(i)] = ((desiredTimes[itemPositions.indexOf(i)] + parseInt(timeOfMeasurement)) % 24).toString();
          //set 24:00 to 00:00
          if (desiredTimes[i] == "24") {
            desiredTimes[i] = "00";
          }
        }

        //the 9th measurement is the latest possible measurement we take from tomorrow
        //DO NOT EVEN NEED THIS??
        //itemsFromTomorrow = itemPositions.indexOf(9) + 1 - itemsFromToday;

        //runs from indexOf(itemsFromToday) -> highest # item from tomorrow (9)
        //j is counting the rep item number
        for (let j = itemPositions.indexOf(itemsFromToday); j <= 9; j++) {
          //skip the measurements i don't want to include
          if ([4,6,7,8].includes(j)) {
            continue;
          }
          //console.log("j".concat(j.toString()));
          //item number j is found at tomorrowMeasurement[j - itemsFromToday]
          desiredMeasurements.push(tomorrowMeasurement[j - itemsFromToday]);
          desiredTimes[itemPositions.indexOf(j)] = ((desiredTimes[itemPositions.indexOf(j)] + parseInt(timeOfMeasurement)) % 24).toString();
          //set 24:00 to 00:00
          if (desiredTimes[j] == "24") {
            desiredTimes[j] = "00";
          }
        }

        console.log("Final array:");
        console.log(desiredMeasurements);
        console.log("Final times: ");
        console.log(desiredTimes);

        for (let x = 0; x < desiredMeasurements.length; x++) {
          weatherInfoArray.push(evaluateDataPoint(desiredMeasurements[x],desiredTimes[x]));
        }

        generateWeatherTable(weatherInfoArray);

      };
      
      xhr.onerror = function() { // only triggers if the request couldn't be made at all
        alert(`Network Error`);
      };

}

//takes a Rep object as input and evaluates each metric and gives it a green/amber/red rating
function evaluateDataPoint(rep, measuredTime) {

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
    time: measuredTime,
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
    weatherInfo.speed[0] = speed.data;
    weatherInfo.speed[1] = "R";
  } else if (speed.data > speed.amber) {
    weatherInfo.speed[0] = speed.data;
    weatherInfo.speed[1] = "A";
  } else {
    weatherInfo.speed[0] = speed.data;
    weatherInfo.speed[1] = "G";
  }

  //WIND GUST
  if (gust.data > gust.red) {
    weatherInfo.gust[0] = gust.data;
    weatherInfo.gust[1] = "R";
  } else if (gust.data > gust.amber) {
    weatherInfo.gust[0] = gust.data;
    weatherInfo.gust[1] = "A";
  } else {
    weatherInfo.gust[0] = gust.data;
    weatherInfo.gust[1] = "G";
  }

  //TEMPERATURE
  if (temp.data > temp.redHigh) {
    weatherInfo.temp[0] = temp.data;
    weatherInfo.temp[1] = "RH";
  } else if (temp.data > temp.amberHigh) {
    weatherInfo.temp[0] = temp.data;
    weatherInfo.temp[1] = "AH";
  } else if (temp.data >= temp.green) {
    weatherInfo.temp[0] = temp.data;
    weatherInfo.temp[1] = "G";
  } else if (temp.data > temp.amberLow) {
    weatherInfo.temp[0] = temp.data;
    weatherInfo.temp[1] = "AL";
  } else if (temp.data >= temp.redLow) {
    weatherInfo.temp[0] = temp.data;
    weatherInfo.temp[1] = "AL*"
  } else {
    weatherInfo.temp[0] = temp.data;
    weatherInfo.temp[1] = "RL";
  }

  //WEATHER TYPE
  //RAIN
  if (rain.data == rain.red) {
    weatherInfo.rain[0] = rain.data;
    weatherInfo.rain[1] = "R";
  } else if (rain.data == rain.amber) {
    weatherInfo.rain[0] = rain.data;
    weatherInfo.rain[1] = "A";
  } else {
    weatherInfo.rain[0] = rain.data;
    weatherInfo.rain[1] = "G";
  }

  //SNOW
  if (snow.data == snow.red) {
    weatherInfo.snow[0] = snow.data;
    weatherInfo.snow[1] = "R";
  } else if (snow.data == snow.amber) {
    weatherInfo.snow[0] = snow.data;
    weatherInfo.snow[1] = "A";
  } else {
    weatherInfo.snow[0] = snow.data;
    weatherInfo.snow[1] = "G";
  }

  //ELECTRICAL STORMS
  if (electricalStorms.red.includes(electricalStorms.data)) {
    weatherInfo.electricalStorms[0] = electricalStorms.data;
    weatherInfo.electricalStorms[1] = "R";
  } else {
    weatherInfo.electricalStorms[0] = electricalStorms.data;
    weatherInfo.electricalStorms[1] = "G";
  }

  //VISIBILITY
  if (visibility.data == visibility.red) {
    weatherInfo.visibility[0] = visibility.data;
    weatherInfo.visibility[1] = "R";
  } else if (visibility.data == visibility.amber) {
    weatherInfo.visibility[0] = visibility.data;
    weatherInfo.visibility[1] = "A";
  } else {
    weatherInfo.visibility[0] = visibility.data;
    weatherInfo.visibility[1] = "G";
  }

  return weatherInfo;

  //generateWeatherTable(weatherInfo);
  //weatherInfoArray.push(weatherInfo);
  //generateWeatherTable(weatherInfoArray);

}

function createCells(text) {
  const cell = document.createElement("td");
  const cellText = document.createTextNode(text);
  cell.appendChild(cellText);
  row.appendChild(cell);
  console.log("created cell");
}

function generateWeatherTable(weatherInfo) {
  //want to add a row to the weather table in index.html (id="weatherTable")
  //each row contains Time, Wind Speed, Wind Gust, Temp, Rain, Snow, Electrical Storms, Visibility
  //give the value for each cell
  //style each cell green/amber/red based on it's severity. time is styled based on the highest severity

  //get the table
  const weatherTable = document.getElementById("weatherTable");

  //create a table body
  const tblBody = document.createElement("tbody");
  //for the number of desired rows
  for (let i = 0; i < weatherInfoArray.length; i++) {
    // creates a table row
    row = document.createElement("tr");

    //HAVE TO DO THIS MANUALLY BECAUSE YOU CAN'T ACCESS OBJECT'S PROPERTIES BY INDEX :(
    //TIME:
    const timeText = weatherInfoArray[i].time.concat(":00");
    createCells(timeText);
  
    //WIND SPEED:
    const speedText = weatherInfoArray[i].speed[0].toString().concat(" mph");
    createCells(speedText);

    //WIND GUST:
    const gustText = weatherInfoArray[i].gust[0].toString().concat(" mph");
    createCells(gustText);

    //FEELS LIKE TEMPERATURE
    const tempText = weatherInfoArray[i].temp[0].toString().concat(" °C");
    if (weatherInfoArray[i].temp[1] == "RH") {
      createCells("Too High: ".concat(tempText));
    } else if (weatherInfoArray[i].temp[1] == "AH") {
      createCells("High: ".concat(tempText));
    } else if (weatherInfoArray[i].temp[1] == "AL") {
      createCells("Low: ".concat(tempText));
    } else if (weatherInfoArray[i].temp[1] == "AL*") {
      createCells("Low (experienced coxless boats only): ".concat(tempText));
    } else if (weatherInfoArray[i].temp[1] == "RL") {
      createCells("Too Low: ".concat(tempText));
    } else {
      createCells("Okay: ".concat(tempText));
    }

    //RAIN
    if (weatherInfoArray[i].rain[1] == "R") {
      createCells("Heavy rain");
    } else if (weatherInfoArray[i].rain[1] == "A") {
      createCells("Moderate rain");
    } else {
      createCells("Okay");
    }

    //SNOW
    if (weatherInfoArray[i].snow[1] == "R") {
      createCells("Heavy snow");
    } else if (weatherInfoArray[i].snow[1] == "A") {
      createCells("Moderate snow");
    } else {
      createCells("Okay");
    }

    //ELECTRICAL STORMS
    if (weatherInfoArray[i].electricalStorms[1] == "R") {
      createCells("Electrical storms likely");
    } else {
      createCells("Okay");
    }

    //VISIBILITY
    if (weatherInfoArray[i].visibility[1] == "R") {
      createCells("Very Poor Visibility");
    } else if (weatherInfoArray[i].visibility[1] == "A") {
        createCells("Poor Visibility");
    } else {
      createCells("Okay");
    }
    

    // add the row to the end of the table body
    tblBody.appendChild(row);

  }
  //append the body to the table
  weatherTable.appendChild(tblBody);
  console.log("done");

}
