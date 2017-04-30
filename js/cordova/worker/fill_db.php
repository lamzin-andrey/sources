<?php
require_once __DIR__ . '/../mysql.php';
require_once __DIR__ . '/../config.php';
function main() {
	$hKey = fopen(__DIR__ . '/sts.txt', 'r');
	$wKey = fopen(__DIR__ . '/data.txt', 'r');
	$n = 0;
	while (!feof($hKey)) {
		$key  = fgets($hKey);
		$word = fgets($wKey);
		if (trim($key)) {
			$key  = str_replace('\'', '`', trim($key));
			$word = str_replace('\'', '`', $word);
			$sql = "INSERT INTO sts (`word`, `description`) VALUES ('{$key}', '{$word}')";
			
			query($sql);
			echo $n . "\n";
			$n++;
		}
	}
	fclose($hKey);
	fclose($wKey);
}
main();


/*CREATE TABLE IF NOT EXISTS `sts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `word` varchar(128) DEFAULT NULL,
  `description` text,
  PRIMARY KEY (`id`),
  KEY `word` (`word`)
) ENGINE=MyISAM  DEFAULT CHARSET=cp1251 ;*/
