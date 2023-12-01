function callDataPointAPI() {

    const xhr = new XMLHttpRequest();
    //EXAMPLE 3 HOURLY 5 DAY FORECAST
    //const url = "http://datapoint.metoffice.gov.uk/public/data/val/wxfcs/all/json/3840?res=3hourly&key=";
    //GET ALL SITES IN JSON FORMAT
    //const url = "http://datapoint.metoffice.gov.uk/public/data/val/wxfcs/all/json/sitelist?key";
    //GET 3-HOURLY 5 DAY FORECAST FOR YORK
    const url = "http://datapoint.metoffice.gov.uk/public/data/val/wxfcs/all/json/310169?res=3hourly&key=";


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

  //WIND SPEED
  if (speed.data > speed.red) {
    console.log("RED WIND SPEED");
  } else if (speed.data > speed.amber) {
    console.log("AMBER WIND SPEED");
  } else {
    console.log("GREEN WIND SPEED");
  }

  //WIND GUST
  if (gust.data > gust.red) {
    console.log("RED WIND GUST");
  } else if (gust.data > gust.amber) {
    console.log("AMBER WIND GUST");
  } else {
    console.log("GREEN WIND GUST");
  }

  //TEMPERATURE
  if (temp.data > temp.redHigh) {
    console.log("RED TEMPERATURE (HIGH");
  } else if (temp.data > temp.amberHigh) {
    console.log("AMBER TEMPERATURE (HIGH");
  } else if (temp.data >= temp.green) {
    console.log("GREEN TEMPERATURE");
  } else if (temp.data > temp.amberLow) {
    console.log("AMBER TEMPERATURE (LOW)");
  } else if (temp.data >= temp.redLow) {
    console.log("AMBER TEMPERATURE (LOW) - EXPERIENCED COXLESS BOATS ONLY");
  } else {
    console.log("RED TEMPERATURE (LOW)");
  }

  //WEATHER TYPE
  //RAIN
  if (rain.data == rain.red) {
    console.log("RED RAIN");
  } else if (rain.data == rain.amber) {
    console.log("AMBER RAIN");
  } else {
    console.log("GREEN RAIN");
  }

  //SNOW
  if (snow.data == snow.red) {
    console.log("RED SNOW");
  } else if (snow.data == snow.amber) {
    console.log("AMBER SNOW");
  } else {
    console.log("GREEN SNOW");
  }

  //ELECTRICAL STORMS
  if (electricalStorms.red.includes(electricalStorms.data)) {
    console.log("RED ELECTRICAL STORMS");
  } else {
    console.log("GREEN ELECTRICAL STORMS");
  }

  //VISIBILITY
  if (visibility.data == visibility.red) {
    console.log("RED VISIBILITY");
  } else if (visibility.data == visibility.amber) {
    console.log("AMBER VISIBILITY");
  } else {
    console.log("GREEN VISIBILITY");
  }

}
