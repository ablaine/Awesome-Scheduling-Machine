/**
 * Author: Andrew Blaine
 * 
 * This file is intended to setup some UI handlers and prepare error screens.
 */

"use strict";
/*global window, $, console, ScheduleManager */

function UI(settings) {
	this.settings = settings;
	//Create the schedule manager. Initiated at 4 schedules.
	this.scheduleManager = ScheduleManager.createScheduleManager(4);
	
	this.lSearchResult = null;
	this.RSearchResult = null;
	
	this._init();
}

UI.prototype._init = function () {
	var lSRElem = $(".footer .searchResult");
	var lSearch			= new Search(lSRElem.find(".search"));
	var lResult			= new Result(lSRElem.find(".result"), this.scheduleManager);
	this.lSearchResult	= new SearchResult(lSRElem, lSearch, lResult);

	var rSRElem = $(".footer .searchResult").clone().appendTo(".footer");
	var rSearch			= new Search(rSRElem.find(".search"));
	var rResult			= new Result(rSRElem.find(".result"), this.scheduleManager);
	this.rSearchResult	= new SearchResult(rSRElem, rSearch, rResult);
};

UI.prototype.displayError = function () {
	if (this.settings.displayErrors) {
		var table = $("#schedule tbody");
		table.animate({ "opacity": "-=0.1" }, 100);
		table.animate({ "opacity": "+=0.1" }, 300);
	}
};

UI.prototype.tryAddCourse = function (course) {
	var curSched = this.scheduleManager.getCurrentSchedule();
	if (curSched.addCourse(course)) {
		if (this.settings.debug) {
			console.log("Added course: ", course);
		}
		this.scheduleManager.update();
	} else {
		if (this.settings.debug) {
			console.log("Unable to add course: ", course);
		}
		this.displayError();
	}
};

UI.prototype.tryRemoveCourse = function (course) {
	var curSched = this.scheduleManager.getCurrentSchedule();
	if (curSched.removeCourse(course)) {
		if (this.settings.debug) {
			console.log("Removed course: ", course);
		}
	} else {
		if (this.settings.debug) {
			console.log("Unable to remove course: ", course);
		}
	}
};

//Settings
function UISettings(userErrors, debug) {
	this.displayErrors = userErrors;
	this.debug = debug;
}

UISettings.createDefault = function () {
	return new UISettings(true, window.console !== undefined);
};

//Temporary namespace
function Temp() { }
Temp.software = Course.createCourse("CSCI340A", "Software Engineering", "Sawin, Jason", "1500;1500;_;1500;1500", "1550;1550;0;1550;1550");
Temp.eCommerce = Course.createCourse("CSCI250A", "Electronic Commerce", "Bentson, Randy", "1200;1200;_;1200;1200", "1250;1250;0;1250;1250");
Temp.networking = Course.createCourse("CSCI325A", "Network Programming", "Richards, Brad", "1200;1230;_;1230;1200", "1250;1320;0;1320;1250");
