
function callAPI2() {
    console.log("testing no cred");
    const xhr = new XMLHttpRequest();
    const url = "";

    xhr.open("GET", url);
    //xhr.onreadystatechange = someHandler;
    xhr.send();

    xhr.onload = function() {
        alert(`Loaded: ${xhr.status} ${xhr.response}`);
      };
      
      xhr.onerror = function() { // only triggers if the request couldn't be made at all
        alert(`Network Error`);
      };


    /*
    var url = ;
    fetch(url)
    .then((response) => response.json())
    .then((json) => console.log("success"))
    .catch((error) => console.error(`Error fetching data: ${error.message}`));
    */
}
