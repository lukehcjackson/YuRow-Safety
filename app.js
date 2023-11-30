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

  const speed = parseInt(rep["S"]); 
  const gust = parseInt(rep["G"]);
  const weatherType = rep["W"];
  const temp = parseInt(rep["F"]);
  const visibility = rep["V"];

  /*
  Better way of doing this:
  struct for each variable, holding the data, and each threshold value
  i.e for speed:
  speed {
    data = parseInt(rep["S"]);
    red = 35;
    amber = 24;
    green not even necessary in this case
  }

  then do speed.data > speed.red -> output red
  */

  //evaluate speed
  if (speed > 35) {
    console.log("Wind Speed Red: " + speed.toString());
  } else if (speed >= 24) {
    console.log("Wind Speed Amber: " + speed.toString());
  } else {
    console.log("Wind Speed Green: " + speed.toString());
  }

  //evaluate gust
  if (gust > 40) {
    console.log("Wind Gust Red: " + gust.toString());
  } else if (gust >= 30) {
    console.log("Wind Gust Amber: " + gust.toString());
  } else {
    console.log("Wind Gust Green: " + gust.toString());
  }

}
