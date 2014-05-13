<?php 
require_once DR . "/controls/classes/csimpleaction.php"; 
class CHideAction extends CSimpleAction {
	protected $query = "UPDATE main SET is_hide = 1";
	protected $ok_msg = "Ваше объявление скрыто из результатов поиска";
	protected $wrong = "Не удалось скрыть объявление из результатов поиска";
}

new CHideAction();