<?php
require_once DR . "/controls/classes/cadd.php";
class CAdminAdd  extends CAdd {
	public function __construct() {
		CRequestPatcher::pathPost();
		$this->is_moderate = 1;
		$this->readPost();
		$this->uploadHandler();
		if (count($_POST) == 0) {
			return;
		}
		$this->validateOther();
		$this->insert();
		$this->_exit();
	}
}