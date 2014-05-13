<?php 
require_once DR . "/controls/classes/csimpleaction.php"; 
class CShowAction extends CSimpleAction {
	protected $query = "UPDATE main SET is_hide = 0";
	protected $ok_msg = "Ваше объявление будет показано в результатах поиска";
	protected $wrong  = "Не удалось вернуть объявление в результаты поиска";
}

new CShowAction();