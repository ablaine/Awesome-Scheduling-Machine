/*
schedManager.js handles local instantiation of schedules and classes. Classes are stored as classinfo objects. The classinfo object is instantiated when the function addClassToScheds is called (instantiation happens 
in ./database/submitequery.php). They are removed in removeClassFromSched function. Finally, updateActiveSchedule is called when schedules are changed and it redisplays whatever schedule is currently visible.
*/


/*Stores all info necessary for the search results box and a schedule.
input:
	inname: the name of the class
	indays: string of characters representing the days classes are on
	intimes: string of time the class begins at (military time)
	inendtimes: string of times the class ends at (military time)
	innum: class number as a string (such as CSCI361)
	ininstructor: string of professors name
	incourseid: string number that is unique to a particular class. Used to link classes together that are at different times.
*/
function classinfo(inname/*string*/, indays/*string*/, intimes/*strings*/, inendtimes/*strings*/, innum/*string*/, ininstructor/*string*/, incourseid/*string*/)
{
	this.name = inname; //Name as it appears in Results and on Schedule
	this.days = indays; //String of characters representing days classes are on
	this.starttimes = intimes; //String
	this.endTimes = inendtimes; //Same as times, but when the class ends.
	this.num = innum; //String of the Number of the class (ex. CSCI161A)
	this.instructor = ininstructor; //A String containing the teacher(s) of the class.
	
	//Need to get how long the course is. Convert times to ints
	intTime = 0;
	intEndTime = 0;
	
	if(this.starttimes.charAt(0) == '0')
		intTime = parseInt(this.starttimes.substring(1, this.starttimes.length));
	else
		intTime = parseInt(this.starttimes);
	if(this.endTimes.charAt(0) == '0')
		intEndTime = parseInt(this.endTimes.substring(1, this.endTimes.length));
	else
		intEndTime = parseInt(this.endTimes);
	
	timedif = intEndTime - intTime;
	timeUnit = 0;
	while(timedif >= 0)
	{
		timeUnit++;
		timedif -= 50;
	}
	
	this.unitsOfTime = timeUnit; //Number of 30 minute units of time this class is
	this.courseid = incourseid;
	this.numInSched = 0; //This will be set later and is used to color code the class
}

//A schedule is just an array of classinfos. This is an array of schedules, initialized at four.
var schedules = [[], [], [], []];

//An array of indexes into schedules representing which schedules are changed. Initially only the first schedule changes.
var changeschedules = [];
changeschedules.push(0);

//This pointer points to the schedule currently being displayed.
var activeschedule = schedules[0]; //Pointer to sched being used
var schedIndex = 0; //Number of sched being viewed

//Provide the class and it will be added to the schedule. The whichResults variable is an integer of either 1 or 2, 1 refers to the results box on the left and 2 to the results box on the right. This distinction
//is used to add to the schedules whose boxes are checked in the results box the classes are being added from.
function addClassToScheds(/*classinfo*/aClass, /*int*/whichResults)
{
	//Update changeschedules
	changeschedules.splice(0, changeschedules.length);
	if(whichResults == "1")
	{
		for(i = 0; i < document.scheds1.sched.length; i++)
		{
			if(document.scheds1.sched[i].checked)
				changeschedules.push(i);
		}
	}
	else
	{
		for(i = 0; i < document.scheds2.sched.length; i++)
		{
			if(document.scheds2.sched[i].checked)
				changeschedules.push(i);
		}
	}
	
	//Need to check for class conflicts before adding
	for(i = 0; i < changeschedules.length; i++)
	{
		for(j = 0; j < schedules[changeschedules[i]].length; j++)
		{
			for(l = 0; l < aClass.length; l++)
			{
				//Check to see if the class we're adding conflicts with classes already in the schedules. If it does, do not add, throw up an error message, and get out of the function.
				bClass = schedules[changeschedules[i]][j];
				
				if(checkForClassConflict(aClass[l], bClass))
				{
					alert(aClass[l].name + " is at the same time as " + bClass.name + " so it can't be added.");
					return 0;
				}
				
				//Check to see if another class with the same courseid has been set. If so, grab its numInSched field for similar coloring.
				if(aClass[l].courseid == bClass.courseid && bClass.numInSched != 0)
					aClass[l].numInSched = bClass.numInSched;
			}
			
		}
		//If numInSched was not set, set it now.
		temp = schedules[changeschedules[i]].length + 1;
		for(l = 0; l < aClass.length; l++)
		{
			if(aClass[l].numInSched == 0)
				aClass[l].numInSched = temp;
			//Add the class to the schedule
			schedules[changeschedules[i]].push(aClass[l]);
		}
		
	}
	//Redisplay the active schedule to visually represent changes
	updateactiveschedule();
}

