<?php
function main() {
	$wKey = fopen(__DIR__ . '/daldata.txt', 'r');
	$wOut = fopen(__DIR__ . '/daldata_parsed.txt', 'w');
	$n = 0;
	$head = '';
	while (!feof($wKey)) {
		$line = readLine($wKey, $head);
		fwrite($wOut, $line . "\n");
	}
	fclose($wOut);
	fclose($wKey);
}

function readLine($wKey, &$head) {
	$s = $head;
	$i = 0;
	while (true) {
		if (feof($wKey)) {
			return $s;
		}
		$q = fgets($wKey);
		$q = str_replace("\r\n", '', $q);
		echo $q . "\n\n";
		if (strlen($q) > 3 && $q[0] == ' ' && $q[1] == ' ' && $q[2] == ' ') {
			$ch = $q[3];
			$cCh = mb_strtoupper($ch, 'Windows-1251');
			if ($ch == $cCh) {
				$head = $q;
				return $s;
			}
		}
		$s .= $q;
		$i++;
		if ($i > 1000) {
			echo "ALARM MESSAGE\n]n";
			die;
		}
	}
	return $s;
}

main();


/*CREATE TABLE IF NOT EXISTS `sts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `word` varchar(128) DEFAULT NULL,
  `description` text,
  PRIMARY KEY (`id`),
  KEY `word` (`word`)
) ENGINE=MyISAM  DEFAULT CHARSET=cp1251 ;*/
