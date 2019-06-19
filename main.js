function popup(info, element, error) {

    var card = document.createElement("div");
    card.setAttribute("class", "cardContainer");

		if (error) {
		    card.innerHTML = "<div class='card'> <div class='card-content'> <span class='card-title'></span> <p> <span class='cardError'><b>Error:</b> " + info.error + "</p></span> </div> </div>";
		} else {
		    card.innerHTML = "<div class='card'> <div class='card-content'> <span class='card-title'>" + info.name + "</span> <table id='headRatingTable'> <tr id='headRatingLabel'> <td>Overall Quality:</td> <td>Level of Difficulty:</td> </tr> <tr id='headRating'> <td>"+ info.overall +"</td> <td>"+ info.average +"</td> </tr> </table> <table id='subRatingTable'> <tr>  <p> Tags: </p> <table style='font-size: .8em;'> <tr> <td>" + info.tag1 + "</td> <td>" + info.tag2 + "</td> </tr> </g> </g> </g> </g> </svg></td> <td>" + "</td> </tr> </table> </div> <div class='card-action'> <a target='_blank' href='http://www.ratemyprofessors.com" + info.link + "'>View Rating</a> <a class='add-btn' target='_blank' href='http://www.ratemyprofessors.com/AddRating.jsp?tid=" + info.link.split('tid=')[1] + "'>Add Rating</a> </div> </div>";
		}
    element.appendChild(card);

    var cardContainer = element.getElementsByClassName('cardContainer')[0];
    element.addEventListener("mouseover", function() {
			window.clearTimeout(this.timeoutID);
			cardContainer.style.display = 'block';
    });
    element.addEventListener("mouseout", function() {
			this.timeoutID = window.setTimeout(function() {
				cardContainer.style.display = 'none';
			}, 25);
    });

}

function addRow(row, rate) {
  var headRow = row.parentNode.childNodes[rate * 2];
  var rating = document.createElement("th");
  rating.className = "ddheader";
  rating.scope = "col";
  rating.innerHTML = "Prof. Quality";
  headRow.insertBefore(rating, headRow.childNodes[0]);
}

function addCol(info, element) {
  var cell = element.parentNode.insertCell(0);

  if (info.hasOwnProperty("error")) {
    cell.innerHTML = "<span class='ratingCellgood errorCell'>N/A</span>";
    popup(info,cell,true);
  } else {
    if(info.overall >= 3){
      cell.innerHTML = "<span class='ratingCellgood'>" + info.overall + "</span>";
    }

    else if(info.overall >= 2 && info.overall < 3){
      cell.innerHTML = "<span class='ratingCellokay'>" + info.overall + "</span>";
    }

    else{
      cell.innerHTML = "<span class='ratingCellbad'>" + info.overall + "</span>";
    }
    popup(info,cell,false);
  }
}

function getProfInfo (nameText, profElement){

    if (nameText){
				var request = { name: nameText };
    }
    else{
        return null;
    }

    var firstName = nameText.split([" "])[0].toLowerCase();

    return chrome.runtime.sendMessage(request, function(response) {

          addCol(response, profElement);

      });
}



function getName (name) {

    var nameArr = name.split(" ");

    if (nameArr[0] && nameArr[3]){

        nameArr[0] = nameArr[0].toLowerCase().trim().replace( /\b\w/g, function (m) {
                return m.toUpperCase();
            });

        nameArr[3] = nameArr[3].toLowerCase().trim().replace( /\b\w/g, function (m) {
                return m.toUpperCase();
            });

				return nameArr[3] + " " + nameArr[0];
    }

    else if (nameArr[0] && nameArr[1]){

        nameArr[0] = nameArr[0].toLowerCase().trim().replace( /\b\w/g, function (m) {
                return m.toUpperCase();
            });

        nameArr[1] = nameArr[1].toLowerCase().trim().replace( /\b\w/g, function (m) {
                return m.toUpperCase();
            });

				return nameArr[1] + " " + nameArr[0];
    }

    return null;
}

function getProfs (profRows){

    if (!profRows) {
      return;}

    var addCell = false;
    var rate = 0;
    for (i = 0; i < profRows.length; i++){
        if(profRows[i].getElementsByTagName("th").length > 1){
          rate = i;
        }

        if(profRows[i].getElementsByTagName("td").length !== 0){

        var rowCells = profRows[i].getElementsByTagName("td");

        var thisProf = rowCells[16];
        var thisProfText = thisProf.textContent;


        if (thisProfText.length > 0){

            var profName = getName(thisProfText);
            console.log("Name: " + profName);

            if (i === rate + 1) {
              addRow(profRows[rate], rate);
              addCell = true;
            }

            if (profName){
                getProfInfo(profName, thisProf);
            }
            else if (addCell) {
                profRows[i].insertCell(6);
            }
        }
    }
  }
}


