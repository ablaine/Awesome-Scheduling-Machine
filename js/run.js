/**
 * Author: Andrew Blaine
 *
 */

"use strict";
/*global window, $, console, UI, UISettings, Course */

// Starts executing upon the pages DOM being fully loaded.
$(function () {

	var ui = new UI(new UISettings());
	
	//Example courses
	var software = Course.createCourse("CSCI340A", "Software Engineering", "Sawin, Jason", "1500;1500;_;1500;1500", "1550;1550;0;1550;1550");
	var eCommerce = Course.createCourse("CSCI250A", "Electronic Commerce", "Bentson, Randy", "1200;1200;_;1200;1200", "1250;1250;0;1250;1250");
	var networking = Course.createCourse("CSCI325A", "Network Programming", "Richards, Brad", "1200;1230;_;1230;1200", "1250;1320;0;1320;1250");

	ui.tryAddCourse(software);
	ui.tryAddCourse(eCommerce);
	ui.tryAddCourse(networking);
	ui.tryRemoveCourse(eCommerce);
	ui.tryAddCourse(networking);

});
