<?php

require_once DR . '/lib/shared.php';

class LoginAdmin {
	public function __construct() {
		$this->login();
	}
	
	private function login() {
		$p = $_POST;
		if (count($p)) {
			$name = Shared::deinject(@$p["login"]);
			$pwd  = md5(Shared::deinject(@$p["pwd"]));
			$cmd = "SELECT id FROM admins WHERE login = '$name' AND pwd = '$pwd'";
			//die($cmd);
			$uid = dbvalue($cmd);
			if ($uid) {
				$_SESSION["role"] = "root";
				utils_302("/private/newadv");
			}
		}
	}
	
}

new LoginAdmin();