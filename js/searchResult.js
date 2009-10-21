function SearchResult(elem, search, result) {
	this.elem = elem;
	this.search = search;
	this.result = result;
	
	this._init();
}

SearchResult.prototype._init = function () {
	var that = this;
	
	//Add in search handler
	this.search.elem.find("input[class*='submit']").click(function () {
		that.search.elem.hide();
		that.result.elem.show();

		var result = that.search.submit();//TEMP
		that.result.update(result);
	});
	
	//Add in the results handler
	this.result.elem.find("input[class*='button']").click(function () {
		that.search.elem.show();
		that.result.elem.hide();
	});
};

function Search(elem) {
	this.elem = elem;
	this._init();
}

Search.prototype._init = function () {
	this._initFieldStates();
	this._initSmartLabels();
};

Search.prototype._initFieldStates = function () {
	//Handle the idleField/focusField classes
	var fields = $("input[type='text'], select");
	fields.addClass("idleField");
	fields.focus(function () {
		$(this).removeClass("idleField").addClass("focusField");
	}).blur(function () {
		$(this).removeClass("focusField").addClass("idleField");
	});
};

/**
 * Setup the form inputs with a nice compact description that disappears
 * on focus and reappears when focus is lost and there is no user input.
 *
 * Originally found on http://buildinternet.com, but has since seen numerous
 * modifications.
 */
Search.prototype._initSmartLabels = function () {
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
};

Search.prototype.submit = function (instructor, department, courseNumber, startTime, core) {
	//TODO: Make AJAX call to db, return the courses.
};

//TEMPORARY overriding above
Search.prototype.submit = function () {
	return [ Temp.software, Temp.eCommerce, Temp.networking ];
};


function Result(elem, scheduleManager) {
	this.elem = elem;
	this.scheduleManager = scheduleManager;
	this.tableElem = this.elem.find("table tbody");
	this._init();
}

Result.prototype._init = function () {
	this.elem.hide(); //Hide the results initilially
};

Result.prototype.update = function (courses) {
	var table = "";
	var curSched = this.scheduleManager.getCurrentSchedule();
	$.each(courses, function () {
		//Cycle through the curSched's courses...
		table += this.toResultsTableRow("valid");
	});
	this.tableElem.html(table);
};

Result.prototype._addCourseHandler = function () {
	//Use the schedManager
};

