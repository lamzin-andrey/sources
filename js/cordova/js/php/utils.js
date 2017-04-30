/**
 * @desc получить переменную из request
**/
function reqread($v, $varname) {
	$varname = $varname ? $varname : 'REQUEST';
	var $data, $_REQUEST;
	$data = $_REQUEST;
	switch ($varname) {
		case 'POST':
			$data = $_POST;
			break;
		case 'GET':
			$data = $_GET;
			break;
	}
	if (isset($data, $v)) {
		return $data[$v];
	}
	return null;
}
