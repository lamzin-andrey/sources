<?
class CRequestPatcher {
	static private $bind = array( 1 => 43, 2 => 39, 3 => 25, 4 => 56, 5 => 60, 6 => 36,
								  7 => 45, 8 => 50, 9 => 54, 10 => 65, 17 => 76, 128 => 153,
								  129 => 154, 130 => 143, 131 => 155, 132 => 148,
								  133 => 150, 134 => 151, 136 => 164, 137 => 159,
								  138 => 161, 208 => 76
								);
  
	static public function move302() {
		$b = self::$bind;
		if ( a($b,  a($_GET, 'city')) && $b[ a($_GET, 'city') ] == a($_GET, 'region')) {
			$_GET['region'] = $_GET['city'];
			$_GET['city'] = 0;
			$data = array();
			foreach ($_GET as $k => $i) {
				$data[] = "$k=$i";
			}
			$tail = join('&', $data);
			//echo("/?$tail<br>");
			utils_302("/?$tail");
			exit;
		}
	}
	/**
	 * @desc
	 * **/
	static public function pathPost() {
		$b = self::$bind;
		if ( a($b,  a($_POST, 'city')) && $b[ a($_POST, 'city') ] == a($_POST, 'region')) {
			$_POST['region'] = $_POST['city'];
			$_POST['city'] = 0;
		}
	}
}