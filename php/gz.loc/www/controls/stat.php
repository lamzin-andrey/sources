<?php
class CStat {
	public $rows;
	public $numRows = 0;
	public function __construct() {
		$cmd = "SELECT country_name, region_name, city_name FROM stat AS s
		 LEFT JOIN countries ON s.country = countries.id
		 LEFT JOIN regions ON s.region = regions.id
		 LEFT JOIN cities ON s.city = cities.id
		ORDER BY cnt DESC LIMIT 15 ";
		$this->rows = $data = query($cmd, $this->numRows);
	}
}

$stat = new CStat();