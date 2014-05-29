<?php
require_once APP_ROOT . "/CViewHelper.php";
class CApplication {
	public $data = array(); //данные о продуктах
	public function __construct() {
		$this->setConnection();
		$this->loadData();
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
	private function loadData() {
		$query = "SELECT * FROM Product ORDER BY id DESC LIMIT 100";
		$rows = $this->db_rows($query);
		$fh = fopen(dirname(__FILE__) . "/noimage.txt", "a+");
		foreach ($rows as $row) {
			if (trim($row["image"])) {
				$this->data[] = $row;
			} else {
				fwrite($fh, $row["id"]."\r\n");
			}
		}
		fclose($fh);
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