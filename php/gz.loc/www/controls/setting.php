<?php
require_once DR . "/lib/shared.php";
class CSetting {
	
	public $email;
	public $name;
	
	private $id;
	
	public function __construct() {
		if (!@$_SESSION["uid"]) {
			utils_302();
		}
		$this->loadData();
		$this->changeRegData();
	}
	
	private function loadData() {
		
		/*echo "<pre>";
		print_r($_SESSION);
		echo "</pre>";
		die (__FILE__ . ", " . __LINE__); /**/
		
		$this->id = $id = (int)@$_SESSION["uid"];
		if ($id) {
			$cmd = "SELECT email, name FROM users LEFT JOIN main AS m ON m.phone = users.phone
			        WHERE users.id = $id LIMIT 1";
			$row = dbrow($cmd, $r);
			if ($r) {
				$this->email = $row["email"];
				$this->name = $row["name"];
			}
		}
	}
	
	private function changeRegData() {
		$p = $_POST;
		if (count($p)) {
			$msg = "";
			$status = '1';
			if (!checkMail(@$p["email"]) ) {
				$_SESSION["ok_msg"] = "Некорректный email";
				utils_302("/cabinet/setting?status=1");
			}			
			$m = $p["email"];
			$cmd = "UPDATE users SET email = '$m' WHERE id = {$this->id}";
			query($cmd, $nR, $aR);
			
			if ($aR) {
				$msg = "<p>Адрес электронной почты изменен.";
				$status = '0';
			}
			
			if (trim(@$p["name"])) {
				$phone = @$_SESSION["phone"];
				$name = Shared::deinject($p["name"]);
				$cmd = "UPDATE main SET name = '$name' WHERE phone = '$phone'";
				$aR = 0;
				//die($cmd);
				query($cmd, $nr, $aR);
				if ($aR) {
					$msg .= "<p>Имя или название компании изменено.";
					$status = '0';
				}
			} else {
				$msg .= "<p>Имя или название компании не должно быть пустым.";
				$status = '1';
			}
			
			if (trim(@$p["cpwd"])) {
				$cpwd = substr( str_replace(' ', '', $p["cpwd"]), 0, 32);
				$pwd1 = substr( str_replace(' ', '', @$p["pwd1"]), 0, 32);
				$pwd2 = substr( str_replace(' ', '', @$p["pwd2"]), 0, 32);
				if ($pwd1 != $pwd2) {
					$msg .= "<p>Пароли не совпадают.";
					$status = 1;
				} else if (  strlen(trim($pwd1)) < 6  ) {
					$msg .= "<p>Пароль должен быть не менее шести символов.";
					$status = 1;
				}else {
					$status = '0';
					$pwd = md5($cpwd);
					$pwd1 = mysql_real_escape_string($pwd1);
					$cpwd = mysql_real_escape_string($cpwd);
					$cmd = "UPDATE users SET rawpass = '$pwd1', pwd = '$pwd' WHERE id = {$this->id} AND rawpass = '$cpwd'";
					$aR = 0;
					query($cmd, $e, $aR);
					if (!$aR) {
						$msg .= "<p>Текущий пароль введен неверно, пароли не сохранены.";
						$status = 1;
					} else {
						$msg .= "<p>Пароль изменен.";
					}
				}
			}
			
			$_SESSION["ok_msg"] = $msg;
			utils_302("/cabinet/setting?status=$status");
		}
	}
}

$settingForm = new CSetting();