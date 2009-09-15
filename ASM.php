<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
	"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<!-- Authors: Andrew Blaine
			  Derrick Moyer
			  Will Swannack
-->
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
	<title>ASM</title>
	<meta http-equiv="Content-Language" content="en-us" />
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<meta http-equiv="Content-Style-Type" content="text/css" />
	<meta http-equiv="Content-Script-Type" content="text/javascript" />
	<link rel="stylesheet" type="text/css" href="include/reset.css" media="all" />
	<link rel="stylesheet" type="text/css" href="include/main.css" media="all" />
	<script type="text/javascript" src="db/ajax.js"></script>
	<script type="text/javascript" src="include/utilities.js"></script>
	<script type="text/javascript" src="include/schedManager.js"></script>
</head>
<body>

<div class="tabs-holder">
	<div id="sched-1" class="curTab" ><a onclick="paramArray['tab-sched'].setCurTab('sched-1');changeActiveSched(0)">Schedule 1</a></div>
	<div id="sched-2" class="tabs"><a onclick="paramArray['tab-sched'].setCurTab('sched-2');changeActiveSched(1)">Schedule 2</a></div>
	<div id="sched-3" class="tabs"><a onclick="paramArray['tab-sched'].setCurTab('sched-3');changeActiveSched(2)">Schedule 3</a></div>
	<div id="sched-4" class="tabs"><a onclick="paramArray['tab-sched'].setCurTab('sched-4');changeActiveSched(3)">Schedule 4</a></div>
	<div id="about"><a href="./about.html" target="_blank">About</a></div>
	<div id="tutorial"><a href="./tutorial/ASMTutorial.html" target="_blank">Tutorial</a></div>
	<div id="print"><a onclick="printPrep(getSchedIndex())">Print</a></div>
	<div id="back" style="display: none"><a onclick="printBack(getSchedIndex())">Back</a></div>
	<div id="help">Help shows up here.</div>
</div>

<div id="scheduleHolder">
	<table id="schedule" cellspacing="0" cellpadding="0">
		<tbody>
			<tr>
				<th width="3%">Time</th>
				<th width="19%">Monday</th>
				<th width="19%">Tuesday</th>
				<th width="19%">Wednesday</th>
				<th width="19%">Thursday</th>
				<th width="19%">Friday</th>
			</tr>
<?php

//Helper function for writing the default empty schedule. Subsequent redraws of the schedule are found in include/schedManager.js.
//NOTE: It may be preferable to use the code in schedManager.js for displaying the default empty schedule. TODO: make that change.
function writeTableRow($time) {
	echo '
		<tr valign="top">
			<td align="right" nowrap>' . $time . '</td>
			<td>&nbsp;</td>
			<td>&nbsp;</td>
			<td>&nbsp;</td>
			<td>&nbsp;</td>
			<td>&nbsp;</td>
		</tr>
	';
}

/* $n is the number to use when referring to this "search/results" box. */
function printSearchResults($n) {
	echo "
<!--SEARCH/RESULTS ".$n."-->
<div id='searchResults".$n."' id='tab-sr-".$n."'>
	<div class='tabs-holder' id='tab-sr-".$n."'>
		<div id='sr-search-".$n."' class='curTab'><a onclick=\"paramArray['tab-sr-".$n."'].setCurTab('sr-search-".$n."');hideDiv('results".$n."');showDiv('search".$n."');\">Search</a></div>
		<div id='sr-results-".$n."' class='tabs'><a onclick=\"paramArray['tab-sr-".$n."'].setCurTab('sr-results-".$n."');hideDiv('search".$n."');showDiv('results".$n."');\">Results</a></div>
		<form name='scheds".$n."'>
			<div id='schedChooser'>
				Apply to schedules:&nbsp;1<input type=checkbox checked name='sched' />&nbsp;2<input type=checkbox name='sched' />&nbsp;3<input type=checkbox name='sched' />&nbsp;4<input type=checkbox name='sched' />
			</div>
		</form>
	</div>
	<div id='search".$n."'>
		<form class='searchResults'>
			<select name='instructor'>";
				printInstructors(); echo "
			</select><br />
			<select name='department'>";
				printDepartments(); echo "
			</select><br />
			Course Number:<br />
			<input type='text' maxlength='3' size='4' name='courseNumber' />&nbsp;<small>Example 101</small><br />
			Start Time:<br />
			<input type='text' maxlength='4' size='4' name='startTime' />&nbsp;<small>24 hour time, such as 1400</small><br />
			<select name='coreFulfillment'>";
				printCores(); echo "
			</select><br />
			<input type='reset'  value='Clear'  onmousemove=\"cursor('<em>Clears</em> current search terms')\"  onmouseout='hideCursor()' />
			<input type='button' value='Submit' onmousemove=\"cursor('<em>Submits</em> current search terms')\" onmouseout='hideCursor()'
												onclick=\"submitQuery('', instructor.value, department.value, courseNumber.value, startTime.value, coreFulfillment.value, 'queryResults".$n."', '".$n."');
														  paramArray['tab-sr-".$n."'].setCurTab('sr-results-".$n."');hideDiv('search".$n."');showDiv('results".$n."');\" /> <!-- NOTE: Add year back in possibly.. -->
		</form>
	</div>
	<div id='results".$n."' style='display: none;'>
		<div id='queryResults".$n."'>
			<table id='results'>
				<tbody>
					<tr>
						<td><br/>
							<b>Please click the 'Submit' button from the 'Search' tab to make your search.</b><br/>&nbsp;
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</div>
";
}
?>

<?php
//Build the default empty schedule
for ($i = 0; $i < 10; $i++) {
	if ((8 + $i) < 10) {
		writeTableRow("0". (8 + $i) . "00");
		writeTableRow("0". (8 + $i) . "30");
	} else {
		writeTableRow((8 + $i) . "00");
		writeTableRow((8 + $i) . "30");
	}
}
?>

		</tbody>
	</table>
</div>

<?php
include 'db/searchOptions.php'; //Include the necessary db functions used by printSearchResults

include 'db/configdb.php';
include 'db/opendb.php';

/* Prints both 'search/results' boxes, each with their own identifier number. */
printSearchResults(1);
printSearchResults(2);

include 'db/closedb.php';
?>

</body>
</html>
