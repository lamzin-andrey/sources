<?php
require_once APP_ROOT . "/CViewHelper.php";
class CApplication {
	public $tree = array(); //дерево базы данных, будем его рендерить
	public function __construct() {
		$this->setConnection();
		$this->loadDbFromTextFile();
		$this->createTree();
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
	 * @desc  Получает плоскиё список и строит его в дерево $this->tree
	 **/
	private function createTree() {
		$query = "SELECT * FROM categories ORDER BY id";
		$raw = $this->db_rows($query);
		$tree = array("childs"=>array());
		$node = $tree;
		foreach ($raw as $row) {
			$path = $this->getPath($raw, $row); //for example $path == array(0,2,4);
			/*echo "<pre>";
			print_r($path);
			//print_r($row);
			echo "</pre>";
			//die (__FILE__ . ", " . __LINE__); /**/
			
			//for ($i = 0; $i < count($path); $i++) {
				$this->createNodeIfNoExsist($path, 0, $tree["childs"], $row); // $tree[$path[$i]] = array("data" => null, "childs" =>array); return childs
			//}
			//$node["data"] = $row;
		}
		$this->tree =  @$tree["childs"][0]["childs"];
		/*echo "<pre>";
		print_r($this->tree);
		echo "</pre>";
		die (__FILE__ . ", " . __LINE__); /**/
	}
	/**
	 * @desc  Создать в дереве ноду с id $index  
	 * @see  createTree
	 * @param $index - идентификатор раздела
	 * @param &$tree - дерево, не обязательно от корня
	 **/
	private function createNodeIfNoExsist($path, $pathIndex, &$tree, $data) {
		$index = $path[intval($pathIndex)];
		if ( !is_array(@$tree[$index]) ) {
			$v = null;
			if (count($path) - 1 == $pathIndex) {
				$v = $data;
			}
			$tree[$index]= array("data" => $v, "childs" => array());
		}
		if (count($path) - 1 == $pathIndex) {
			return;
		}
		$this->createNodeIfNoExsist($path, $pathIndex + 1, $tree[$index]["childs"], $data);
	}
	/**
	 * @desc  Получить путь из индексов массива от корня к листу в 
	 * @see  createTree
	 * @param $raw - плоский список из таблицы categories
	 **/
	private function getPath($raw, $item) {
		$data = array();
		$indexData = array();
		$data[] = intval($item["id"]);
		while (intval($item["parent_id"])) {
			$data[] = intval($item["parent_id"]);
			if (count($indexData) == 0) {
				foreach ($raw as $i) {
					$key = (int)$i["id"];
					if ($key) {
						$indexData[$key] = $i;
					}
				}
			}
			if ( intval(@$indexData[ $item["parent_id"] ] > 0)) {
				$item = $indexData[ $item["parent_id"] ];
			} else {
				break;
			}
		}
		$data[] = intval($item["parent_id"]);
		$data = array_reverse($data);
		return $data;
	}
	/**
	 * @desc  Загрузка данных из текстового файла
	 **/
	private function loadDbFromTextFile() {
		$dataFile = DATA_PATH . "/test.txt";
		//die();
		if (file_exists($dataFile)) {
			$s = file_get_contents($dataFile); //поленился читать построчно, терзают сомнения, вдруг файл большой
			$lines = explode("\n", $s);
			$buffer = array();
			$count = 0;
			foreach ($lines as $line) {
				$line = str_replace("\r", "", $line); //вдруг это было в windows
				$triada = explode("|", $line);
				if (count($triada) == 3) {
					$id = (int)$triada[0]; 
					$parentId = (int)$triada[1]; 
					$name = trim($triada[2]);
					if ($id) {
						$buffer[] = " ({$id}, {$parentId}, '{$name}')";
						$count++;		//чтобы не считать те, которые не удовлетворяют условию формата строки
					} 
				}
			}
			if ($count) {
				$query = "INSERT INTO categories (`id`, `parent_id`, `section_name`) VALUES " . join(",", $buffer) . " ON DUPLICATE KEY UPDATE parent_id = parent_id"; //последнее, чтобы не ругался при дубликатах... Хочется обновлять так же легко родителей и имена, но такого в ТЗ нет, да и не знаю, возможно ли
				$this->db_query($query);
			}
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