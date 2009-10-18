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

	/**
	 * Setup the form inputs with a nice compact description that disappears
	 * on focus and reappears when focus is lost and there is no user input.
	 *
	 * Originally found on http://buildinternet.com, but has since seen numerous
	 * modifications.
	 */
	(function () {
		//Handle the idleField/focusField classes
		var fields = $("input[type='text'], select");
		fields.addClass("idleField");
		fields.focus(function () {
			$(this).removeClass("idleField").addClass("focusField");
		}).blur(function () {
			$(this).removeClass("focusField").addClass("idleField");
		});

		//Handle the smart textbox label
		$("input[type='text']").each(function () {
			var userMaxLength = $(this).attr("maxlength");
			var descValue = $(this).attr("defaultValue");
			var descMaxLength = descValue.length;
			$(this).attr("maxlength", descMaxLength);//Start it off at max length
			$(this).val(descValue);
			$(this).focus(function () {
				if (descValue === $(this).val()) {//No user data
					//Must reset maxlength AFTER comparision for Safari
					$(this).attr("maxlength", userMaxLength);//Set the max length for the user
					$(this).val("");//Clear the field
				} else {//User inputed data is present
					$(this).select();//Select the text
					//BUG Confirmed with Safari/Chrome @ [Bug 22691] https://lists.webkit.org/pipermail/webkit-unassigned/2009-September/132567.html
				}
			});
			$(this).blur(function () {
				if ($.trim($(this).val()) === "") {//Nothing is there
					$(this).attr("maxlength", descMaxLength);//Increase the max length
					$(this).val(descValue);//Reassign the field description
				}
			});
		});
	}());

	(function () {
		var lSearchResults = $(".footer .search.results");
		var rSearchResults = lSearchResults.clone().appendTo(".footer");
		var search  = lSearchResults.find(".search").add(rSearchResults.find(".search"));
		var results = lSearchResults.find(".results").add(rSearchResults.find(".results"));

		results.hide();

		search.find("input[class*='submit']").click(function () {
			var par = $(this).parents(".search.results");
			par.find(".search").hide();
			par.find(".results").show();

			//TEMPORARY filling the schedule.
			var table = "";
			table += Temp.software.toResultsTableRow("valid");
			table += Temp.eCommerce.toResultsTableRow("valid");
			table += Temp.networking.toResultsTableRow("invalid");

			par.find(".results table tbody").html(table);
		});

		results.find("input[class*='button']").click(function () {
			var par = $(this).parents(".search.results");
			par.find(".search").show();
			par.find(".results").hide();
		});

	}());
}

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

function UISettings() {
	this.displayErrors = true;
	this.debug = window.console !== undefined;
}

//Temporary namespace
function Temp() { }
Temp.software = Course.createCourse("CSCI340A", "Software Engineering", "Sawin, Jason", "1500;1500;_;1500;1500", "1550;1550;0;1550;1550");
Temp.eCommerce = Course.createCourse("CSCI250A", "Electronic Commerce", "Bentson, Randy", "1200;1200;_;1200;1200", "1250;1250;0;1250;1250");
Temp.networking = Course.createCourse("CSCI325A", "Network Programming", "Richards, Brad", "1200;1230;_;1230;1200", "1250;1320;0;1320;1250");
