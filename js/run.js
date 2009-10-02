/**
 * Author: Andrew Blaine
 *
 * This file is intended to initilize the object patterns and bind some misc. event
 * handlers.
 */


// Starts executing upon the pages DOM being fully loaded.
$(function () {
	"use strict";
	/*global $, console, ScheduleManager, Schedule, Course */

	/**
	 * Setup the form inputs with a nice compact description that disappears
	 * on focus and reappears when focus is lost and there is no user input.
	 *
	 * Originally found on http://buildinternet.com , but has since seen numerous
	 * modifications.
	 */
	(function () {
		var inputs = $("input[type='text'], select");
		inputs.addClass("idleField");
		inputs.focus(function () {
			$(this).removeClass("idleField").addClass("focusField");
			if ($(this).attr("defaultValue") === $(this).val()) {
				$(this).val("");
			} else {
				$(this).select();
			}
		});

		inputs.blur(function () {
			$(this).removeClass("focusField").addClass("idleField");
			if ($.trim($(this).val()) === "") {
				$(this).val($(this).attr("defaultValue"));
			}
		});
	}());

	/**
	 * Create a ScheduleManager instance and add 3 extra schedules, bringing the total
	 * schedules to 4. (by default, instantiation makes 1)
	 */
	//TODO: Setup constructor to take an optional # of scheds to create.
	//var scheduleManager = new ScheduleManager(4); //Would have 4 schedules
	//Should still not be possible to create scheduleManager with 0.
	var scheduleManager = new ScheduleManager();
	scheduleManager.addSchedule();
	scheduleManager.addSchedule();
	scheduleManager.addSchedule();

	/**
	 * Declare the handlers for success/failure of actions. Also, test the addition
	 * and removal of some premade courses.
	 */
	(function () {
		//TODO: Eventually rework these to warn the user that the command failed.
		function tryAdd(sched, course) {
			if (scheduleManager.addCourse(sched, course)) {
				if (window.console) {
					console.log("Added course: ", course);
				}
			} else {
				if (window.console) {
					console.log("Unable to add course: ", course);
				}
			}
		}

		//In a working system, the user should not be able to remove a class and receive a failure, so
		// no need to build in any warning mechanism here.
		function tryRm(sched, course) {
			if (scheduleManager.removeCourse(sched, course)) {
				if (window.console) {
					console.log("Removed course: ", course);
				}
			} else {
				if (window.console) {
					console.log("Unable to remove course: ", course);
				}
			}
		}

		//TEMP
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
