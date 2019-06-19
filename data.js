var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-109859424-2']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

if(chrome.runtime.setUninstallURL) {
  chrome.runtime.setUninstallURL('https://docs.google.com/forms/d/e/1FAIpQLScJ0WZCg8yMorkWME23N7lKows_4H3oPet8i5xTC7A_r2e8rQ/viewform');
}


var profDB = {};

function makeXMLHttpRequest(url) {
    // make request
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", url, false);
    xmlhttp.send();

    if (xmlhttp.status === 200) {
      return xmlhttp.responseText;
    }
}

function scaleRating(rating) {
  console.log("rating: " + rating);
  console.log((parseFloat(rating)/5)*122.5);
  return (parseFloat(rating)/5)*122.5;
}

function scrapeProfInfo(link) {
  // send second request for actual profile
  var profileURL = "http://www.ratemyprofessors.com";
  var profileResponse = makeXMLHttpRequest(profileURL + link);

  // return error if bad request
  if (profileResponse === 'undefined') {

    return { error: "bad profile request" };
  }

  // parse profile response for stats
  var parsingDiv = document.createElement('div');
  parsingDiv.innerHTML = profileResponse;

  var gradeElements = parsingDiv.getElementsByClassName('grade');
  var ratingElements = parsingDiv.querySelectorAll('div.faux-slides div.rating');
  var tags = parsingDiv.getElementsByClassName('tag-box-choosetags');
  // return error if couldn't find stats
  if (gradeElements.length === 0){
    return { error: "Professor has not been rated" };
  }

  var overall = gradeElements[0].innerHTML;
  var average = gradeElements[2].innerHTML;
  var tag1 = "No tags";
  var tag2 = "";

  if(tags.length !== 0){
    tag1 = tags[0].innerHTML;
    tag2 = tags[1].innerHTML;
  }


  var profJSON = { overall: overall,
                   average: average,
                   tag1: tag1,
                   tag2: tag2
                 };



  console.log(profJSON);
  return profJSON;
}

function searchForProf(prof) {
    console.log("prof: " + prof);

    // create request url
    var searchURL = "http://www.ratemyprofessors.com/search.jsp?queryoption=HEADER&queryBy=teacherName&schoolName=Binghamton+University+%28SUNY%29&schoolID=958&query=";
    var query = prof.toLowerCase().replace(" ", "+");
    console.log("query: " + query);

    // make request
    var searchResponse = makeXMLHttpRequest(searchURL + query);

    // return error if bad request
    if ( searchResponse === 'undefined') {
      return "bad search request";
    }

    // parse searchResponse for link to profile
    var listingPROF = "listing PROFESSOR";
    var profileLinkStub = "/ShowRatings.jsp?tid=";
    var noResultsMsg = "Your search didn't return any results.";
    var link;
    // has link stub and doesn't have "didn't return any"

    if (searchResponse.indexOf(profileLinkStub) !== -1 && searchResponse.indexOf(noResultsMsg) === -1) {
      var templateIndex = searchResponse.indexOf(listingPROF);
      //var linkStartIndex = searchResponse.indexOf(listingPROF + 11);
      var linkEndIndex = searchResponse.indexOf('"', templateIndex + 70);
      link = searchResponse.substring(templateIndex + 46, linkEndIndex);

      console.log("temp index: " + templateIndex);
      console.log("end index: " + linkEndIndex);
      console.log("link: " + link);

      return link;
    } else {
      return "Professor not found";
    }
}

function getProfJSON(request) {
      // search, will return json if error
      var linkToProfile = searchForProf(request.name);

      // check for error
      if (linkToProfile.indexOf("/ShowRatings") === -1) {

          return { error: linkToProfile };
      }

      console.log("link to profile: " + linkToProfile);

      var responseJSON = scrapeProfInfo(linkToProfile);
      responseJSON.link = linkToProfile;
      responseJSON.name = request.name;

      return responseJSON;
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {

        // check if already stored
        var response = profDB.hasOwnProperty(request.name) ? profDB[request.name] : getProfJSON(request);

        // store response in DB?
        if (!profDB.hasOwnProperty(request.name) && !response.hasOwnProperty("error")) {
          profDB[request.name] = response;
        }

        console.log(profDB);

        sendResponse(response);
    }
);
