<?php
/**
 * This file holds the functions necessary for making queries to the database and printing the results between <option> tags.
 * 
 * Author: Andrew Blaine
 */

/** Prints all the instructor options */
function printInstructors() {
	global $conn;

	echo '<option value="">&lt;Instructor&gt;</option>';
	$query = "SELECT instructor_id, last_name, first_name FROM vw_instructor WHERE current_instructor='Y' ORDER BY last_name";
	$data = oci_parse($conn, $query);
	oci_execute($data);

	while (oci_fetch($data)) {
		echo '<option value="' . oci_result($data, 'INSTRUCTOR_ID') . '">' . ucwords(strtolower(oci_result($data, 'LAST_NAME') . ', ' . oci_result($data, 'FIRST_NAME'))) . "</option>\n";
	}
	oci_free_statement($data);
}

/** Prints all the department options */
function printDepartments() {
	global $conn;
	echo '<option value="">&lt;Department&gt;</option>';
	$query = "SELECT dept_code, dept_name FROM vw_reg_dept WHERE current_dept='Y' ORDER BY dept_code";
	$data = oci_parse($conn, $query);
	oci_execute($data);

	while (oci_fetch($data)) {
		echo "<option value='" . oci_result($data, 'DEPT_CODE') . "'>" . oci_result($data, 'DEPT_NAME') . "</option>\n";
	}
	oci_free_statement($data);
}

/** Helper function for printing out core fulfillment options */
function printCoreSet($num) {
	global $conn;
	$query = "SELECT core_code, description FROM vw_core_requirement WHERE core_set_id=" . $num . " ORDER BY report_order";
	$data = oci_parse($conn, $query);
	oci_execute($data);
	while (oci_fetch($data)) {
		echo "<option value='" . oci_result($data, 'CORE_CODE') . "'>" . oci_result($data, 'CORE_CODE') . "-" . oci_result($data, 'DESCRIPTION') . "</option>\n";
	}
	oci_free_statement($data);
}

/** Prints all the core fulfillment options. */
function printCores() {
	echo '<option value="">&lt;Core Fulfillment&gt;</option>';
	printCoreSet(3);
	echo '<option value=""></option>';
	printCoreSet(2);
}
?>
