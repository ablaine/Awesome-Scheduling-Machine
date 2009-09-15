/**
 * Author: Andrew Blaine
 * Author: Will Swannack
 * Author: Derrick Moyer
 *
 * This file holds miscellaneous functions for doing small things to the webpage.
 * 
 * NOTES:
 * 		$(id) is shorthand for document.getElementById(id)
 */

function $(id) {
	return document.getElementById(id);
}

function hideShowDiv(divId) {
	var elem = $(divId);
	if (elem != null) {
		elem.style.display = (elem.style.display == 'none')? 'block':'none';
	}
}

function printPrep(index) {
	hideShowDiv('sched-1');
	hideShowDiv('sched-2');
	hideShowDiv('sched-3');
	hideShowDiv('sched-4');
	hideShowDiv('tutorial');
	hideShowDiv('print');
	hideShowDiv('help');
	hideShowDiv('searchResults1');
	hideShowDiv('searchResults2');
	hideShowDiv('results1');
	hideShowDiv('results2');
	hideShowDiv('about');
	hideShowDiv('back');
	hideShowDiv('sched-' + (index + 1)); //Redisplay the current schedule
	window.print();
}

function printBack(index) {
	hideShowDiv('sched-1');
	hideShowDiv('sched-2');
	hideShowDiv('sched-3');
	hideShowDiv('sched-4');
	hideShowDiv('tutorial');
	hideShowDiv('print');
	hideShowDiv('help');
	hideShowDiv('searchResults1');
	hideShowDiv('searchResults2');
	hideShowDiv('results1');
	hideShowDiv('results2');
	hideShowDiv('about');
	hideShowDiv('back');
	hideShowDiv('sched-' + (index + 1));
}

function cursor(text) {
	var elem = $('help');
	elem.innerHTML = text;
	elem.style.visibility = "visible";
}

function hideCursor() {
	var elem = $('help');
	elem.style.visibility = "hidden";
}

/**
 * Keeps track of which id is current. The initially passed in 'id' should be the tab that is marked curTab by default.
 */
function Tabs(id) {
	this.curTab = id;

	/**
	 * Pass the id of the tab you want to be current.
	 */
	this.setCurTab = function(newTab) {
		$(this.curTab).className="tabs";
		$(newTab).className="curTab";
		this.curTab = newTab;
	}
}

function hideDiv(id) {
	$(id).style.visibility = "hidden";
	$(id).style.display = "none";
}

function showDiv(id) {
	$(id).style.visibility = "visible";
	$(id).style.display = "block";
}

paramArray = new Array();
/* Point a couple 'Tabs' objects to the group of tabs they will handle. */
paramArray["tab-sched"] = new Tabs('sched-1');
paramArray["tab-sr-1"] = new Tabs('sr-search-1');//Handles tabs for the first search/results box
paramArray["tab-sr-2"] = new Tabs('sr-search-2');//Same for the second

