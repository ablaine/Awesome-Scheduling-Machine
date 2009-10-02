/**
 * Author: Andrew Blaine
 * Author: Will Swannack
 *
 * This file contains the business logic for manipulating the schedules. These
 * classes generally do not need to be accessed directly. Instead, one should
 * try the ScheduleManager API.
 */

"use strict";
/*global $, console, window */

/*	TIMEBLOCK
 ******************************************************************************/

/**
 * Constructor
 * 
 * Reperesents a single block of time.
 *
 * @param startTime The starting time of this block
 * @param endTime The ending time of this block
 */
function TimeBlock(startTime, endTime) {
	this.startTime = startTime;
	this.endTime = endTime;
}

/**
 * Returns whether this timeblock conflicts with the input timeblock.
 * Assumes times are well ordered. (ie. sTime < eTime)
 *
 * @param day The day to check against.
 * @return True if they conflict, false otherwise
 */
TimeBlock.prototype.conflicts = function (day) {
	if (this.startTime === null || this.endTime === null ||
		day.startTime === null || day.endTime === null) {
		return false;
	}
	return (day.startTime <= this.endTime) && (this.startTime <= day.endTime);
};

/**
 * Returns whether the hour intersects with this timeblock.
 * 
 * @param hour The hour to check against.
 * @return True if the hour is within this timeblock.
 */
TimeBlock.prototype.intersects = function (hour) {
	return this.startTime <= Number(hour) && Number(hour) <= this.endTime;
};

/*	COURSE
 ******************************************************************************/

/**
 * Constructor
 * 
 * Represents a single course. It is recommended to call Course.createCourse
 * instead of the constructor directly.
 */
function Course(id, title, instructors, timeBlocks) {//TODO: , enrolled, units) {
	this.id = id;
	this.title = title;
	this.instructors = instructors;
	this.timeBlocks = timeBlocks;
}

/**
 * Check if this course has times that conflict with the input course.
 *
 * @param course The course to check against.
 * @return Whether the two courses have conflicting hours.
 */
Course.prototype.hasConflict = function (course) {
	for (var i = 0; i < Globals.days.length; i++) {
		var day = Globals.days[i];
		if (this.timeBlocks[day].conflicts(course.timeBlocks[day])) {
			return true;
		}
	}
	return false;
};

/**
 * Generally expected to be output within a <td /> element.
 *
 * @return HTML formatted output representing this course.
 */
Course.prototype.toHTML = function () {
	return this.id + " : " + this.title + "<br />" + this.instructors;
};

/**
 * A builder method for parsing a course into the appropriate attributes, and loading
 * those into the constructor.
 * 
 * Assumes start/end times are formatted as: "800;800;_;800;800" for a mt_tf 8am class.
 * Replacing a days hour with an underscore indicates the course does not meet that day.
 * 
 * @param id The courseID. (e.g. CSCI340A)
 * @param title The title of the course.
 * @param instructors An array of those instructors who are teaching the course.
 * @param startTime A string representing each days start times.
 * @param endTime A string representing each days end times.
 * @return a new Course object from the input
 */
Course.createCourse = function (id, title, instructors, startTimes, endTimes) {
	//TEMP: When we get DB functionality back, we may change the input format.
	var noTime = "_";
	function clean(arr) {
		for (var i = 0; i < arr.length; i++) {
			if (arr[i] === noTime) {
				arr[i] = null;
			} else {
				arr[i] = Number(arr[i]);
			}
		}
		return arr;
	}

	var sTimes = clean(startTimes.split(";"));
	var eTimes = clean(endTimes.split(";"));
	var timeBlocks = { monday:		new TimeBlock(sTimes[0], eTimes[0]),
					   tuesday:		new TimeBlock(sTimes[1], eTimes[1]),
					   wednesday:	new TimeBlock(sTimes[2], eTimes[2]),
					   thursday:	new TimeBlock(sTimes[3], eTimes[3]),
					   friday:		new TimeBlock(sTimes[4], eTimes[4]) };

	return new Course(id, title, instructors.split("; "), timeBlocks);
};

/*	SCHEDULE
 ******************************************************************************/

/**
 * Constructor
 * 
 * Represents a single schedule, which is an array of courses.
 */
function Schedule() {
	this.courses = [];
}

/**
 * Adds a course to this schedule. If the course conflicts with another course
 * in this schedule, the course will not be added.
 * 
 * @param course The course to add.
 * @return 'true' for success (course is added) or 'false' (course is not added).
 */
