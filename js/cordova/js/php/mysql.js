var MysqlInterface = {};
function query($cmd, aCallback, aProgressCallback) {
	//$numRows, $affectedRows
	MysqlInterface.aCallback = aCallback;
	MysqlInterface.aProgressCallback = aProgressCallback;
	var $link, $lCmd, $insert, $dberror, $dbaffectedrows, $dbnumrows, $res, $data, $row, $rec, $k, $i, $id;
	$link = setConnection();
	$lCmd = strtolower($cmd);
	$insert = 0;
	if (strpos($lCmd, 'insert') === 0) {
		$insert = 1;
		MysqlInterface.insert = 1;
	}
	window.$dberror; 
	window.$dbaffectedrows; 
	window.$dbnumrows;
	
	mysql_query($cmd, onMysqlResult, onMysqlProgress);
	
}
function onMysqlProgress(n, part) {
	//console.log(MysqlInterface.aProgressCallback);
	MysqlInterface.aProgressCallback[1].call(MysqlInterface.aProgressCallback[0], n, part);
}
function onMysqlResult(dberror, numRows, $affectedRows, $rows, insertId) {
	var $data = [];
	window.$dberror = dberror;
	var $dbnumrows = numRows, i = 0;
	
	if ($dbnumrows) {
		$row = $rows[i];
		while ($row) {
			$rec = array();
			for ($k in $row) { $i = $row[$k];				
				if (strval(intval($k)) != strval($k)) {
					$rec[$k] = //html_entity_decode($i, ENT_QUOTES);
					$rec[$k] = $i;//html_entity_decode($rec[$k], ENT_QUOTES);
				}
			}
			$data.push($rec);
			i++;
			$row = $rows[i];
		}
	}
	window.$dbaffectedrows = $affectedRows;
	if (MysqlInterface.insert) {
		//mysql_close($link);
		//MysqlInterface.aCallback[0][ MysqlInterface.aCallback[1] ](insertId);
		MysqlInterface.aCallback[1].call(MysqlInterface.aCallback[0], insertId);
	}
	//mysql_close($link);
	//console.log($rows);
	//console.log(MysqlInterface.aCallback);
	MysqlInterface.aCallback[1].call(MysqlInterface.aCallback[0], $data, numRows, $affectedRows, dberror);
}
function setConnection() {
	var $link;
	$link = mysql_connect(DB_HOST, DB_USER, DB_PASSWORD) || Error('Error connect to mysql');
	mysql_select_db(DB_NAME) || Error('Error select db ' + DB_NAME);
	return $link;
}

