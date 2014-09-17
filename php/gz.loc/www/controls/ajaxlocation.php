<?php
class AjaxLocation {
	public function __construct() {
		switch (@$_POST["action"]) {
			case "country":
				$this->loadCountry(); 
			break;
			case "region":
				$this->loadRegion((int)@$_POST['countryId']); 
			break;
			case "city":
				$this->loadCity((int)@$_POST['regionId']); 
			break;
		}
	}
	
	private function loadCity($region) {
		if ($region == 0) {
			$data = query("SELECT id, city_name FROM cities WHERE is_deleted != 1 AND is_moderate = 1 AND region = $region ORDER BY delta");
		} else {
			$data = query("SELECT id, city_name, delta FROM
( (SELECT id, city_name, 0 AS is_city, delta FROM cities WHERE is_deleted != 1 AND is_moderate = 1 AND region = $region )
UNION
(SELECT id, region_name AS city_name, is_city, delta FROM regions WHERE is_deleted != 1 AND is_moderate = 1 AND parent_id = $region ) ) AS data ORDER BY is_city DESC, delta ASC;");
		}
	 	json_ok('list', $data);
	}
	
	private function loadRegion($country) {
		$data = query("SELECT id, region_name FROM regions WHERE is_deleted != 1 AND is_moderate = 1 AND country = 3 ORDER BY delta");
	 	json_ok('list', $data);
	}
	
	private function loadCountry() {
	 	$data = query("SELECT id, country_name FROM countries WHERE is_deleted != 1 AND is_moderate = 1 ORDER BY delta");
	 	json_ok('list', $data);
	}
}
new AjaxLocation();