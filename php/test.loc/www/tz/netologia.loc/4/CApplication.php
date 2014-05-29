<?php
require_once APP_ROOT . "/CViewHelper.php";
class CApplication {
	public $emailList = array(); //данные о email пользователей
	public $errorMsg = array(); //Сообщение об ошибке
	
	public function __construct() {
		$this->setConnection();
		$this->loadUsers();
		$this->processPost();
	}
	/**
	 * @desc  Соединение с базой данных В случае ошибки бросает исключение
	 * Использую mysql_*
	 * Но можно переписать на PDO при необходимости
	 **/
	private function setConnection() {
		mysql_connect(DB_HOST, DB_USER, DB_PASSWORD) or die ("Error connect to " . DB_HOST);
		mysql_select_db(DB_NAME) or die ("Error select " . DB_NAME);
		mysql_query("SET NAMES UTF8");
	}
	/**
	 * @desc  Получает данные и копирует их в массив $this->data
	 **/
	private function loadUsers() {
		$query = "SELECT email FROM users4";
		$rows = $this->db_rows($query);
		
		foreach ($rows as $row) {
			$this->emailList[] = $row["email"];
		}
	}
	/**
	 * @desc  Обработка формы, если данные валидны, сохраняю email в ьалице пользователей
	 **/
	private function processPost() {
		if (@$_POST["action"] == "newmsg") {
			if ( $this->noEmptyValidate()
			     && $this->emailValidate()
			     && $this->uniqueEmailValidate()
			   ) { 
			   		$email = trim(@$_POST["email"]);
			   		$body = strip_tags(trim(@$_POST["body"])); //не вставляю сейчас но на всякий случай
					$this->db_query("INSERT INTO users4 (email) VALUES('$email')");
			}
		}
	}
	
	/**
	 * @desc проверка на совпадение email
	 *       (не отправляя на сервер только так, наверное, т. е. я так понял что и яакс запрос отправлять нельзя??)
	 * @return bool true если валиден
	 **/
	function uniqueEmailValidate() {
		$email = trim(@$_POST["email"]);
		$list = $this->emailList;
		for ($i = 0; $i < count($list); $i++) {
			if ($list[$i] == $email) {
				$this->errorMsg[] = "Пользователь с таким email уже есть в списке";
				return false;
			}
		}
		return true;
	}
	/**
	 * @desc Валидация email
	 * @return bool true если валиден
	 **/
	function emailValidate() {
		$pattern = "/^[\w+\-.]+@[a-z\d\-.]+\.[a-z]{2,6}$/i";
		$email = trim(@$_POST["email"]);
		if (!preg_match($pattern, $email)) {
			$this->errorMsg[] = "Некоректный email";
			return false;
		} else {
			return true;
		}
	}	
	/**
	   * @desc Валидация непустых полей
	   * @return bool true если валидны
	**/
	function noEmptyValidate() {
		$email = trim(@$_POST["email"]);
		$body = trim(@$_POST["body"]);
		if (trim($email) && trim($body)) {
			return true;
		} else {
			$this->errorMsg[] = "Поля не могут быть пустыми";
			return false;
		}
	}
	/**
	 * @desc Обертка. Если понадобится перейти к PDO достаточно исправить здесь
	 * @param string $query
	 * @param int    &$insertId
	 * @param int    &$affectedRows
	 * */
	private function db_query($query, &$insertId = null, &$affectedRows = null) {
		//$query = mysql_real_escape_string($query);
		mysql_query($query);
		if (mysql_error()) {
			print mysql_error() . "<br>$query";
		}
		if ( strpos(strtolower($query), "insert") !== false ) {
			$insertId = mysql_insert_id();
		}
		if ( strpos(strtolower($query), "update") !== false ) {
			$affectedRows = mysql_affected_rows();
		}
	}
	/**
	 * @desc Возвращает набор строк. Если понадобится перейти к PDO достаточно исправить здесь
	 * @param string $query
	 * @param int    &$numRows
	 * @param bool   $escape
	 * */
	private function db_rows($query, &$numRows = null, $escape = true) {
		if ($escape) {
			$query = mysql_real_escape_string($query);
		}
		$res = mysql_query($query);
		$rows = array();
		while ($row = mysql_fetch_array($res)) {
			$numRows++;
			$rows[] = $row;
		}
		return $rows;
	}
	
}