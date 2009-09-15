 /**
 * The basic code for our ajax was pulled from w3schools.com
 * 
 * NOTE: The yearAndTerm is currently disabled (Passing anything in to 
 * it is ignored). At one point we had considered allowing search on past
 * year/terms but we have since disabled that feature.
 * 
 * Author: Andrew Blaine
 * 
 */
var xmlHttp;
function submitQuery(yearAndTerm, instructor, department, courseNumber, startTime, coreFulfillment, resultsDiv, searchResults) {
	window.divId = resultsDiv;

	xmlHttp = GetXmlObject();
	if (xmlHttp == null) {
		alert("Browser does not support HTTP Request");
		return;
	}

	var url = "db/submitQuery.php";
	url = url + "?y=" + yearAndTerm;
	url = url + "&i=" + instructor;
	url = url + "&d=" + department;
	url = url + "&cn=" + courseNumber;
	url = url + "&s=" + startTime;
	url = url + "&cf=" + coreFulfillment;
	url = url + "&sr=" + searchResults;
	url = url + "&sid=" + Math.random(); //To avoid browser caching the results

	xmlHttp.onreadystatechange = stateChanged;
	xmlHttp.open("Get", url, true);
	xmlHttp.send(null);
}

function stateChanged() {
	if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
		document.getElementById(divId).innerHTML = xmlHttp.responseText;
	}
}

function GetXmlObject() {
	var xmlHttp = null;
	try {
		// Firefox, Opera 8.0+, Safari
		xmlHttp = new XMLHttpRequest();
	} catch (e) {
		// Internet Explorer
		try {
			xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
			xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
		}
	}
	return xmlHttp;
}
