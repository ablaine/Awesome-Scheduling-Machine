<?php
/**
 * This script does a database search for courses based on passed in constraints. It echo's the results in the form of a table.
 * Each class in the echoed table has a javascript 'onclick' function call that works with schedManager.js to build ClassInfo objects 
 * for the click class and add them to the schedules that are currently. This call also includes a number associated with which
 * results box (1 or 2) that this call is being made from. This allows schedManager.js to then ask that results box's checkbox form
 * which schedules are checked indicating which schedules the class should be added to.
 * 
 * Author: Andrew Blaine
 */
$i = $_GET["i"]; //Instructor
$d = $_GET["d"]; //Department
$cn = $_GET["cn"]; //Course Number
$s = $_GET["s"]; //Start Time
$cf = $_GET["cf"]; //Core Fulfillment
//$sr = $_GET["sr"]; //SearchResults (1 or 2)   //NOTE: Using $_GET["sr"] directly in code instead.

include 'configdb.php';
include 'opendb.php';

/**
 * Makes query to determine the default year/term.
 *
 * TO_DATE converts a string version of the date into one of Oracle's "DATE" objects.
 * There is no winter term, hence the "WHERE term <> 1".
 * We do not want to display a schedule which has not been given the OK to be displayed.
 */
$today = date("dmY");
$query = "SELECT year_term FROM (
			SELECT year_term FROM vw_year_term
			  WHERE term <> 1
			  AND start_date >= TO_DATE('" . $today . "', 'DDMMYYYY')
			  AND (schedule_ready <= TO_DATE('" . $today . "', 'DDMMYYYY')
			  	OR schedule_draft_ready <= TO_DATE('" . $today . "', 'DDMMYYYY'))
			  ORDER BY year_term)
		  WHERE ROWNUM=1";

$data = oci_parse($conn, $query);
oci_execute($data);
oci_fetch($data);
$yearTerm = oci_result($data, 'YEAR_TERM');
oci_free_statement($data);

/**
 * This builds a query to search for courses, limited by the passed in variables.
 * The main query works by building a nested query which gets all course offering id's for relevent courses. The outside query then gets 
 * all information that is associated with those course offereing id's. The inside query handles limiting the search based on passed
 * in paramaters. It uses paramater substitution to avoid SQL injection attempts.
 *
 */
$query = "
SELECT co.course_offering_id, co.dept_code, co.course_number, co.section_code, co.title, co.core_code, co.units, co.instructor,
  ct.days_times_loc, ct.days, ct.times
