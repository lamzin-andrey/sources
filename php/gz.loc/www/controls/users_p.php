<?php
require_once DR . "/lib/shared.php";
class CUsersPwd {
	public $pwd;
	public $phone;
	public $error;
	public function __construct() {
		$p = $_POST;
		if (count($p)) {
			switch (@$p["action"]) {
				case "gpwd":
					$this->getPwd();
					break;
				case "snpwd":
					$this->restPwd();
					$this->getPwd();
					break;
			}
		}
	}
	
	private function getPwd() {
		$p = $_POST;
		$phone = Shared::preparePhone(@$p["phone"]);
		if ($phone) {
			$this->phone = $phone;
			$cmd = "SELECT rawpass  FROM users WHERE phone = '$phone'";
			$row = dbrow($cmd, $nR);
			if ($nR) {
				$this->pwd = $row["rawpass"];
			} else {
				$this->error = "Нет такого телефона";
			}
		}
	}
	
	private function restPwd() {
		$p = $_POST;
		$phone = Shared::preparePhone(@$p["phone"]);
		if ($phone) {
			$this->phone = $phone;
			$data = md5( mt_rand(1000, 9999) );
			
			$b = rand(0, 32);
			$a = $b - 6;
			if ($a < 0) {
				$a = $b;
				$b += 6;
			}
			
			$rp = substr($data, $a, 6);
			$pwd = md5($rp);
			
			$cmd = "UPDATE users SET pwd = '$pwd', rawpass = '$rp' WHERE phone = '$phone'";
			$row = query($cmd, $nR);
		}
	}
	
}

$settingForm = new CUsersPwd();