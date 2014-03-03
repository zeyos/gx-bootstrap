<?php

$data = json_decode(file_get_contents('select.json'), true);

$res = array();

if (isset($_REQUEST['query']) || $_REQUEST['query'] != '') {
	$reg = '/'.preg_quote($_REQUEST['query']).'/i';
	foreach ($data as $row) {
		if (preg_match($reg, $row['name']) || preg_match($reg, $row['number'])) {
			$res[] = $row;
		}
	}
}

header('Content-type: application/json; charset=UTF-8');
echo json_encode($res);

?>
