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

        const todayMeasurement = responseObject["SiteRep"]["DV"]["Location"]["Period"][0]["Rep"];
        const tomorrowMeasurement = responseObject["SiteRep"]["DV"]["Location"]["Period"][1]["Rep"];

        //combine the two JSON objects
        let todayMeasurementString = JSON.stringify(todayMeasurement);
        todayMeasurementString = todayMeasurementString.slice(0,todayMeasurementString.length-1);
        const tomorrowMeasurementString = JSON.stringify(tomorrowMeasurement).slice(1);
        const combinedMeasurementString = todayMeasurementString.concat(",").concat(tomorrowMeasurementString);
        const combinedMeasurement = JSON.parse(combinedMeasurementString);
        
        //want to use these two measurement sets to find times around 7am and 2pm the next day in particular
        const desiredMeasurements = [];
        //we do not know where these times will come in the set so work it out from the current time
        const timesOfAllMeasurements = [];
        for (let i = 0; i < combinedMeasurement.length; i++) {
          timesOfAllMeasurements[i] = (parseInt(timeOfMeasurement) + (3*i));
        }

        //const idealTimes = [6,7,8,13,14,15];
        const idealTimes = [30,31,32,37,38,39];
        //idealTimes above reflects the times we want to take measurements
        //but since we aren't doing %24 to find the hour on the day, each value has 24hrs added onto it
        //to reflect that it's a time from tomorrow
        for (let j = 0; j < idealTimes.length; j++) {
          desiredMeasurements.push(timesOfAllMeasurements.lastIndexOf(idealTimes[j]));
        }

        //first thing we want is the current and next measurement
        const measurementSet = [];
        const measurementTimes = [];
        for (let m = 0; m < 2; m++) {
          measurementSet.push(combinedMeasurement[m]);
          measurementTimes[m] = (timesOfAllMeasurements[m]);
        }        

        //for each element in desiredMeasurements we want the measurements at that time, and also the ones before and after it
        for (let k = 0; k < desiredMeasurements.length; k++) {
          if (desiredMeasurements[k] != -1) {
            //to keep them in the right order, first try to get the measurement before the one that we know for sure we can
            try {
              //if those elements are already in the table, then don't add them!
              if (!measurementSet.includes(combinedMeasurement[desiredMeasurements[k]-1])) {
                measurementSet.push(combinedMeasurement[desiredMeasurements[k]-1]);
                measurementTimes.push(timesOfAllMeasurements[desiredMeasurements[k]-1]);
              }
            }
            catch {
              console.log("No measurement before desired");
            }

            //get the rep values from the k'th index of combinedMeasurement
            if (!measurementSet.includes(combinedMeasurement[desiredMeasurements[k]])) { 
              measurementSet.push(combinedMeasurement[desiredMeasurements[k]]);
              measurementTimes.push(timesOfAllMeasurements[desiredMeasurements[k]]);
            }
            
            //also get the measurement after it if available
            try {
              if (!measurementSet.includes(combinedMeasurement[desiredMeasurements[k]+1])) { 
                measurementSet.push(combinedMeasurement[desiredMeasurements[k]+1]);
                measurementTimes.push(timesOfAllMeasurements[desiredMeasurements[k]+1]);
              }
            }
            catch {
              console.log("No measurement after desired");
            }
          }
          

        }

        //PASS THROUGH TIMES TO CONVERT 24->00:00 AND ADD LEADING ZEROES TO SINGLE DIGIT TIMES
        //ALSO NEED TO STORE TIMES AS STRING
        //TODO: ADD DATES TO TIMES
        let date = new Date();
        let todayDate = (date.getDate().toString()).concat("/").concat((date.getMonth() + 1).toString()); 
        date.setDate(date.getDate() + 1)
        let tomorrowDate = (date.getDate().toString()).concat("/").concat((date.getMonth() + 1).toString());
        console.log(todayDate);
        console.log(tomorrowDate);

        measurementDays = []

        for (let y = 0; y < measurementTimes.length; y++) {
          //calculate the day
          if (measurementTimes[y] < 24) {
            measurementDays[y] = todayDate.concat(" ");
          } else {
            measurementDays[y] = tomorrowDate.concat(" ");
          }

          //do mod 24 to get actual times
          measurementTimes[y] = measurementTimes[y] % 24;

          //convert 24:00 to 00:00
          if (measurementTimes[y] == 24) {
            measurementTimes[y] = 0;
          }
          //convert to string and add leading zeroes
          if (measurementTimes[y] < 10) {
            measurementTimes[y] = "0".concat(measurementTimes[y].toString());
          } else {
            measurementTimes[y] = measurementTimes[y].toString();
          }

          //add the date to the time
          measurementTimes[y] = measurementDays[y].concat(measurementTimes[y]);
          
        }

        for (let x = 0; x < measurementSet.length; x++) {
          weatherInfoArray.push(evaluateDataPoint(measurementSet[x],measurementTimes[x]));
        }


        /* THIS IS THE FIRST SOLUTION
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
          desiredMeasurements.push(todayMeasurement[i]);
          desiredTimes[itemPositions.indexOf(i)] = ((desiredTimes[itemPositions.indexOf(i)] + parseInt(timeOfMeasurement)) % 24).toString();
          //set 24:00 to 00:00
          if (desiredTimes[i] == "24") {
            desiredTimes[i] = "00";
          }
        }

        //runs from indexOf(itemsFromToday) -> highest # item from tomorrow (9)
        //j is counting the rep item number
        for (let j = itemPositions.indexOf(itemsFromToday); j <= 9; j++) {
          //skip the measurements i don't want to include
          if ([4,6,7,8].includes(j)) {
            continue;
          }
          //item number j is found at tomorrowMeasurement[j - itemsFromToday]
          desiredMeasurements.push(tomorrowMeasurement[j - itemsFromToday]);
          desiredTimes[itemPositions.indexOf(j)] = ((desiredTimes[itemPositions.indexOf(j)] + parseInt(timeOfMeasurement)) % 24).toString();
          //set 24:00 to 00:00
          if (desiredTimes[j] == "24") {
            desiredTimes[j] = "00";
          }
        }
        

        for (let x = 0; x < desiredMeasurements.length; x++) {
          weatherInfoArray.push(evaluateDataPoint(desiredMeasurements[x],desiredTimes[x]));
        }
        */

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
    visibility: [],
    timeSev: 1
  }

  //this array will be used to style the time column
  //stores a numeric value associated with each column's severity
  //then the max of this array will be the largest severity
  maxSev = [1];

  //WIND SPEED
  if (speed.data > speed.red) {
    weatherInfo.speed[0] = speed.data;
    weatherInfo.speed[1] = "R";
    maxSev.push(3);
  } else if (speed.data > speed.amber) {
    weatherInfo.speed[0] = speed.data;
    weatherInfo.speed[1] = "A";
    maxSev.push(2);
  } else {
    weatherInfo.speed[0] = speed.data;
    weatherInfo.speed[1] = "G";
  }

  //WIND GUST
  if (gust.data > gust.red) {
    weatherInfo.gust[0] = gust.data;
    weatherInfo.gust[1] = "R";
    maxSev.push(3);
  } else if (gust.data > gust.amber) {
    weatherInfo.gust[0] = gust.data;
    weatherInfo.gust[1] = "A";
    maxSev.push(2);
  } else {
    weatherInfo.gust[0] = gust.data;
    weatherInfo.gust[1] = "G";
  }

  //TEMPERATURE
  if (temp.data > temp.redHigh) {
    weatherInfo.temp[0] = temp.data;
    weatherInfo.temp[1] = "RH";
    maxSev.push(3);
  } else if (temp.data > temp.amberHigh) {
    weatherInfo.temp[0] = temp.data;
    weatherInfo.temp[1] = "AH";
    maxSev.push(2);
  } else if (temp.data >= temp.green) {
    weatherInfo.temp[0] = temp.data;
    weatherInfo.temp[1] = "G";
  } else if (temp.data > temp.amberLow) {
    weatherInfo.temp[0] = temp.data;
    weatherInfo.temp[1] = "AL";
    maxSev.push(2);
  } else if (temp.data >= temp.redLow) {
    weatherInfo.temp[0] = temp.data;
    weatherInfo.temp[1] = "AL*"
    maxSev.push(2);
  } else {
    weatherInfo.temp[0] = temp.data;
    weatherInfo.temp[1] = "RL";
    maxSev.push(3);
  }

  //WEATHER TYPE
  //RAIN
  if (rain.data == rain.red) {
    weatherInfo.rain[0] = rain.data;
    weatherInfo.rain[1] = "R";
    maxSev.push(3);
  } else if (rain.data == rain.amber) {
    weatherInfo.rain[0] = rain.data;
    weatherInfo.rain[1] = "A";
    maxSev.push(2);
  } else {
    weatherInfo.rain[0] = rain.data;
    weatherInfo.rain[1] = "G";
  }

  //SNOW
  if (snow.data == snow.red) {
    weatherInfo.snow[0] = snow.data;
    weatherInfo.snow[1] = "R";
    maxSev.push(3);
  } else if (snow.data == snow.amber) {
    weatherInfo.snow[0] = snow.data;
    weatherInfo.snow[1] = "A";
    maxSev.push(2);
  } else {
    weatherInfo.snow[0] = snow.data;
    weatherInfo.snow[1] = "G";
  }

  //ELECTRICAL STORMS
  if (electricalStorms.red.includes(electricalStorms.data)) {
    weatherInfo.electricalStorms[0] = electricalStorms.data;
    weatherInfo.electricalStorms[1] = "R";
    maxSev.push(3);
  } else {
    weatherInfo.electricalStorms[0] = electricalStorms.data;
    weatherInfo.electricalStorms[1] = "G";
  }

  //VISIBILITY
  if (visibility.data == visibility.red) {
    weatherInfo.visibility[0] = visibility.data;
    weatherInfo.visibility[1] = "R";
    maxSev.push(3);
  } else if (visibility.data == visibility.amber) {
    weatherInfo.visibility[0] = visibility.data;
    weatherInfo.visibility[1] = "A";
    maxSev.push(2);
  } else {
    weatherInfo.visibility[0] = visibility.data;
    weatherInfo.visibility[1] = "G";
  }

  weatherInfo.timeSev = Math.max.apply(Math, maxSev);

  return weatherInfo;

}

