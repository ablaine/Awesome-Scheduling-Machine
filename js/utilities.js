/**
 * Author: Andrew Blaine
 * Author: Will Swannack
 * Author: Derrick Moyer
 *
 * This file holds small utility functions.
 * 
 */

"use strict";
/*global $ */

// Array Remove - By John Resig (MIT Licensed)
if (!Array.prototype.remove) {
	Array.prototype.remove = function (from, to) {
		var rest = this.slice((to || from) + 1 || this.length);
		this.length = from < 0 ? this.length + from : from;
		return this.push.apply(this, rest);
	};
}

//NOTE: My own, inefficient version.. possibly fix up later (AB)
if (!Array.prototype.unique) {
	Array.prototype.unique = function () {
		var arr = [];
		for (var i = 0; i < this.length; i++) {
			if ($.inArray(this[i], arr) === -1) {
				arr.push(this[i]);
			}
		}
		return arr;
	};
}

