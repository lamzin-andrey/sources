<?php
require_once DR . "/lib/shared.php";

require_once DR . "/lib/validators.php";
class CMainList {
	public $paging = array();
	public $rows   = array();
	public $numRows = 0;
	public $maxpage = 0;
	public $page = 1;
	
	protected $filter = " WHERE m.is_deleted != 1 AND m.is_moderate = 1";
	protected $stopSql = false;
	protected $offset = 0;
	protected $limit = 10;
	protected $itemInLine = 3; //need no odd
	
	
	protected $nextLabel = ">";
	protected $prevLabel = "<";
	
	private $total = 0;
	
	public function __construct() {
		$page = (int)@$_GET["page"];
		if ($page == 0) {
			$page = 1;
		}
		$this->page = $page;
		$this->offset = ($page-1) * $this->limit;
	}
	
	protected function exec() {
		if ($this->stopSql) {
			return;
		}
		$cmd = "SELECT m.codename, m.id, m.people, m.price, m.box, m.term, m.far, m.near, m.piknik, m.title, m.image, m.name,
		         m.addtext, m.phone, m.created, m.is_moderate, m.is_hide, r.region_name, c.city_name
		FROM main AS m
		LEFT JOIN regions AS r ON m.region = r.id
		LEFT JOIN cities AS c ON m.city = c.id
		{$this->filter}  ORDER BY pinned DESC, m.delta DESC LIMIT {$this->offset}, {$this->limit}";
		
		//die($cmd);
		$data = query($cmd, $this->numRows);
		$r = @$data[0];
		
		if (!$this->numRows && ((int)@$_GET["region"] > 0 || (int)@$_GET["city"] > 0) ) {
			$rid = (int)@$_GET["region"];
			$cmd = "SELECT region_name FROM regions WHERE id = $rid";
			if ( (int)@$_GET["city"] > 0  ) {
				$cid = (int)@$_GET["city"];
				$cmd = "SELECT region_name, city_name FROM cities AS c
				LEFT JOIN regions AS r ON c.region = r.id
				WHERE c.id  = $cid";
			}
			$r = dbrow($cmd);
			if (!@$r["city_name"]) {
				$r["city_name"] = '';
			}
		}
		if ((int)@$_GET["region"] > 0 || (int)@$_GET["city"] > 0) {
			global $h1, $title;
			if ($r["city_name"]) {
				$h1 = H1_BEG .  Shared::modCityName($r["city_name"]);
				if ($r["region_name"]) {
					$h1 .= ", " . $r["region_name"];
				}
			}else if ($r["region_name"]) {
				$h1 = H1_BEG . Shared::modCityName( $r["region_name"] );
			}
			$title = $h1;
		}
		
		for ($i = 0; $i < count($data); $i++) {
			$this->prepareRecord($data[$i]);
		}
		$this->rows = $data;
		$cmd = "SELECT count(m.id) FROM main AS m LEFT JOIN regions AS r ON r.id = m.region {$this->filter}";
		//die("$cmd");
		$this->total = dbvalue($cmd);
		$this->preparePaging();
	}
	
	private function preparePaging() {
		$p = $this->page;
		$this->maxpage = $maxnum = ceil($this->total / $this->limit);
		if ($maxnum <= 1) {
			return;
		}
		$start = $p - floor($this->itemInLine / 2);
		$start = $start < 1 ? 1: $start;
		$end = $p + floor($this->itemInLine / 2);
		$end = $end > $maxnum ? $maxnum : $end;
		
		$data = array();
		if ($start >  2) {
			$o = new StdClass();
			$o->n = 1;
			$data[] = $o;
		}
		if ($start > 1) {
			$o = new StdClass();
			$o->n = $start - 1;
			$o->text = $this->prevLabel;
			$data[] = $o;
		}
		for ($i = $start; $i <= $end; $i++) {
			$o = new StdClass();
			$o->n = $i;
			if ($i == $p) {
				$o->active = 1;
			}
			$data[] = $o;
		}
		if ($end + 1 < $maxnum) {
			$o = new StdClass();
			$o->n = $end + 1;
			$o->text = $this->nextLabel;
			$data[] = $o;
		}
		if (/*$end != $maxnum - 1 &&*/ $end != $maxnum) {
			$o = new StdClass();
			$o->n = $maxnum;
			$data[] = $o;
		}
		$this->paging = $data;
	}
	
	private function prepareRecord(&$r) {
		Shared::prepareItem($r);
	}
}