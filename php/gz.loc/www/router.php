<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/lib/shared.php";

	global $baseUrl;

	$authorized = (int)@$_SESSION['uid'];
	$aUrl = explode("?", $_SERVER["REQUEST_URI"]);
	$url = $aUrl[0];
	$baseUrl = '';
	
	//---start add PAU --
	$aUrl = explode('/', $url);
	if (count($aUrl) > 1) {
		$firstWord = @$aUrl[1];
		if (
			($firstWord != "private")
			&& ($firstWord != "logout")
			&& ($firstWord != "podat_obyavlenie")
			&& ($firstWord != "remind")
			&& ($firstWord != "cabinet")
			&& ($firstWord != "location")
			&& ($firstWord != "phones")
			&& ($firstWord != "regions") //TODO проверить, а надо ли
			//&& ($firstWord != "advert") скорее всего не надо
		) {
			CRequestPatcher::move302();
			if ((int)@$_GET["region"] > 0) {
				$regName = Shared::getRegNameById((int)@$_GET["region"]);
				$loc = "/$regName";
				if ( (int)@$_GET["city"] > 0 ) {
					$cityName = Shared::getCityNameById((int)@$_GET["city"]);
					$loc = "/$regName/$cityName";
				}
				
				unset($_GET["city"]);
				unset($_GET["region"]);
				unset($_GET["country"]);
				$data = array();
				foreach ($_GET as $k => $i) {
					$data[] = "$k=$i";
				}
				$s = join("&", $data);
				if (strlen($s)) {
					$loc .= "?$s";
				}
				utils_302($loc);
			}
			$regId = Shared::getRegion($firstWord);
			$cityId = 0;
			$advId = 0;
			$advTitle = '';
			if ($regId) {
				$sh = 0;
				$cityId = Shared::getCity(@$aUrl[2]);
				$advId = (int)@$aUrl[4];
				if (!$advId) {
					$advId = (int)@$aUrl[3];
					$sh = 1;
				}
				if ($advId) {
					$advTitle = Shared::getTitle($advId);
				}
				
				if ( ($advId && $advTitle == @$aUrl[3]) || ($advId && $advTitle == @$aUrl[2]) ) {
					$url = "/advert/$advId";
					if ($sh == 0) { 
						$baseUrl = '/' . @$aUrl[1] . "/" . @$aUrl[2]; //TODO
					} else {
						$baseUrl = '/' . @$aUrl[1]; //TODO
					}
				} elseif($cityId) {
					$url = "/";
					$_GET["region"] = $regId;
					$_GET["city"] = $cityId;
					$baseUrl = '/' . @$aUrl[1] . "/" . @$aUrl[2];
				} else {
					$url = "/";
					$_GET["region"] = $regId;
					$baseUrl = '/' . @$aUrl[1];
				}
			}
		}
	}
	// --- /end
	if ($url == '/') {
		$handler = "list.php";
		$inner = TPLS . "/mainpage.tpl.php";
	}
	if (strpos($url, "regions") === 1) {
		$handler = "regions.php";
		$inner = TPLS . "/regions.tpl.php";
	}
	if (strpos($url, "podat_obyavlenie") === 1) {
		$handler = "add.php";
		$inner = TPLS . "/add.tpl.php";
		$showAddAdvBtn = false;
	}
	if (strpos($url, "private/podat_obyavlenie") === 1) {
		$handler = "add_admin.php";
		$inner = TPLS . "/add_admin.tpl.php";
		$showAddAdvBtn = false;
	}
	if (strpos($url, "logout") === 1) {
		$_POST["action"] = "logout";
		$handler = "cabinet.php";
	}
	if (strpos($url, "remind") === 1) {
		$showCabBtn = false;
		$handler = "remind.php";
		$inner = TPLS . "/remind.tpl.php";
	}
	if (strpos($url, "advert") === 1) {
		$id = (int)preg_replace("#/advert/([0-9]+)/?.*#", '$1', $url);
		$_GET["adv_id"] = $id;
		$handler = "advert.php";
		$inner = TPLS . "/advert.tpl.php";
	}
	if (strpos($url, "cabinet") === 1) {
		$showCabBtn = false;
		$handler = "cabinet.php";
		$inner = TPLS . "/cabinet.tpl.php";
		if (strpos($url, "cabinet/edit") === 1) {
			$showCabBtn = true;
			$id = (int) str_replace("/cabinet/edit/", '', $url);
			if ($id) {
				$_GET["edit_id"] = $id;
				$handler = "cabinet_edit.php";
				$inner = TPLS . "/add.tpl.php";
			}
		}
		if (strpos($url, "cabinet/up") === 1) {
			$showCabBtn = true;
			$id = (int) str_replace("/cabinet/up/", '', $url);
			if ($id) {
				$_GET["edit_id"] = $id;
				$handler = "cabinet_up.php";
				$inner = TPLS . "/up.tpl.php";
			}
		}
		if (strpos($url, "cabinet/hide") === 1) {
			$showCabBtn = true;
			$id = (int) str_replace("/cabinet/hide/", '', $url);
			if ($id) {
				$_GET["edit_id"] = $id;
				$handler = "cabinet_hide.php";
			}
		}
		if (strpos($url, "cabinet/show") === 1) {
			$id = (int) str_replace("/cabinet/show/", '', $url);
			if ($id) {
				$_GET["edit_id"] = $id;
				$handler = "cabinet_show.php";
			}
		}
		if (strpos($url, "cabinet/delete") === 1) {
			$id = (int) str_replace("/cabinet/delete/", '', $url);
			if ($id) {
				$_GET["edit_id"] = $id;
				$handler = "cabinet_delete.php";
			}
		}
		if (strpos($url, "cabinet/setting") === 1) {
			$showCabBtn = true;
			$showSetBtn = false;
			$handler = "setting.php";
			$inner = TPLS . "/setting.tpl.php";
		}
	}
	if (strpos($url, "location") === 1) {
		$handler = "ajaxlocation.php";
		//print json_encode(array('a'=>'Кириллица', 'b'=>@$_POST["test"])); die;
	}
	
	if (strpos($url, "actions") === 1) {
		if ($_SESSION["role"] != "root") {
			print json_encode(array('success'=>'20', 'msg'=>'Нет прав')); exit;
		}
		$id = (int)@$_POST["id"];
		if (@$_POST["action"] == "public" && $id) {
			query("UPDATE main SET is_moderate = 1 WHERE id = $id", $nR, $aR);
			//die("UPDATE main SET is_moderate = 1 WHERE id = $id");
			if ($aR) {
				print json_encode(array('success'=>'1', 'msg'=>'Ok', 'publicId' => $id)); exit;
			}
			print json_encode(array('success'=>'10', 'msg'=>'Не найдена запись')); exit;
		}
		if (@$_POST["action"] == "delete" && $id) {
			query("UPDATE main SET is_deleted = 1 WHERE id = $id", $nR, $aR);
			if ($aR) {
				print json_encode(array('success'=>'1', 'msg'=>'Ok', 'publicId' => $id)); exit;
			}
			print json_encode(array('success'=>'+0', 'msg'=>'Не найдена запись')); exit;
		}
		print json_encode(array('success'=>'100', 'msg'=>'Не найдена запись')); exit;
	}
	if (strpos($url, "phones") === 1) {
		$id = (int) str_replace("/phones/", '', $url);
		if ($id) {
			include_once DR . "/lib/phone.php";
			exit;
		}
	}
	
	if (strpos($url, "private") === 1) {
		if (strpos($url, "private/login") === 1) { 
			$handler = "loadmin.php";
			$inner = TPLS . "/loadmin.tpl.php";
		} else if ($_SESSION["role"] != "root") {
			utils_302();
		}
		//$handler = "setting.php";
		//$inner = TPLS . "/setting.tpl.php";
		if (strpos($url, "private/podat_obyavlenie") === 1) {
			$handler = "add_admin.php";
			$inner = TPLS . "/add_admin.tpl.php";
			$showAddAdvBtn = false;
		}
		if (strpos($url, "private/newadv") === 1) {
			$handler = "admin_list.php";
			$inner = TPLS . "/admin_mainpage.tpl.php";
			$showAddAdvBtn = false;
		}
		if (strpos($url, "private/users") === 1) {
			$handler = "users_p.php";
			$inner = TPLS . "/users_p.tpl.php";
			$showAddAdvBtn = false;
		}
		if (strpos($url, "private/stat") === 1) {
			$handler = "stat.php";
			$inner = TPLS . "/stat.tpl.php";
			$showAddAdvBtn = false;
		}
	}