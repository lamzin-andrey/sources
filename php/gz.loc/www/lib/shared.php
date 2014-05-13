<?php

class Shared {
	static public function preparePhone($phone) {
		$phone = trim($phone);
		$plus = 0;
		if ($phone[0] == '+') {
			$plus = 1;
		}
		$s = trim(preg_replace("#[\D]#", "", $phone));
		if ($plus && strlen($s) > 10) {
			$code = substr($s, 0, strlen($s) - 10 );
			$tail = substr($s, strlen($s) - 10 );
			$code++;
			$s = $code . $tail;
		} elseif($plus) {
			$s = '';
		}
		return $s;
	}
	static public function prepareItem(&$r) {
		$r["type"] = array();
		if ($r["box"] == 1) {
			$r["type"][] = "грузовая";
		}
		if ($r["people"] == 1) {
			$r["type"][] = "пассажирская";
		}
		if ($r["term"] == 1) {
			$r["type"][] = "термобудка";
		}
		$r["type"] = join(", ", $r["type"]);
		$r["type"] = Shared::up1st($r["type"]);
		
		$r["distance"] = array();
		if ($r["near"] == 1) {
			$r["distance"][] = "по городу";
		}
		if ($r["far"] == 1) {
			$r["distance"][] = "межгород";
		}
		if ($r["piknik"] == 1) {
			$r["distance"][] = "за город (пикник)";
		}
		$r["distance"] = join(", ", $r["distance"]);
		$r["distance"] = Shared::up1st($r["distance"]);
		
		$r["viewphone"] = Shared::formatPhone($r['phone']);
		$r["created"] = Shared::formatDate($r['created']);
		global $baseUrl;
		$r["link"] = "$baseUrl/" . $r["codename"] . "/" . $r["id"];
		if ($baseUrl == '') {
			$bu = "";
			$bu = self::loadLocationByAbvId($r["id"]);
			$r["link"] = "$bu/" . $r["codename"] . "/" . $r["id"];
		}
		
	}
	
	static private function loadLocationByAbvId($id) {
		$id = (int)$id;
		if (!@$_SESSION["locs"][$id]) {
			$cmd = "SELECT r.codename AS rc, c.codename AS cc FROM main
				LEFT JOIN regions AS r ON r.id = main.region 
				LEFT JOIN cities AS c ON c.id = main.city
				WHERE main.id = $id 
			";
			$row = dbrow($cmd, $nr);
			if ($nr) {
				if (strlen($row['cc']) && strlen($row['rc'])) {
					$_SESSION["locs"][$id] = $s = "/{$row['rc']}/{$row['cc']}";
				} else if( strlen($row['rc']) ) {
					$_SESSION["locs"][$id] = $s = "/{$row['rc']}";
				}
			}
		}
		return @$_SESSION["locs"][$id];
	}
	
	static public function modCityName($s) {
		if ($s == "Марий Эл") return $s;
		$s = trim($s);
		$g = "аеёиоуыэюя";
		$sg = "бвгджзйклмнпрстфхцчшщъь";
		$g = utils_cp1251($g);
		$sg = utils_cp1251($sg);
		$s = utils_cp1251($s);
		
		if (strpos($s, ' ') !== false) {
			$ar = explode(' ', $s);
			$first = str_replace(
				array( utils_cp1251("ой "), utils_cp1251("ая "),  utils_cp1251("ое "), utils_cp1251("ый "), utils_cp1251("ие "), utils_cp1251("ые "), utils_cp1251("кий "), utils_cp1251("ий "),  ),
				array( utils_cp1251("ом "), utils_cp1251("ой "), utils_cp1251("ом "), utils_cp1251("ом "), utils_cp1251("их "), utils_cp1251("ых "), utils_cp1251("ком "),  utils_cp1251("ем ") ),
				$ar[ count($ar) - 2] . ' '
			);
			$second = $ar[ count($ar) - 1];
			if ($second == utils_cp1251("Яр")) return utils_utf8($s);
			self::modLastLetter($second, $sg);
			$s = utils_utf8(trim($first)) . ' ' . utils_utf8($second); 
		} else {
			self::modLastLetter($s, $sg);
			$s = utils_utf8($s);
		}
		return $s;
	}
	
	static private function modLastLetter(&$second, $sg) {
		$secondSRep = 0;
		$lastLetter = $second[ strlen($second) - 1];
		$preLastLetter = $second[ strlen($second) - 2];
		$msog = utils_cp1251( "нл" );
		if ( strpos($sg, $lastLetter) === false ) {
			if ($lastLetter == utils_cp1251('е')) {
				$secondSRep = 1;
				$second = str_replace(
					array( utils_cp1251("ае "),  utils_cp1251("ое "), utils_cp1251("ый "), utils_cp1251("ие "), utils_cp1251("ые ") ),
					array(utils_cp1251("ае"), utils_cp1251("ом"), utils_cp1251("ом"), utils_cp1251("их"), utils_cp1251("ых") ),
					$second . ' ',
					$cnt
				);
			}
			if ($lastLetter == utils_cp1251('а')) {
				$lastLetter = utils_cp1251('е');
			}
			if ($lastLetter == utils_cp1251('ы')) {
				$lastLetter = utils_cp1251('ах');
			}
			if ($lastLetter == utils_cp1251('и')) {
				if (strpos($msog, $preLastLetter) === false) {
					$lastLetter = utils_cp1251('ах');
				} else {
					$lastLetter = utils_cp1251('ях');
				}
			}
			if ($lastLetter == utils_cp1251('я') && $preLastLetter != utils_cp1251('а')) {
				$lastLetter = utils_cp1251('и');
			}
		} else { 
			if ($lastLetter == utils_cp1251('ь')) {
				if (strpos($msog, $preLastLetter) === false) {
					$lastLetter = utils_cp1251('и');
				} else {
					$lastLetter = utils_cp1251('е');
				}
			}else
			if ($lastLetter == utils_cp1251('й')) {
				$secondSRep = 1;
				$second = str_replace(
					array( utils_cp1251("ий "),  utils_cp1251("ай "), utils_cp1251("ый "), utils_cp1251("ой "), utils_cp1251("ей") ),
					array(utils_cp1251("ом"), utils_cp1251("ае"), utils_cp1251("ом"), utils_cp1251("ом"), utils_cp1251("ее") ),
					$second . ' '
				);
			}else {
				$lastLetter .= utils_cp1251('е');
			}
		}
		if (!$secondSRep) {
			if ( strlen($lastLetter) == 1 ) {
				$second[ strlen($second) - 1 ] = $lastLetter;
			} else {
				//$second[ strlen($second) - 1 ] = '';
				$second = substr($second, 0, strlen($second) - 1);
				$second .= $lastLetter;
			}
		}
		trim($second);
	}
	
