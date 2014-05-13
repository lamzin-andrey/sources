<?php
function db_cache_table_struct($tableName, $fileName){
	$res   = mysql_query("SELECT * FROM $tableName LIMIT 0, 1");
	if ( mysql_error() ) {
	    echo "Data Source <br>
	    $tableName
	    <br>
	    was not found
	    <br>
	    Mysql Error:<br>
	    <hr>
	    " . mysql_error()."<hr>";
	    die;
	}
	$data  = array("fields"=>array(), "aliases"=>array());
	$cache = array();
	for ($i = 0; $i < mysql_num_fields($res); $i++) {
		$key    = mysql_field_name($res, $i);
		$type   = mysql_field_type($res, $i);
		$len    = mysql_field_len($res, $i);
		$alias  = utils_get_alias($cache, $len);
		$row    = array("field"=>$key, "type"=>$type, "length"=>$len, "alias"=>$alias);
		$data["fields"][$key]    = $row;
		$data["aliases"][$alias] = $row;		
	}
	$s = serialize($data);
	file_put_contents($fileName, $s);
}

function query($cmd, &$numRows = 0, &$affectedRows = 0) {
	$lCmd = strtolower($cmd);
	$insert = 0;
	if (strpos($lCmd, 'insert') === 0) {
		$insert = 1;
	}
	global $dberror; 
	global $dbaffectedrows; 
	global $dbnumrows;
	$res = mysql_query($cmd);
	$data = array();
	$dberror = mysql_error();
	if ($dberror) {
		var_dump($dberror); echo "\n<hr>\n$cmd<hr>\n";
		return $data;
	}
	$numRows = $dbnumrows = @mysql_num_rows($res);
	if ($dbnumrows ) {
		while ($row = mysql_fetch_array($res)) {
			$rec =array();
			foreach ($row as $k=>$i) {				
				if (strval((int) $k) != strval($k)) {
					$rec[$k] = htmlspecialchars_decode($i);
				}
			}
			$data[] = $rec;
		}
	}
	$affectedRows = $dbaffectedrows = mysql_affected_rows();
	if ($insert) {
		return mysql_insert_id(); 
	}
	return $data;
}
function dbrow($cmd, &$numRows = null) {
	$data = query($cmd, $numRows);
	if ($numRows) {
		return $data[0];
	}
	return array();
}
function dbvalue($cmd) {
    $res = mysql_query($cmd);
    if (@mysql_num_rows($res) != 0) {
    	return mysql_result($res, 0, 0);
    }
    return false;
}
?>
