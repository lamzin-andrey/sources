 <?php
  
// require_once DR . "/controls/classes/clist.php";
 
 class CRegions  {
 	public $data = array();
 	public $wordsOnLetter = 5;
 	
 	private $_bread_crumbs = array();
 	
 	public function __construct() {
 		$this->_bread_crumbs = array('/regions' => 'Регионы');
 		$sql = "SELECT id, region_name, codename, delta FROM regions WHERE country = 3 AND is_deleted = 0 ORDER BY region_name";
 		$rows = query($sql);
 		$data = array();
 		foreach ($rows as $row) {
 			$ch = mb_substr($row['region_name'], 0, 1, 'UTF-8');
 			$ch = mb_strtoupper($ch, 'UTF-8');
 			$data[$ch][] = $row;
 		}
 		$this->data = $data;
 		$this->setLetter();
 	}
 	
 	/**
 	 *@desc  Читает первые две или одну букву после /regions/буква(ы)/ перезаписывает в data data[$ch] 
 	 *@param 
 	 *@return
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
 						break;
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