	static public function formatPhone($s) {
		if (strlen($s) < 11) {
			return $s; 
		}
		$a = array();
		for ($i = strlen($s) - 1, $j = 1; $i > -1; $i--, $j++) {
			$a[] = $s[$i];
			if ($j == 2 || $j == 4 /*|| $j == 7 || $j == 10*/) {
				$a[] = '-';
			}
			if ($j == 10) {
				$a[] = '(';
			}
			if ($j == 7) {
				$a[] = ')';
			}
		}
		$s = join('', array_reverse($a));
		return $s;
	}
	
	static public function up1st($s, $enc = "utils_utf8") {
		if ($enc == "utils_utf8") {
			$s = utils_cp1251($s);
		}
		$first = substr($s, 0, 1);
		$tail = substr($s, 1);
		$first = mb_strtoupper($first, "Windows-1251");
		$s = "$first$tail";
		if ($enc == "utils_utf8") {
			$s = utils_utf8($s);
		}
		return $s;
	}
	
	/**
    * @desc 
    * @param
    * @param
    * @return
    **/
    static public function formatDate($r, $breakTime = false) {
    	if ($r == '0000-00-00 00:00:00' || !$r) return ' вчера';
    	$a = explode(" ", $r);
    	$_d = $d = @$a[0];
    	$t = @$a[1];
    	$d = explode("-", $d);
    	$d = join('.', array_reverse($d));
    	
    	$t = explode(":", $t);
    	unset($t[2]);
    	$r = $d;
    	
    	$now = explode(' ', now());
    	$now = $now[0];
    	
    	if ($_d == $now) {
    		$r = 'сегодня';
    	}
    	
    	if (!$breakTime) {
    	   $r .= " в " .join(':', $t);
    	}
        return $r;
    }
    /**
    * @desc 
    * @param
    * @param
    * @return
    **/
    static public function price($s) {
    	return utils_money($s);
    }
    /**
    * @desc Изменить значение переменной var в request_uri
    * @param string $var
    * @param string $val
    * @return string
    **/
    static public function setUrlVar($var, $val) {
    	$a = explode("?", $_SERVER["REQUEST_URI"]);
    	$base = $a[0];
    	$data = array();
    	$_GET[$var] = $val;
    	if ($val == 1) {
    		unset($_GET[$var]);
    	}
    	foreach ($_GET as $k => $i) {
    		$data[] = "$k=$i";
    	}
    	if (count ($_GET)) {
    		$base .= "?" . join('&', $data);
    	}
    	return $base;
    }
    /**
	 * @desc Удаляем xss sql
	 * */
    static public function deinject($s) {
    	$s = trim($s);
    	$words = array('select', 'insert', 'delete', 'drop', 'and', 'or', 'union', 'join', 'update', 'SELECT', 'INSERT', 'DELETE', 'DROP', 'AND', 'OR', 'UNION', 'JOIN', 'UPDATE');
		$replaces = array();
		foreach ($words as $w) {
			$replaces[] = '';
		}
		$s = str_replace($words, $replaces, $s);
		//xss
		$s = strip_tags($s, 'a');
		$s = preg_replace("#on[\S]+[\s]*=#", '', $s);
		$s = str_replace("'", '&quot;', $s);
		$s = mysql_real_escape_string($s);
		return trim($s);
    }
    
    static private function normalize(&$cname){
		$cname = substr($cname, 0, 128);
		$w = "abcdefghijklmnopqrstuvwxyz-_";
		$r = '';
		for ($i = 0; $i < strlen($cname); $i++) {
			if ( strpos($w, $cname[$i]) !== false) {
				$r .= $cname[$i];
			}
		}
		$cname = $r;
	}
	static public function getRegion($cname) {
		//normalize($cname);
		$cmd = "SELECT id FROM regions WHERE codename = '$cname'";
		$id = (int)dbvalue($cmd);
		return $id;
	}
	
	static public function getCity($cname) {
		//normalize($cname);
		$cmd = "SELECT id FROM cities WHERE codename = '$cname'";
		$id = (int)dbvalue($cmd);
		return $id;
	}
	
	static public function getTitle($id) {
		$id = (int)$id;
		$cmd = "SELECT codename FROM main WHERE id = $id";
		$title = dbvalue($cmd);
		return $title;
	}
    
	static public function getCityNameById($id) {
		$id = (int)$id;
		$cmd = "SELECT codename FROM cities WHERE id = $id";
		return dbvalue($cmd);
	}
	
	static public function getRegNameById($id) {
		$id = (int)$id;
		$cmd = "SELECT codename FROM regions WHERE id = $id";
		return dbvalue($cmd);
	}
}
