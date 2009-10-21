/**
 * Author: Andrew Blaine
 *
 */

"use strict";
/*global window, $, console, UI, UISettings, Course */

// Starts executing upon the pages DOM being fully loaded.
$(function () {

	var ui = new UI(UISettings.createDefault());
	
	ui.tryAddCourse(Temp.software);
	ui.tryAddCourse(Temp.eCommerce);
	ui.tryAddCourse(Temp.networking);
	ui.tryRemoveCourse(Temp.eCommerce);
	ui.tryAddCourse(Temp.networking);

});