function createCells(text, sev) {
  const cell = document.createElement("td");
  const cellText = document.createTextNode(text);
  cell.appendChild(cellText);

  if (sev == "R") {
    cell.style.backgroundColor = "#FF6961";
  } else if (sev == "A") {
    cell.style.backgroundColor = "#FFB54C";
  } else {
    cell.style.backgroundColor = "#8CD47E";
  }

  row.appendChild(cell);
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
    if (weatherInfoArray[i].timeSev == 3) {
      createCells(timeText, "R");
    } else if (weatherInfoArray[i].timeSev == 2) {
      createCells(timeText, "A");
    } else {
      createCells(timeText);
    }
    
    //WIND SPEED:
    const speedText = weatherInfoArray[i].speed[0].toString().concat(" mph");
    createCells(speedText, weatherInfoArray[i].speed[1]);

    //WIND GUST:
    const gustText = weatherInfoArray[i].gust[0].toString().concat(" mph");
    createCells(gustText, weatherInfoArray[i].gust[1]);

    //FEELS LIKE TEMPERATURE
    const tempText = weatherInfoArray[i].temp[0].toString().concat(" °C");
    if (weatherInfoArray[i].temp[1] == "RH") {
      createCells("Too High: ".concat(tempText), "R");
    } else if (weatherInfoArray[i].temp[1] == "AH") {
      createCells("High: ".concat(tempText), "A");
    } else if (weatherInfoArray[i].temp[1] == "AL") {
      createCells("Low: ".concat(tempText), "A");
    } else if (weatherInfoArray[i].temp[1] == "AL*") {
      createCells("Low (experienced coxless boats only): ".concat(tempText), "A");
    } else if (weatherInfoArray[i].temp[1] == "RL") {
      createCells("Too Low: ".concat(tempText),"R");
    } else {
      createCells("Okay: ".concat(tempText),"G");
    }

    //RAIN
    if (weatherInfoArray[i].rain[1] == "R") {
      createCells("Heavy rain", "R");
    } else if (weatherInfoArray[i].rain[1] == "A") {
      createCells("Moderate rain", "A");
    } else {
      createCells("Okay", "G");
    }

    //SNOW
    if (weatherInfoArray[i].snow[1] == "R") {
      createCells("Heavy snow", "R");
    } else if (weatherInfoArray[i].snow[1] == "A") {
      createCells("Moderate snow", "A");
    } else {
      createCells("Okay", "G");
    }

    //ELECTRICAL STORMS
    if (weatherInfoArray[i].electricalStorms[1] == "R") {
      createCells("Electrical storms likely", "R");
    } else {
      createCells("Okay", "G");
    }

    //VISIBILITY
    if (weatherInfoArray[i].visibility[1] == "R") {
      createCells("Very Poor Visibility", "R");
    } else if (weatherInfoArray[i].visibility[1] == "A") {
        createCells("Poor Visibility", "A");
    } else {
      createCells("Okay", "G");
    }
    
    // add the row to the end of the table body
    tblBody.appendChild(row);

  }
  //append the body to the table
  weatherTable.appendChild(tblBody);

}
