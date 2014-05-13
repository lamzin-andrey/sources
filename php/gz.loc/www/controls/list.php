 <?php
  
 require_once DR . "/controls/classes/clist.php";
 
 class CList extends CMainList {
 	public $limit = 20;
 	protected $itemInLine = 5;
 	
 	public $term = 0;
 	public $box = 0;
 	public $people = 0;
 	
 	public $near = 0;
 	public $far = 0;
 	public $piknik = 0;
 	
 	public function __construct() {
 		$_GET["country"] = 3;
 		$_POST["country"] = 3;
 		
 		$this->readGet();
 		$this->setFilter();
 		
 		parent::__construct();
 		parent::exec();
 		if (!$this->numRows) {
 			//UPDATE STAT
 			$region = (int)@$_GET["region"];
 			$country = (int)@$_GET["country"];
 			$city = (int)@$_GET["city"];
 			$cmd = "INSERT INTO stat (country, region, city, cnt) VALUES ($country, $region, $city, 1) ON DUPLICATE KEY UPDATE cnt = cnt + 1";
 			query($cmd);
 		}
 	}
 	
 	private function readGet() {
 		if (@$_POST["ajax"] == 1 && @$_POST["xhr"] == 1) {
 			$_GET["page"] = (int)@$_POST["page"];
 			$_GET["region"] = (int)@$_POST["region"];
 			$_GET["city"] = (int)@$_POST["city"];
 			$_GET["people"] = (int)@$_POST["people"];
 			$_GET["box"] = (int)@$_POST["box"];
 			$_GET["term"] = (int)@$_POST["term"];
 			$_GET["far"] = (int)@$_POST["far"];
 			$_GET["piknik"] = (int)@$_POST["piknik"];
 			/*echo "<pre>";
 			print_r($_GET);
 			echo "</pre>";
 			die (__FILE__ . ", " . __LINE__); /**/
 		}
 		
 		$d = $_GET;
 		$this->term = (int)$d["term"];
 		$this->box = (int)$d["box"];
 		$this->people = (int)$d["people"];
 		
 		$this->near = (int)$d["near"];
 		$this->far = (int)$d["far"];
 		$this->piknik = (int)$d["piknik"];
 	}
 	
 	private function setFilter() {
 		$d = $_GET;
 		/*echo "<pre>";
 		print_r($d);
 		echo "</pre>";
 		die (__FILE__ . ", " . __LINE__); /**/
 		$f = "WHERE 1 = 1 ";
 		if ( (int)$d["region"] ) {
 			$f = "WHERE m.region = " . (int)$d["region"];
 		}
 		if ( (int)@$d["city"] > 0) {
 			$f = "WHERE m.city = " . (int)$d["city"];
 		}
 		//type
 		$type = array();
 		if ((int)@$d["people"] > 0) {
 			$type[] = "people = 1";
 		}
 		if ((int)@$d["box"] > 0) {
 			$type[] = "box = 1";
 		}
 		if ((int)@$d["term"] > 0) {
 			$type[] = "term = 1";
 		}
 		if (count($type)) {
 			$t = join(" OR ", $type);
 			$f .= " AND ($t)";
 		}
 		
 		$distance = array();
 		if ((int)@$d["far"] > 0) {
 			$distance[] = "far = 1";
 		}
 		if ((int)@$d["near"] > 0) {
 			$distance[] = "near = 1";
 		}
 		if ((int)@$d["piknik"] > 0) {
 			$distance[] = "piknik = 1";
 		}
 		
 		if (count($distance)) {
 			$t = join(" OR ", $distance);
 			$f .= " AND ($t)";
 		}
 		$f .= " AND m.is_deleted != 1 AND m.is_moderate = 1";
 		$this->filter = $f;
 	}
 }
 
 $list = new CList();
 $pageData = $list->paging;
 
 if (@$_POST["ajax"] == 1 && @$_POST["xhr"] == 1) {
 	$items = "";
 	$paging = "";
 	foreach ($list->rows as $n) {
 		ob_start();
 		include DR . "/tpl/mainpagelist_item.tpl.php";
 		$items .= ob_get_clean();
 	}
 	if ($pageData) {
 		ob_start();
 		include DR . "/tpl/paginator_inner.tpl.php";
 		$paging = ob_get_clean();
 	}
 	$data = array("success" => 1, "items" => $items, "paging" => $paging);
 	print json_encode($data);
 	exit;
 }