//Removes a class from the active schedule provided the index of that class
function removeClassFromSched(index)
{
	//Grab the class
	classToDelete = activeschedule[index];
	//Remove the class from the array
	activeschedule.splice(index, 1);
	//See if the class is part of a pairing of classes (classes that have the same courseid)
	for(i = 0; i < activeschedule.length; i++)
	{
		if(activeschedule[i].courseid == classToDelete.courseid)
		{
			removeClassFromSched(i);
			break;
		}
	}
	//Redisplay the active schedule to visually represent changes
	updateactiveschedule();
}

//Changes the active schedule displayed on the screen to the schedul whose index into the variable schedules is provided
function changeActiveSched(index)
{
	var scheds = document.getElementsByName("sched");//If there are 4 schedules and two results boxes, then this should be length 8
	for (var i = 0; i < scheds.length; i++) {
		scheds[i].checked = false;
	}
	scheds[index].checked = true;
	scheds[index + (scheds.length/2)].checked = true;//Updates the second search/results box
	schedIndex = index;
	activeschedule = schedules[index];
	//Remove all changing schedules and just change the active schedule.
	changeschedules.splice(0, changeschedules.length);
	changeschedules.push(index);
	updateactiveschedule();
}

//To make it easier to build the schedule...
var schedtimes = new Array("0800", "0830","0900", "0930","1000", "1030","1100", "1130","1200", "1230","1300", "1330","1400", "1430","1500", "1530","1600", "1630","1700", "1730");

//Pass this function two classinfo objects to see if they have time conflicts
function checkForClassConflict(aClass /*classinfo*/, bClass /*classinfo*/)
{
	aStartTime = 0;
	aEndTime = 0;
	bStartTime = 0;
	bEndTime = 0;
	if(aClass.starttimes.charAt(0) == '0')
		aStartTime = parseInt(aClass.starttimes.substring(1, aClass.starttimes.length));
	else
		aStartTime = parseInt(aClass.starttimes);
	if(aClass.endTimes.charAt(0) == '0')
		aEndTime = parseInt(aClass.endTimes.substring(1, aClass.endTimes.length));
	else
		aEndTime = parseInt(aClass.endTimes);
	if(bClass.starttimes.charAt(0) == '0')
		bStartTime = parseInt(bClass.starttimes.substring(1, bClass.starttimes.length));
	else
		bStartTime = parseInt(bClass.starttimes);
	if(bClass.endTimes.charAt(0) == '0')
		bEndTime = parseInt(bClass.endTimes.substring(1, bClass.endTimes.length));
	else
		bEndTime = parseInt(bClass.endTimes);
		
	//Only check on days that both classes are happening
	for(k = 1; k < 6; k++)
	{
		if(aClass.days.charAt(k) != "_" && bClass.days.charAt(k) != "_")
		{
			if(aStartTime <= bEndTime && aStartTime >= bStartTime)
				return true;
			if(aEndTime <= bEndTime && aEndTime >= bStartTime)
				return true;
		}
	}
	return false;
}

//Pass this function a classinfo object and a time as a string (such as 0800) to see if the class is during that time.
function checkForConflict(aClass /*classinfo*/, aTime /*string*/)
{
	time = 0;
	startTime = 0;
	endTime = 0;
	if(aTime.charAt(0) == '0')
		time = parseInt(aTime.substring(1, aTime.length));
	else
		time = parseInt(aTime);
	if(aClass.starttimes.charAt(0) == '0')
		startTime = parseInt(aClass.starttimes.substring(1, aClass.starttimes.length));
	else
		startTime = parseInt(aClass.starttimes);
	if(aClass.endTimes.charAt(0) == '0')
		endTime = parseInt(aClass.endTimes.substring(1, aClass.endTimes.length));
	else
		endTime = parseInt(aClass.endTimes);
		
	if(time <= endTime && time >= startTime)
	{
		return true;
	}
	return false;
}

