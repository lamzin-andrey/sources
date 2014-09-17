 <?php
  
// require_once DR . "/controls/classes/clist.php";
 
 class CRegions  {
 	public  $data = array();
 	public  $wordsOnLetter = 5;
 	public  $isRegionInner = false;
 	public  $regionInnerName = '';
 	private $_defaultWordsOnLetter = 5;
 	
 	private $_bread_crumbs = array();
 	
 	public function __construct() {
 		$this->_bread_crumbs = array('/regions' => 'Регионы');
 		$sql = "SELECT id, region_name, codename, delta, is_city FROM regions WHERE country = 3 AND is_deleted = 0 ORDER BY region_name";
 		$rows = query($sql);
 		$data = array();
 		foreach ($rows as $row) {
 			$ch = mb_substr($row['region_name'], 0, 1, 'UTF-8');
 			$ch = mb_strtoupper($ch, 'UTF-8');
 			$data[$ch][] = $row;
 		}
 		$this->data = $data;
 		if (!$this->setLetter() ) {
 			if ($this->_setCity() ) {
 				$this->_setCityLetter();
 			}
 		}
 	}
 	/**
 	 *@desc  Пытается найти имя города после regions 
 	 *@param 
 	 *@return
 	**/
 	private function _setCity() {
 		$url = $_SERVER['REQUEST_URI'];
 		$a = explode('/', $url);
 		if (count($a) > 2 ) {
 			$s = $a[2];
 			if ($reg_id = $this->_checkRegion($s, $region_name)) {
 				$sql = "SELECT id, city_name AS region_name, codename, delta, 0 AS is_city FROM cities WHERE country = 3 AND region = {$reg_id} AND is_deleted = 0 ORDER BY city_name";
 				$rows = query($sql);
 				foreach ($rows as $row) {
		 			$ch = mb_substr($row['region_name'], 0, 1, 'UTF-8');
		 			$ch = mb_strtoupper($ch, 'UTF-8');
		 			$data[$ch][] = $row;
		 		}
		 		$this->data = $data;
		 		$this->wordsOnLetter = $this->_defaultWordsOnLetter;
		 		$bc_url = end(array_keys($this->_bread_crumbs));
		 		$this->_bread_crumbs["{$bc_url}/{$s}"] = $region_name;
		 		$this->isRegionInner = true;
		 		$this->regionInnerName = "{$s}/";
		 		return true;
 			}
 		}
 		return false;
 	}
 	/**
	 * @desc
 	 * @param $region_codename
 	 * @return 
 	**/
 	private function _checkRegion($region_codename, &$region_name) {
 		$query = "SELECT id, region_name FROM regions WHERE country = 3 AND codename = '{$region_codename}' AND is_city = 0";
 		$row = dbrow($query);
 		if (count($row)) {
 			$region_name = $row['region_name'];
 			return $row['id'];
 		}
 		return false;
 	}
 	/**
 	 *@desc  Читает первые две или одну букву после /regions/буква(ы)/ перезаписывает в data data[$ch] 
 	 *@param 
 	 *@return bool true если найдена буква после regions
 	**/
 	private function setLetter() {
 		$url = $_SERVER['REQUEST_URI'];
 		$a = explode('/', $url);
 		if (count($a) > 2 ) {
 			$s = $a[2];
 			if (strlen($s) < 3) {
 				foreach ($this->data as $key => $item) {
 					if ( utils_translite_url( utils_cp1251($key) ) == $s) {
 						$this->data = array($key => $item);
 						$this->wordsOnLetter = 3000000;
 						$this->_bread_crumbs = array('/regions' => 'Регионы', "/regions/{$s}" => $key);
 						return true;
 					}
 				}
 			}
 		}
 		return false;
 	}
 	/**
 	 *@desc  Читает первые две или одну букву после /regions/имя_региона/буква(ы)/ перезаписывает в data data[$ch] 
 	 *@param 
 	**/
 	private function _setCityLetter() {
 		$url = $_SERVER['REQUEST_URI'];
 		$a = explode('/', $url);
 		if (count($a) > 3 ) {
 			$s = $a[3];
 			if (strlen($s) < 3) {
 				foreach ($this->data as $key => $item) {
 					if ( utils_translite_url( utils_cp1251($key) ) == $s) {
 						$this->data = array($key => $item);
 						$this->wordsOnLetter = 3000000;
 						//$this->_bread_crumbs = array('/regions' => 'Регионы', "/regions/{$s}" => $key);
 						$bc_url = end(array_keys($this->_bread_crumbs));
		 				$this->_bread_crumbs["{$bc_url}/{$s}"] = $key;
 					}
 				}
 			}
 		}
 	}
 	/**
 	 *@desc
 	 *@param
 	 *@return
 	**/
 	public function breadCrumbs() {
 		$a = $this->_bread_crumbs;
 		$i = 0;
 		$links = array();
 		foreach ($a as $link => $text) {
 			if ($i < count($a) - 1) {
 				$links[] = '<a href="' . $link . '">' . $text . '</a>';
 			} else {
 				$links[] = '<span >' . $text . '</span>';
 			}
 			$i++;
 		}
 		$s = join(' / ', $links);
 		return $s;
 	}
 }

$regions = new CRegions();
