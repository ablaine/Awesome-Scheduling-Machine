/**
 * Author: Andrew Blaine
 * Author: Will Swannack
 *
 * This file holds the ScheduleManager, the primary API into controlling
 * the schedule data.
 */

"use strict";
/*global $, console, window */

/**
 * Constructor
 *
 * Repesents the API to control the various schedules.
 */
function ScheduleManager() {
	this.schedules = [];
	this.max = 8;
	var that = this;
	$("#schedule ul:eq(1) li a").click(function () {
		that.addSchedule();
	});
	this.addSchedule();
}

ScheduleManager.prototype._getCurrentTab = function () {
	// If nothing is selected as current, make the first tab current
	var cur = $("#scheduleTabs li.selected");
	if (cur.length === 0) {
		cur = $("#scheduleTabs li:first");
		if (cur.length !== 0) {
			cur.addClass("selected");
		} else {
			//Should always have at least one active
			if (window.console) {
				console.debug("ERROR, no currently selected schedule!");
			}
		}
	}
	return cur;
};

ScheduleManager.prototype._setCurrentTab = function (tab) {
	var tabs = $("#scheduleTabs li");
	$.each(tabs, function () {
		$(this).removeClass("selected");
	});
	tab.addClass("selected");
};

/**
 * Resets all the tabs event handlers and re-adds them. Then finds the current
 * tab and simulates a click, thereby refreshing the page's schedule. This involves
 * rebuilding the table cells and adding some post-css styling.
 */
ScheduleManager.prototype._update = function () {
	var that = this;
	var tabs = $("#scheduleTabs li a").unbind("click");
	//Add back each tab's event handlers
	tabs.click(function () {
		//Specify the current selected tab
		that._setCurrentTab($(this).parent());
		//Update the table
		$("#schedule tbody").html(that._getCurrentSchedule().toHTML());

		//Add some additional style to the table
		$("#schedule tbody tr:even").css("background-color", "#fff");
		$("#schedule tbody tr:odd").css("background-color", "#e0e0e0");
		$("#schedule tbody tr:odd th").css("color", "#c9c9c9");

		//Color the courses
		var classNames = that._getCurrentSchedule().getAllCourseIDs();
		$.each(classNames, function (i, className) {
			$("#schedule tbody td[class=" + className + "]").addClass("course" + i);
		});
	});
	//Refresh the page by clicking on the current tab
	this._getCurrentTab().find("a").click();
};

/**
 * Returns the currently active schedule.
 */
ScheduleManager.prototype._getCurrentSchedule = function () {
	var that = this;//TODO: Rewrite better... was finicky with scope when written normally
	return (function () {
		return that._getSchedule(that._getTabIndex(that._getCurrentTab().find("a")));
	}());
};

/**
 * Returns the schedule by index.
 */
ScheduleManager.prototype._getSchedule = function (index) {
	return this.schedules[index];
};

/**
 * Returns the tabs index, indicating which schedule it represents.
 */
ScheduleManager.prototype._getTabIndex = function (tab) {
	return Number(tab.attr("href").substring("#sched".length));
};

/**
 * Adds a blank schedule to the page, only if the total number of schedules
 * has not surpassed ScheduleManager.max
 * 
 * @return 'true' if the schedule was added and 'false' otherwise
 */
ScheduleManager.prototype.addSchedule = function () {
	var index = this.schedules.length;
	if (index > this.max) {
		return false;//Unsuccessful
	}
	var tab = $("<li><a href='#sched" + index + "'>Schedule</a></li>");
	$("#scheduleTabs").append(tab);
	this.schedules.push(new Schedule());
	this._update();
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
	var removeMe = $("#scheduleTabs li a[href=#sched" + index + "]").parent();//Want the 'li' element
	if (removeMe.length === 0) {//Not found
		return false;//Unsuccessful
	}
	var shiftUsDown = removeMe.nextAll().children();//Want the 'a' elements
	removeMe.remove();//Removed the tab
	this.schedules.remove(index);//Removed the schedule
	var that = this;
	shiftUsDown.each(function () {
		var hrefVal = "#sched" + String(that._getTabIndex($(this)) - 1);
		$(this).attr("href", hrefVal);
	});
	if (this.schedules.length === 0) {
		this.addSchedule();//Not allowed to go to zero schedules
		//addSchedule will call _update()
	} else {
		this._update();
	}
	return true;//Successful
};

/**
 * Adds the course to the specified schedule.
 * 
 * @param schedule Index of the desired schedule to recieve a course.
 * @param course The course to be added.
 * @return A boolean representing success or failure.
 */
ScheduleManager.prototype.addCourse = function (schedule, course) {
	var result = this._getSchedule(schedule).addCourse(course);
	this._update();
	return result;
};

/**
 * Removes the course from the specified schedule.
 *
 * @param schedule Index of the desired schedule to remove a course from.
 * @param course The course to be removed, specified by an instance or its ID.
 * @return A boolean representing success or failure.
 */
ScheduleManager.prototype.removeCourse = function (schedule, course) {
	var result = this._getSchedule(schedule).removeCourse(course);
	this._update();
	return result;
};