//Updates the visual schedule using the active schedule
function updateactiveschedule()
{
	// the nodes inside the <table> tag are being replaced, therefore, no need to input a new <table> tag.
	text = "<table id='schedule' cellspacing='0' cellpadding='0'>";
	text += "<tbody>";
	text += "<tr bgcolor=\"#e0e0e0\"><!--<th width=\"3%\" colspan=\"2\">Time</th> -->";
	text += "<th width=\"3%\">Time</th><th width=\"19%\">Monday</th><th width=\"19%\">";
	text += "Tuesday</th><th width=\"19%\">Wednesday</th><th width=\"19%\">Thursday</th>";
	text += "<th width=\"19%\">Friday</th></tr>";

	for(i = 0; i < schedtimes.length; i+=2)
	{
		//Build an array of indeces of classinfos who are at the corresponding time.
		indeces = [];
		for(j = 0; j < activeschedule.length; j++)
		{			
			if(schedtimes[i] == activeschedule[j].starttimes)
				indeces.push(j);
		}
		if(indeces.length == 0)
		{
			text += "<tr valign=\"top\" bgcolor=\"white\"><td align=\"right\" nowrap>" + schedtimes[i] + "</td>";
			//For each day of the week
			for(j = 1; j < 6; j++)
			{
				//Check to see if a class has started before this time but is in this time so we don't add extra rows.
				conflicts = false;
				for(l = 0; l < activeschedule.length; l++)
				{	 		
					if(activeschedule[l].days.charAt(j) != "_" && checkForConflict(activeschedule[l], schedtimes[i]))
						conflicts = true;
				}
				if(!conflicts)
					text +=	"<td>&nbsp;</td>";
			}
			text += "</tr>";
		}
		else
		{
			text += "<tr valign=\"top\"><td align=\"right\" nowrap>" + schedtimes[i] + "</td>";
			//For each day of the week...
			for(j = 1; j < 6; j++)
			{
				dayfull = false;
				//For each of the indeces...
				for(k = 0; k < indeces.length; k++)
				{
					//If the class is not on this day, fill it in as blank
					if(activeschedule[indeces[k]].days.charAt(j) == "_" && k == indeces.length - 1 && !dayfull)
					{
						for(l = 0; l < activeschedule.length; l++)
						{
							if(l != indeces[k] && checkForConflict(activeschedule[l], schedtimes[i]) && activeschedule[l].days.charAt(j) != "_")
							{
								dayfull = true;
							}
						}
						if(!dayfull)
						{
							text += "<td>&nbsp;</td>";
							dayfull = true;
						}
					}
					//if the class is on this day, fill in the relevant info
					else if(!dayfull && activeschedule[indeces[k]].days.charAt(j) != "_")
					{
						text += "<td class = \"course" + activeschedule[indeces[k]].numInSched + "\" rowspan=" + activeschedule[indeces[k]].unitsOfTime + ">";
						text += "<a class=\"remove\" onmouseover=\"cursor('<em>Remove</em> this course')\" onmouseout=\"hideCursor()\" onClick=\"hideCursor();removeClassFromSched(" + indeces[k] + ");\">" + "X</a>&nbsp;&nbsp;&nbsp;";
						text += activeschedule[indeces[k]].name + "<br />";
						text += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(" + activeschedule[indeces[k]].num + ")";
						text += "</td>";
						dayfull = true;
					}
				}
			}	
		}
		
		//Build an array of indeces of classinfos who have the corresponding time.
		indeces = [];
		for(j = 0; j < activeschedule.length; j++)
		{
			if(schedtimes[i+1] == activeschedule[j].starttimes)
				indeces.push(j);
		}
		if(indeces.length == 0)
		{
			text += "<tr valign=\"top\" bgcolor=\"white\"><td align=\"right\" nowrap>" + schedtimes[i+1] + "</td>";
			for(j = 1; j < 6; j++)
			{
				//Check to see if a class has started before this time but is in this time so we don't add extra rows.
				conflicts = false;
				for(l = 0; l < activeschedule.length; l++)
				{			
					if(activeschedule[l].days.charAt(j) != "_" && checkForConflict(activeschedule[l], schedtimes[i+1]))
						conflicts = true;
				}
				if(!conflicts)
					text +=	"<td>&nbsp;</td>";
			}
			text += "</tr>";
		}
		else
		{
			text += "<tr valign=\"top\" bgcolor=\"green\"><td align=\"right\" nowrap>" + schedtimes[i+1] + "</td>";
			//For each day of the week...
			for(j = 1; j < 6; j++)
			{	
				dayfull = false;
				//For each of the indeces...
				for(k = 0; k < indeces.length; k++)
				{
					//If the class is not on this day, fill it in as blank
					if(activeschedule[indeces[k]].days.charAt(j) == "_" && k == indeces.length - 1 && !dayfull)
					{
						for(l = 0; l < activeschedule.length; l++)
						{
							if(l != indeces[k] && checkForConflict(activeschedule[l], schedtimes[i+1]) && activeschedule[l].days.charAt(j) != "_")
							{
								dayfull = true;
							}
						}
						if(!dayfull)
						{
							text += "<td>&nbsp;</td>";
							dayfull = true;
						}
					}
					//if the class is on this day, fill in the relevant info
					else if(!dayfull && activeschedule[indeces[k]].days.charAt(j) != "_")
					{
						text += "<td class = \"course" + activeschedule[indeces[k]].numInSched + "\" rowspan=" + activeschedule[indeces[k]].unitsOfTime + ">";
						text += "<a class=\"remove\" onmouseover=\"cursor('<em>Remove</em> this course')\" onmouseout=\"hideCursor()\" onClick=\"hideCursor();removeClassFromSched(" + indeces[k] + ");\">" + "X</a>&nbsp;&nbsp;&nbsp;";
						text += activeschedule[indeces[k]].name + "<br />";
						text += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(" + activeschedule[indeces[k]].num + ")";
						text += "</td>";
						dayfull = true;
					}
				}
			}	
		}
	}
	//finish the table off.
	text += "</table>";
	//add it to the document
	$('scheduleHolder').innerHTML = text;
}

//Function used for programs using schedManager to make it easier to know which schedule is being used
function getSchedIndex() {
	return schedIndex;
}
