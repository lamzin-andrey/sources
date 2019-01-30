<?php
// Принимает string аргумент обозначающий хост..пользователь..пароль..имя_базы..имя_таблицы
// Принимает int аргумент обозначающий размер части таблицы которая будет в одном json файле
// по умолчанию - 10000
require_once __DIR__ . '/../mysql.php';
require_once __DIR__ . '/../utils.php';
function main($argv) {
	$configStr = isset($argv[1]) ? $argv[1] : 0;
	if (!$configStr) {
		echo 'usage: php tojson.php localhost..root..password..db..table [partsize]' . "\n";
		return;
	}
	if (connect($configStr, $host, $user, $password, $db, $table)) {//TODO
		$limit = isset($argv[2]) ? $argv[2] : 10000;
		$offset = 0;
		$sql = "SELECT * FROM {$table} ORDER BY id LIMIT {$offset}, {$limit}";
		$rows = query($sql);
		$n = 0;
		while (sz($rows)) {
			$iData = [];
			foreach ($rows as $row) {
				$iData[$row['id']] = prepareRow($row);
			}
			/*print_r($iData);
			die;/**/
			$file = __DIR__ . '/db/' . $table . '.part' . $n . '.js';
			file_put_contents($file, 'var rawdbdata=' . json_encode($iData) . ';');
			
			$n++;
			$offset += $limit;
			$sql = "SELECT * FROM {$table} ORDER BY id LIMIT {$offset}, {$limit}";
			$rows = query($sql);
		}
	} else {
		echo "Unable connect to {$host} with  {$user} and {$password}, or db {$db} not exists, or not containt table {$table}\n";
		return;
	}
}
function prepareRow($row) {
	$pairs = '{"pairs":{"0":"\u0430","1":"\u0431","2":"\u0432","3":"\u0433","4":"\u0434","5":"\u0435","6":"\u0451","7":"\u0436","8":"\u0437","9":"\u0438","a":"\u0439","b":"\u043a","c":"\u043b","d":"\u043c","e":"\u043d","f":"\u043e","g":"\u043f","h":"\u0440","i":"\u0441","j":"\u0442","k":"\u0443","l":"\u0444","m":"\u0445","n":"\u0446","o":"\u0447","p":"\u0448","q":"\u0449","r":"\u044a","s":"\u044b","t":"\u044c","u":"\u044d","v":"\u044e","w":"\u044f"}}';
	$aPairs = json_decode($pairs, true);
	$aPairs = $aPairs['pairs'];
	$buf = [];
	foreach ($aPairs as $n => $v) {
		$buf[$v] = $n;
	}
	$aPairs = $buf;
	foreach ($row as $key => $item) {
		$row[$key] = _encode($item, $aPairs);
	}
	return $row;
}
/**
 * Если символ не найден в $aPairs и это десятичная цифра или латинский символ, возвращает xN где N - число
 * Если символ не найден в $aPairs но его нижний регистр найден, возвращает yN где N - код в aPairs
 * Если символ не найден в $aPairs возвращает его в utf8
*/
function _encode($s, $aPairs){
	$s = mb_convert_encoding($s, 'UTF-8', 'Windows-1251');
	$sz = sz($s, 'UTF-8');
	$r = '';
	for ($i = 0; $i < $sz; $i++) {
		$ch = mb_substr($s, $i, 1, 'UTF-8');
		if (isset($aPairs[$ch])) {
			$r .= $aPairs[$ch];
		} else {
			if (strpos('0123456789abcdefghijklmnopqrstuvwxyz', $ch) !== false) {
				$r .= 'x' . $ch;
			} else {
				$lch = mb_strtolower($ch, 'UTF-8');
				if (isset($aPairs[$lch])) {
					$r .= 'y' . $aPairs[$lch];
				} else {
					$r .= $ch;
				}
			}
		}
	}
	return $r;
}
function connect($s, &$host, &$user, &$password, &$db, &$table) {
	$a = explode('..', $s);
	$host = isset($a[0]) ? $a[0] : '';
	$user = isset($a[1]) ? $a[1] : '';
	$password = isset($a[2]) ? $a[2] : '';
	$db = isset($a[3]) ? $a[3] : '';
	$table = isset($a[4]) ? $a[4] : '';
	
	define('DB_HOST', $host);
	define('DB_USER', $user);
	define('DB_PASSWORD', $password);
	define('DB_NAME', $db);
	$v = dbvalue("SELECT id FROM {$table} LIMIT 1");
	global $dberror;
	if ($dberror){
		echo "$dberror\n";
	}
	if (!$v) {
		return false;
	}
	return true;
}
main($argv);
