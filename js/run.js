/**
 * Author: Andrew Blaine
 *
 * This file is intended to initilize the object patterns and bind some misc. event
 * handlers.
 */

"use strict";
/*global window, $, console, ScheduleManager, Schedule, Course */

// Starts executing upon the pages DOM being fully loaded.
$(function () {

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

	//Create our schedule manager. Initiated at 4 schedules.
	var scheduleManager = ScheduleManager.createScheduleManager(4);

	//TEMP
	/**
	 * Declare the handlers for success/failure of actions. Also, test the addition
	 * and removal of some premade courses.
	 */
	(function () {
		//TODO: Eventually rework these to warn the user that the command failed.
		function tryAdd(sched, course) {
			if (scheduleManager.getSchedule(sched).addCourse(course)) {
				if (window.console) {
					console.log("Added course: ", course);
				}
				scheduleManager.update();
			} else {
				if (window.console) {
					console.log("Unable to add course: ", course);
				}
			}
		}

		//In a working system, the user should not be able to remove a class and receive a failure, so
		// no need to build in any warning mechanism here.
		function tryRm(sched, course) {
			if (scheduleManager.getSchedule(sched).removeCourse(course)) {
				if (window.console) {
					console.log("Removed course: ", course);
				}
				scheduleManager.update();
			} else {
				if (window.console) {
					console.log("Unable to remove course: ", course);
				}
			}
		}

		//Example courses
		var software = Course.createCourse("CSCI340A", "Software Engineering", "Sawin, Jason", "1500;1500;_;1500;1500", "1550;1550;0;1550;1550");
		var eCommerce = Course.createCourse("CSCI250A", "Electronic Commerce", "Bentson, Randy", "1200;1200;_;1200;1200", "1250;1250;0;1250;1250");
		var networking = Course.createCourse("CSCI325A", "Network Programming", "Richards, Brad", "1200;1230;_;1230;1200", "1250;1320;0;1320;1250");

		//Testing
		tryAdd(0, software);
		tryAdd(0, eCommerce);
		tryAdd(0, networking);
		tryRm(0, eCommerce);
		tryAdd(0, networking);
	}());
});