Schedule.prototype.addCourse = function (course) {
	for (var i = 0; i < this.courses.length; i++) {
		var c = this.courses[i];
		if (c.hasConflict(course)) {
			return false;//Unsuccessful
		}
	}
	this.courses.push(course);
	return true;//Successful
};

/**
 * Removes the course from this schedule. Input accepts the course instance, or a
 * string representing its course.id
 * 
 * @param course The course to remove.
 * @return 'true' if the course was removed and 'false' if the course was not found.
 */
Schedule.prototype.removeCourse = function (course) {
	if (course.id) {//We only want the id
		course = course.id;
	}
	for (var i = 0; i < this.courses.length; i++) {
		if (this.courses[i].id === course) {
			this.courses.remove(i);
			return true;
		}
	}
	return false;
};

Schedule.prototype.getAllCourseIDs = function () {
	var arr = [];
	for (var i = 0; i < this.courses.length; i++) {
		arr.push(this.courses[i].id);
	}
	return arr;
};

/**
 * Returns a HTML encoded string of this schedule, designed to be inserted into a <table /> element.
 *
 * @return A string to be placed inside a <table /> element and rendered as HTML.
 */
Schedule.prototype.toHTML = function () {
	/**
	 * Constructor
	 *
	 * This is a temporary helper class for arranging the schedule into a 2D array of its 'table' <td /> cells.
	 * Cells that are left "undefined" are intended to be replaced with <td>&nbsp;</td>. It is not recommended to
	 * use this class outside of the Schedule class.
	 */
	function TableBuilder() {
		this.table = [ [], [], [], [], [] ];
	}

	/**
	 * Adds this course to the 2d table array, handling rowspan values along the way.
	 * 
	 * @param course The course to add.
	 */
	TableBuilder.prototype.addCourse = function (course) {
		// This algorithm is applied in full per course. It is assumed that no two courses have conflicting times.
		//Algorithm:
		//	For each day,
		//		iterate through each time,
		//			until you find a time the course conflicts with.
		//			Track that time until subsequent times cease conflict with the course.
		//				Now, set the rowspan of the initial time to be the difference between the initial and the current,
		//				and set each array cell between the two times to be = "";
		for (var dayIndex = 0; dayIndex < Globals.days.length; dayIndex++) {
			var timeBlock = course.timeBlocks[Globals.days[dayIndex]];
			var firstTimeIndex = null;
			for (var timeIndex = 0; timeIndex < Globals.times.length; timeIndex++) {
				var time = Globals.times[timeIndex];
				if (firstTimeIndex === null) {
					//looking for the first block of this course
					if (timeBlock.intersects(time)) {
						firstTimeIndex = timeIndex;//Found first
					}
				} else {
					if (!timeBlock.intersects(time)) {
						//Set the rowspan
						var rowspan = "rowspan='" + String(Number(timeIndex) - Number(firstTimeIndex)) + "'";
						this.table[dayIndex][firstTimeIndex] = "<td " + rowspan + " class='" + course.id + "'>" + course.toHTML() + "</td>";
						//Clear the intersecting <td /> from being printed by assigning the empty string
						for (firstTimeIndex = firstTimeIndex + 1; firstTimeIndex < timeIndex; firstTimeIndex++) {
							this.table[dayIndex][firstTimeIndex] = "";
						}
						//Clear the tracker
						firstTimeIndex = null;
					}
				}
			}
		}
	};

	/**
	 * Adds a collection of courses to the 2d table array.
	 * 
	 * @param courses The array of courses to add.
	 */
	TableBuilder.prototype.addAllCourses = function (courses) {
		for (var i = 0; i < courses.length; i++) {
			this.addCourse(courses[i]);
		}
	};

	//First, build the 2dimensional array of <td /> cells
	var tableBuilder = new TableBuilder();
	tableBuilder.addAllCourses(this.courses);

	//Now, iterate over the 2d array and output the 2d array cells if defined and <td>&nbsp;</td> otherwise 
	var table = tableBuilder.table;
	var sched = "";
	for (var timeIndex = 0; timeIndex < 20; timeIndex++) {
		sched += "<tr>";
		sched += "<th>" + Globals.times[timeIndex] + "</th>";
		for (var dayIndex = 0; dayIndex < Globals.days.length; dayIndex++) {
			if (typeof(table[dayIndex][timeIndex]) === "undefined") {
				sched += "<td>&nbsp;</td>";
			} else {
				sched += table[dayIndex][timeIndex];
			}
		}
		sched += "</tr>";
	}
	return sched;
};