FROM vw_courses_offered co, vw_class_times ct
WHERE co.course_offering_id = ct.course_offering_id
AND co.course_offering_id IN
(
  SELECT co2.course_offering_id
  FROM vw_courses_offered co2, vw_course_instructor ci2, vw_class_times ct2
  WHERE co2.course_offering_id = ci2.course_offering_id
  AND co2.course_offering_id = ct2.course_offering_id
  AND co2.year_term=:year_term
";

if ($i != "") {
	$query .= " AND ci2.instructor_id=:instructor_id";
}
if ($d != "") {
	$query .= " AND co2.dept_code=:dept_code";
}
if ($cn != "") {
	$query .= " AND co2.course_number=:course_number";
}
if ($s != "") { //Not forcing it to be size == 4 allows for starttimes of "12" to be entered which will match more than just 1200 or 1230.
	$query .= " AND ct2.times LIKE :start_time";
	$s .= "%";
}
if ($cf != "") {
	$query .= " AND co2.core_code LIKE :core_ful";
	$cf = "%" . $cf . "%";
}

$query .= ") ORDER BY co.dept_code, co.course_number, co.section_code";
//echo "Query: " . $query;

$data = oci_parse($conn, $query);

/* Input Paramaters */
oci_bind_by_name($data, ":year_term", $yearTerm, 5, SQLT_INT);
oci_bind_by_name($data, ":instructor_id", $i, 5 , SQLT_INT);
oci_bind_by_name($data, ":dept_code", $d, 4, SQLT_CHR);
oci_bind_by_name($data, ":course_number", $cn, 3, SQLT_INT);
oci_bind_by_name($data, ":start_time", $s, 5, SQLT_CHR); //Allow 4 numbers to be put in, PLUS the % wildcard
oci_bind_by_name($data, ":core_ful", $cf, 4, SQLT_CHR); //Core fulfillment takes 2 chars PLUS a % wildcard on both sides

oci_execute($data);

/**
 * Now we build the table. Fill a class into the buffer array. If the next class has the same courseID, then buffer it's days, starting times and ending times.
 *
 */
echo "<table id='results'>";
echo "<tr>";
echo "<th>Course</th>";
echo "<th>Title</th>";
echo "<th>Core</th>";
echo "<th>Units</th>";
echo "<th>Days/Times</th>";
echo "<th>Instructor</th>";
echo "</tr>";

$buff = array('courseID'=>"", 'course'=>"", 'title'=>"", 'core'=>"", 'units'=>"", 'daysTimesLoc'=>"", 'days'=>"", 'sTimes'=>"", 'eTimes'=>"", 'instructor'=>"");
$buff2 = array('days'=>"", 'sTimes'=>"", 'eTimes'=>"");
$courseID2 = "";
$twoClasses = False;

function addClassInfo($title, $days, $startTimes, $endTimes, $course, $instructor, $courseID) {
	return "new classinfo('" . $title . "', '" . $days . "', '" . $startTimes . "', '" . $endTimes . "', '" . $course . "', '" . $instructor . "', '" . $courseID . "')";
}

function addClassToScheds() {
	global $buff, $buff2, $twoClasses;

	$string = "addClassToScheds([" . addClassInfo($buff['title'], $buff['days'], $buff['sTimes'], $buff['eTimes'], $buff['course'], $buff['instructor'], $buff['courseID']);
		if ($twoClasses) {
			$string .= ", " . addClassInfo($buff['title'], $buff2['days'], $buff2['sTimes'], $buff2['eTimes'], $buff['course'], $buff['instructor'], $buff['courseID']);
		}
	$string .= "], '" . $_GET["sr"] . "');"; //sr is identifying which searchResults this class came from so we can determine which schedules to apply the class to.

	return $string;
}

function flushBufferedCourse() {
	global $buff, $buff2;

	echo "<tr>";
	echo "<td>" . $buff['course'] . "</td>";
	echo "<td><a onclick=\"" . addClassToScheds() . " \" >" . $buff['title'] . "</a></td>";
	echo "<td>" . $buff['core'] . "</td>";
	echo "<td>" . $buff['units'] . "</td>";
	echo "<td><tt>" . $buff['daysTimesLoc'] . "</tt></td>";
	echo "<td>" . $buff['instructor'] . "</td>";
	echo "</tr>";
}

function bufferCourse($data) {
	global $buff;

	$buff['courseID'] = oci_result($data, 'COURSE_OFFERING_ID');
	$buff['course'] = oci_result($data, 'DEPT_CODE') . oci_result($data, 'COURSE_NUMBER') . oci_result($data, 'SECTION_CODE');
	$buff['title'] = oci_result($data, 'TITLE');
	$buff['core'] = oci_result($data, 'CORE_CODE');
	$buff['units'] = oci_result($data, 'UNITS');
	$buff['daysTimesLoc'] = oci_result($data, 'DAYS_TIMES_LOC');
	$buff['days'] = oci_result($data, 'DAYS');
	$times = explode("-", oci_result($data, 'TIMES'));
	$buff['sTimes'] = $times[0];
	$buff['eTimes'] = $times[1];
	$buff['instructor'] = oci_result($data, 'INSTRUCTOR');
}

if (oci_fetch($data)) { //Fill buffer with a class
	bufferCourse($data);
 	while (oci_fetch($data)) { //If none, go ahead and print the current course.
		//Find out the next course
		$courseID2 = oci_result($data, 'COURSE_OFFERING_ID');
		//If it is the same as the last one, then edit the daysTimesLoc with the extra times.
		if (strcmp($buff['courseID'], $courseID2) == 0) {
			$buff['daysTimesLoc'] .= "<br />" . oci_result($data, 'DAYS_TIMES_LOC');
			$buff2['days'] = oci_result($data, 'DAYS');
			$times = explode("-", oci_result($data, 'TIMES'));
			$buff2['sTimes'] = $times[0];
			$buff2['eTimes'] = $times[1];
			$twoClasses = True;
		} else { //Print out what we had, and fill buffer again
			flushBufferedCourse();
			$twoClasses = False;
			bufferCourse($data);
 		}
	} //Flush the last buffered class
	flushBufferedCourse();
} else {
	echo "<tr>";
		echo "<td colspan=6>";
			echo "<br />
				  <b>No courses found. Please refine your search criteria and try again.</b>
				  <br />&nbsp;";
		echo "</td>";
	echo "</tr>";
}
oci_free_statement($data);

echo "</table>";

include 'closedb.php';

?>
