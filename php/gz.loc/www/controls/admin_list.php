 <?php 
 require_once DR . "/controls/classes/clist.php";
 
 class CAdminList extends CMainList {
 	public $limit = 20;
 	protected $itemInLine = 5;
 	
 	public $term = 0;
 	public $box = 0;
 	public $people = 0;
 	
 	public $near = 0;
 	public $far = 0;
 	public $piknik = 0;
 	
 	public $is_moderate = 0;
 	public $is_deleted = 0;
 	
 	public function __construct() {
 		$_GET["country"] = 3;
 		$_POST["country"] = 3;
 		$this->setFilter();
 		$this->readGet();
 		parent::__construct();
 		parent::exec();
 	}
 	
 	private function readGet() {
 		$d = $_GET;
 		$this->term = (int)@$d["term"];
 		$this->box = (int)@$d["box"];
 		$this->people = (int)a($d, "people");
 		
 		$this->near = (int)@$d["near"];
 		$this->far = (int)a($d, "far");
 		$this->piknik = (int)a($d, "piknik");
 		
 		$this->is_deleted = (int)@$d["is_deleted"];
 		$this->is_moderate = (int)@$d["is_moderate"];
 	}
 	
 	private function setFilter() {
 		$d = $_GET;
 		$f = "WHERE 1 = 1 ";
 		if ( (int)@$d["region"] ) {
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
 		
 		if ((int)@$d["is_deleted"] == 0) {
 			$f .= " AND m.is_deleted != 1";
 		}
 		
 		if ((int)@$d["is_moderate"] == 0) {
 			$f .= " AND m.is_moderate = 0";
 		}
 		$this->filter = $f;
 	}
 }
 
 $list = new CAdminList();
 $pageData = $list->paging;
