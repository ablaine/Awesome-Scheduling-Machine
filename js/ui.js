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
}

//We want to avoid doing this as much as possible by disabling controls and whatnot
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
