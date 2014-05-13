<?php
require_once DR . "/lib/shared.php";
class CAdvert {
	public $data;
	public function __construct() {
		$id = (int)$_GET["adv_id"];
		if ($id) {
			$cmd = "SELECT m.codename, m.id, m.people, m.price, m.box, m.term, m.far, m.near, m.piknik, m.title, m.image, m.name,
		         m.addtext, m.phone, m.created, m.is_moderate, m.is_hide, r.region_name, c.city_name
				FROM main AS m
				LEFT JOIN regions AS r ON m.region = r.id
				LEFT JOIN cities AS c ON m.city = c.id 
				WHERE m.id = $id AND m.is_deleted != 1 AND m.is_moderate = 1";
			$row = dbrow($cmd, $r);
			if ($r) {
				$GLOBALS["title"] = $GLOBALS["h1"] = H1_BEG . Shared::modCityName($row["city_name"]) . ", " . $row["region_name"] . "| " . $row["title"];
				if (!$row["city_name"]) {
					$GLOBALS["title"] = $GLOBALS["h1"] = H1_BEG . Shared::modCityName($row["region_name"]) . "| " . $row["title"];
				}
				Shared::prepareItem($row);
				$this->data = $row;
				/*echo "<pre>";
				print_r($row);
				echo "</pre>";
				die (__FILE__ . ", " . __LINE__); /**/
			} else {
				$GLOBALS["inner"] = TPLS . "/adv_no_exists.tpl.php";
				$GLOBALS["title"] = $GLOBALS["h1"] = "Ничего не найдено";
				utils_404(null,  TPLS . "/master.tpl.php" );
			}
		} else {
			$GLOBALS["inner"] = TPLS . "/adv_no_exists.tpl.php";
			utils_404(null,  TPLS . "/master.tpl.php" );
		}
	}
}

$adv = new CAdvert();
$data = $adv->data;
