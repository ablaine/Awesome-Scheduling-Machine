/**
 * Author: Andrew Blaine
 * Author: Will Swannack
 *
 * This file holds the ScheduleManager, the primary API into controlling
 * the schedule data.
 */

"use strict";
/*global $, console, window, Schedule, Tab */

/**
 * Constructor
 *
 * Repesents the API to control the various schedules. It is recommended
 * to use the static method "create" when producing an instance of this
 * class.
 */
function ScheduleManager() {
	this.schedules = [];
	this.max = 8;
	var that = this;
	var curSched = null;

	this.getCurrentSchedule = function () { return curSched; };
	this.setCurrentSchedule = function (sched) {
		if (sched instanceof Schedule) {
			sched = $.inArray(sched, this.schedules);
			if (sched === -1) {//Not found
				return;
			}
		}
		curSched.getTab().setCurrent(false);//Deactivate the old one
		curSched = that.schedules[sched];
		curSched.getTab().setCurrent(true);//Activate the new one
	};

	//Add the initial schedule
	this.addSchedule();

	//And make it the current schedule
	curSched = this.schedules[0];
	curSched.getTab().setCurrent(true);

	//Add the new schedule handler
	$("#schedule ul:eq(1) li a").click(function () {
		that.addSchedule();
		that.update();
	});
}

/**
 * Produces a new instance of the ScheduleManager class. This method may be called
 * without parameters to start off with a single Schedule. Passing a number
 * greater than 0 results in that many initial Schedules.
 * 
 * @param count The number of schedules you want to start with.
 * @return A new instance of the ScheduleManager class.
 */
ScheduleManager.createScheduleManager = function (count) {
	var result = new ScheduleManager();
	if (count && count > 0) {
		for (var i = 1; i < count; i++) {//Constructor starts off with 1 already
			result.addSchedule();
		}
	}
	return result;
};

/**
 * Refreshes the page by reapplying handlers/populating the main schedule.
 * 
 * Resets all the tabs event handlers and re-adds them. Then finds the current
 * tab and simulates a click, thereby refreshing the page's schedule. This involves
 * rebuilding the table cells and adding some post-css styling.
 */
ScheduleManager.prototype.update = function () {
	var that = this;
	$.each(this.schedules, function (i, sched) {
		var curSched = sched;
		var anchor = sched.getTab().getAnchor();
		anchor.unbind("click");//Remove bindings
		anchor.click(function () {
			//Set the current schedule
			that.setCurrentSchedule(curSched);

			//Update the table
			var table = $("#schedule tbody");
			table.html(curSched.toHTML());

			//Add some additional styles to the table
			table.find("tr:even").css("background-color", "#fff");
			table.find("tr:odd").css("background-color", "#e0e0e0");
			table.find("tr:odd th").css("color", "#c9c9c9");

			//Color the courses
			var classNames = curSched.getAllCourseIDs();
			$.each(classNames, function (i, className) {
				$("#schedule tbody td[class*=" + className + "]").addClass("course" + i);
			});

			//Add the remove course actions
			var allClasses = $("#schedule tbody td[class*='class']");
			allClasses.prepend("<a class='remove'>X</a>").find("a").click(function () {
				var courseID = $(this).parent().attr("class").split(" ")[0];
				curSched.removeCourse(courseID);
				curSched.getTab().getAnchor().click();
			}).hide();
			allClasses.hover(function () {
				$(this).find("a").show();
			}, function () {
				$(this).find("a").hide();
			});
		});
	});

	//Refresh the page by clicking on the current tab
	this.getCurrentSchedule().getTab().getAnchor().click();
};

/**
 * Returns the schedule by index.
 */
ScheduleManager.prototype.getSchedule = function (index) {
	return this.schedules[index];
};

/**
 * Adds a blank schedule to the page, only if the total number of schedules
 * has not surpassed ScheduleManager.max
 * 
 * @return 'true' if the schedule was added and 'false' otherwise.
 */
ScheduleManager.prototype.addSchedule = function () {
	var index = this.schedules.length;
	if (index > this.max) {
		return false;//Unsuccessful
	}
	var tab = $("<li><a>Schedule</a></li>");
	$("#scheduleTabs").append(tab);
	this.schedules.push(new Schedule(new Tab(tab)));
	return true;//Successful
};

/**
 * Removes the specified schedule from the page, by index. If the total number of schedules
 * goes below 1, this method will regenerate a blank schedule.
 *
 * @param index The index of the schedule.
 * @return 'true' if the schedule is removed and 'false' if the index was out of bounds.
 */
ScheduleManager.prototype.removeSchedule = function (index) {
	//First make sure it is there
	var removeMe = this.getSchedule(index);
	if (removeMe === undefined) {//Not found
		return false;//Unsuccessful
	}
	
	//Next, remove the tab and schedule
	removeMe.getTab().getElem().remove();//Removed the tab
	this.schedules.remove(index);//Removed the schedule

	//Ensure we still have 1 schedule
	if (this.schedules.length === 0) {
		this.addSchedule();//Not allowed to go to zero schedules
	}

	//Check if the schedule we just removed was the current schedule
	if (this.getCurrentSchedule() === removeMe) {
		this.setCurrentSchedule(0);//Then set someone else to be the current
	}

	return true;//Successful
};

