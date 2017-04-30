<?php
require_once __DIR__ . '/../../mysql.php';
require_once __DIR__ . '/../../config.php';
function main() {
	$wKey = fopen(__DIR__ . '/daldata_parsed.txt', 'r');
	$n = 0;
	while (!feof($wKey)) {
		//$key  = fgets($hKey);
		$word = fgets($wKey);
		$word = str_replace("\r\n", '', $word);
		$word = str_replace("\r", '', $word);
		$word = str_replace("\n", '', $word);
		$key = parseLine($word, $key); //получить слово и определение
		if (trim($key)) {
			$key  = str_replace('\'', '`', trim($key));
			$word = str_replace('\'', '`', $word);
			$sql = "INSERT INTO sts (`word`, `description`, `source`) VALUES ('{$key}', '{$word}', 'dal')";
			
			query($sql);
			//file_put_contents(__DIR__ . '/log.txt',  $sql . "\n", FILE_APPEND);
			echo $n . "\n";
			$n++;
		}
	}
	fclose($wKey);
}
function parseLine(&$word, &$key) {
	$m = mb_convert_encoding('м.', 'Windows-1251', 'UTF-8');
	$md = mb_convert_encoding('ср.', 'Windows-1251', 'UTF-8');
	$w = mb_convert_encoding('ж.', 'Windows-1251', 'UTF-8');
	
	$nM  = nF(strpos($word, $m));
	$nMd = nF(strpos($word, $md));
	$nW  = nF(strpos($word, $w));
	$nZ  = nF(strpos($word, ','));
	$n = min($nM, $nW, $nMd, $nZ);
	$key = substr($word, 0, $n);
	$word = substr($word, $n + 1);
	return $key;
}
function nF($v) {
	if ($v === false) {
		return 1000000;
	}
	return $v;
}
main();


/*CREATE TABLE IF NOT EXISTS `sts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `word` varchar(128) DEFAULT NULL,
  `description` text,
  PRIMARY KEY (`id`),
  KEY `word` (`word`)
) ENGINE=MyISAM  DEFAULT CHARSET=cp1251 ;*/
