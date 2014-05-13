<?php 
require_once DR . "/controls/classes/csimpleaction.php"; 
class CDelAction extends CSimpleAction {
	protected $query = "UPDATE main SET is_deleted = 1";
	protected $ok_msg = "Ваше объявление удалено";
	protected $wrong  = "Не удалось удалить объявление";
}

new CDelAction();