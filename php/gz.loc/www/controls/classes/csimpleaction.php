<?php
class CSimpleAction {
	public $id;
	public $title;
	protected $query = "";
	protected $ok_msg = "";
	protected $wrong = "";
	protected $needCap = false;
	public function __construct() {
		//получить id  ипроверить, честь ли право доднимать это объявлени
		//если есть поднять если нет выести сообщение об ошибке
		$this->id = $id = @$_GET["edit_id"];
		$phone = @$_SESSION["phone"];
		if ($id && $phone) {
			$row = dbrow("SELECT id, title FROM main WHERE id = {$id} AND phone = '{$phone}'");
			$id = (int)@$row["id"];
			$this->title = @$row["title"];
			if (!$id) {
				$_SESSION["ok_msg"] = "У вас нет прав на действие с этим объявлением";
				utils_302("/cabinet?status=1"); 
			}
			if ( ( ($this->needCap && $_POST["cp"] == @$_SESSION["ccode"]) || !$this->needCap ) && $this->query) {
				//die( $this->query . " WHERE id = $id" );
				query($this->query . " WHERE id = $id", $nR, $aR);
				if ($aR) {
					$_SESSION["ok_msg"] = $this->ok_msg;
					utils_302("/cabinet?status=0"); //Все ок
				} else {
					$_SESSION["ok_msg"] = $this->wrong;
					utils_302("/cabinet?status=2"); //Не удалось поднять сообщение
				}
			}
		}
	}
}