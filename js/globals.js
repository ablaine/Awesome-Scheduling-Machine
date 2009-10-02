/**
 * Author: Andrew Blaine
 *
 * This file defines the Global namespace and provides some useful values.
 */

"use strict";
/*global $, console */

/**
 * Constructor/Namespace
 * 
 * A namespace referencing global static variables. These variables should not
 * be altered via code. (ie. consider them final)
 */
function Globals() {
}

/**
 * Valid days for course to show up
 */
Globals.days = [ "monday", "tuesday", "wednesday", "thursday", "friday" ];

/**
 * Valid times for a course to begin on. Every time is padded with zeros to a
 * length of 4. (eg. 0800)
 */
Globals.times = (function () {//Once computed
	function pad(num, length) {
		var result = "" + num;
		while (result.length < length) {
			result = '0' + result;
		}
		return result;
	}

	var padSize = 4;
	var arr = [];
	var time = 700;
	for (var i = 0; i < 20; i = i + 1) {
		if (i % 2 === 0) {// Even
			time += 100;
			arr[i] = pad(time, padSize);
		} else {//Odd
			arr[i] = pad(time + 30, padSize);
		}
	}
	return arr;
}());
