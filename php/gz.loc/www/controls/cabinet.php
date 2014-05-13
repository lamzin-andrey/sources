<?php 
require_once DR . "/lib/validators.php";
require_once DR . "/lib/shared.php";
require_once DR . "/controls/classes/clist.php";
class CCabinet extends CMainList {
	public function __construct() {
		switch (@$_POST["action"]) {
			case "login":
				$this->login();
				break;
			case "logout":
				$this->logout();
				break;
			default:
				if (!@$_SESSION["uid"]) {
					utils_302("/");
				}
		}
		$phone =  Shared::preparePhone(@$_SESSION['phone']);
		if (strlen($phone) < 5) {
			$this->stopSql = true;
		} else {
			$this->filter = " WHERE phone = '$phone' AND m.is_deleted != 1 ";
		}
		$this->exec();
	}
	
	private function logout(){
		$_SESSION = array();
		utils_302("/");
	}
	
	private function login(){
		$phone = Shared::preparePhone(@$_POST["phone"]);
		$password = str_replace("'", '&quot;', trim(@$_POST["password"]));
		$cmd = "SELECT id FROM users WHERE phone = '$phone' AND rawpass = '$password'";
		$data = query("SELECT u.id,  m.name FROM users AS u 
		LEFT JOIN main AS m ON m.phone = u.phone
		WHERE u.phone = '$phone' AND u.rawpass = '$password'", $nR);
		$id = 0;
		if ($nR) {
			$row = $data[0];
			$id = $row['id'];
			$name = $row['name'];
		}
		if ($id) {
			$_SESSION["authorize"] = true;
			$_SESSION["uid"] = $id;
			$_SESSION["phone"] = $phone;
			$_SESSION["viewphone"] = Shared::formatPhone($phone);
			$_SESSION["name"] = $name;
			print json_encode(array("success"=>'1'));
		} else {
			print json_encode(array("success"=>'0'));
		}
		exit;
	}
}

$cabinet = new CCabinet();