var insertDivContent = function(event, isCoursePage){

	if (isCoursePage || event.animationName == "nodeInserted") {

    var divAdded;
    if (isCoursePage) {
      divAdded = document.querySelectorAll("table.datadisplaytable")[0].getElementsByTagName("tbody")[0];
    } else {
      divAdded = event.target.getElementsByTagName("tbody")[0];
    }

    if (divAdded !== undefined) {
      var tableRows = divAdded.getElementsByTagName("tr");
      getProfs(tableRows);
    }

	}

};

document.addEventListener("animationstart", insertDivContent, false);

function addstyles() {

  var roboto = document.createElement("link");
  roboto.rel = "stylesheet";
  roboto.type = "text/css";
  roboto.href = "https://fonts.googleapis.com/css?family=Roboto:400,300,700";
  document.head.appendChild(roboto);

  var style = document.createElement("style");
  var ratingCellStyle = ".ratingCellgood { font-family: Roboto; font-weight: 300; font-size: 0.8rem; color: #fff; background-color: #5CD63E; border-radius: 200px; padding: 3px 6px; text-align: center !important; margin: 2px 6px; } .errorCell { background-color: #DFDFDF !important; color: red !important; margin: 3px; } ";
  var ratingCellStyleOkay = ".ratingCellokay { font-family: Roboto; font-weight: 300; font-size: 0.8rem; color: #fff; background-color: #E3D748; border-radius: 200px; padding: 3px 6px; text-align: center !important; margin: 2px 6px; } .errorCell { background-color: #DFDFDF !important; color: red !important; margin: 3px; } ";
    var ratingCellStyleBad = ".ratingCellbad { font-family: Roboto; font-weight: 300; font-size: 0.8rem; color: #fff; background-color: #CF3927; border-radius: 200px; padding: 3px 6px; text-align: center !important; margin: 2px 6px; }";
  var popupStyle = ".cardContainer { display: none; margin: 0; position: absolute; left: 5.5%;} .cardContainer tr { border-style: hidden !important; } .card { line-height: 1.5; font-family: 'Roboto', sans-serif; font-weight: normal; width: 300px; overflow: hidden; margin: 0.5rem 0 1rem 0; background-color: #fff; border-radius: 2px; box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.16), 0 2px 10px 0 rgba(0, 0, 0, 0.12); transition: box-shadow .25s; } .card .card-content { padding: 20px; border-radius: 0 0 2px 2px; color: rgba(0,0,0,0.54); } .card .card-content p { font-size: 14px; } .card .card-content .card-title { line-height: 28px; color: black; font-size: 24px; font-weight: 400; } .card .card-action { border-top: 1px solid rgba(160, 160, 160, 0.2); padding: 20px; } .card .card-action a { text-decoration: none; font-size: 14.5px; color: #36B2B4 !important; margin-right: 20px; transition: color .3s ease; transition-property: color; transition-duration: 0.3s; transition-timing-function: ease; transition-delay: initial; text-transform: uppercase; } .card .card-action a:hover { color: #ffd8a6 !important; text-decoration: none; } a { text-decoration: none; background-color: transparent; } .profRating { font-size: 18px; font-weight: 700; } .card-content table { color: rgba(0,0,0,0.54); width: 100%; } .card-content table td { background-color: white !important; } #headRatingTable { margin-top: 20px; margin-bottom: 15px; text-align: center; height: 48px; } #headRatingTable td { width: 130px; } #headRatingLabel { font-size: 13px; line-height: 13px; } #headRating { font-size: 34px; line-height: 34px; } #subRatingTable { font-size: 14px; line-height: 26.67px; } #subRatingTable tr td:nth-child(1) { } #subRatingTable tr td:nth-child(3) { font-size: 18px; font-weight: 700; text-align: right; } td span.ratingCell, td div.cardContainer { font-style: normal; } .add-btn { float: right; margin-right: 0 !important; }";

  style.innerHTML = ratingCellStyle + popupStyle + ratingCellStyleBad + ratingCellStyleOkay;
  document.head.appendChild(style);
}

document.onreadystatechange = function () {

  if (document.readyState === "complete") {
  
    addstyles();

    if (window.location.href.indexOf("GetCrse") > -1) {
      insertDivContent(null, true);
      consoler.log("hello");
    }
    else{
      console.log("bye");
    }
  }
}
;
