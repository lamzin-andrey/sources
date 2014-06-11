<?php
class CShingleMethod {
	/**
	 * @const Максимально допустимый размер файла
	 * **/
	const MAX_FILE_SIZE = 542720; //ограничу 530 Кб, чтобы Киплинг поместился при юнит тестах
	/**
	 * @var кодировка текста
	 * **/
	private $_encoding     = 'UTF8';
	/**
	 * @var размер шингла
	 * **/
	private $_shingleSize = 3;
	/**
	 * @var массив шинглов
	 * **/
	private $_shingles;
	/**
	 * @var первый неполный элемент массива _shingles (то есть в нем еще меньше чем _shingleSize элементов)
	 * **/
	private $_firstNofullShingle = 0;
	/**
	 * @var стоп слова 
	 * **/
	private $_rawStopWords = "без более был была были было быть вам вас ведь весь вдоль вместо вне вниз внизу внутри вокруг вот все всегда всего всех где давай давать даже для достаточно его  если есть ещё исключением здесь из-за или иметь  как как-то кто когда кроме кто либо мне может мои мой навсегда над надо наш  него неё нет них однако она они оно отчего очень под после потому потому что почти при про снова со так также такие такой там те тем то того тоже той только тут ты уже хотя чего чего-то чей чем что чтобы чьё чья эта эти это";
	/**
	 * @var массив crc32 сумм rawStopWords 
	 * **/
	private $_stopWords = array();
	
	/**
	 * @desc Конструктор
	 * @param int $shingleSize  - размер шингла
	 * @param string $encoding  - кодировка текста 
	 * **/
	public function __construct($shingleSize = 3, $encoding = 'UTF8') {
		$this->_shingleSize = $shingleSize;
		$this->_encoding = $encoding;
		$this->_initStopWords();
	}
	/**
	 * @desc Метод сравнения, можкет получать текст или пути к текстовым файлам
	 * @param string $text1  - первый текст
	 * @param string $text2  - второй текст 
	 * @return float - процент совпадения 
	 * **/
	public function compare($text1, $text2) {
		if (file_exists($text1)) {
			$text1 = $this->_loadFromFile($text1);
		}
		if (file_exists($text2)) {
			$text2 = $this->_loadFromFile($text2);
		}
		set_time_limit(0);
		$shingles_1 = $this->_loadShingles($text1);
		$shingles_2 = $this->_loadShingles($text2);
		if (count($shingles_1) == 0 || count($shingles_1) == 0 ) {
			throw new ShingleMethodException("Nothing to do", ShingleMethodException::NOTHING_TO_DO);
		}
		$equalCount = 0;
		foreach ($shingles_1 as $shingle) {
			if (array_search($shingle, $shingles_2) !== false) {
				$equalCount++;
			}
		}
		return ( 2*$equalCount / ( count($shingles_1) + count($shingles_2) ) * 100 );
	}
	/**
	 * @desc Заполняет массив this->_stopWords crc32 суммами стоп-слов 
	 * **/
	private function _initStopWords() {
		$text = mb_convert_encoding($this->_rawStopWords, "CP-1251", $this->_encoding); //однобайтная кодировка в ланном случае мне больше нравится, хотя возможно не оправданны временные затраты
		$arr = preg_split("#\s#mi", $text);
		foreach ($arr as $word) {
			if (strlen($word) > 2) {
				$this->_stopWords[] = crc32($word);
			}
		}
	}
	/**
	 * @desc Загрузка шинглов
	 * @param $text исходный текст 
	 * **/
	private function _loadShingles($text) {
		$text = mb_convert_encoding($text, "CP-1251", $this->_encoding); //однобайтная кодировка в ланном случае мне больше нравится, хотя возможно не оправданны временные затраты
		$this->_firstNofullShingle = 0;
		$this->_shingles = null;
		$text = str_replace( array('.','!','"','-','?', "\n", "\t", "\r", "'", ',', ':'), array(' ',' ','',' ',' ', " ", " ", " ", " ", ' ', ' '),  $text);
		$arr = preg_split("#\s#mi", $text);
		for ($i = 0; $i < count($arr); $i++) {
			$word = trim($arr[$i]);
			if ( strlen($word) > 2 && !$this->_isStopWord($word)) {
  				$this->_addWordToShingles($word);
  			}
		}
		//отсек непоные шинглы
		if (is_array($this->_shingles)) {
			$this->_shingles = array_slice($this->_shingles, 0, $this->_firstNofullShingle);
		}
		return $this->_shingles;
	}
	/**
	 * @desc Добавление слова в незаполненные шинглы
	 * @param $word
	 * **/
	private function _addWordToShingles($word) {
		//прохожу по всем существующим в массиве шинглам от первого неполного (его размер меньше заданного) до последнего существующего
	 	 for ($i = $this->_firstNofullShingle; $i < count($this->_shingles); $i++) {
	    	$size = count($this->_shingles[$i]) ? count($this->_shingles[$i]) : 0;
	    	if ($size < $this->_shingleSize) { //если размер меньше заданного, добавляю новое слово в шингл
				$this->_shingles[$i] [] = $word;
	    	}
			if ($size + 1 >= $this->_shingleSize) { //если шингл стал полным, меняю его на crc32 сумму (цель - уменьшить расход памяти) (здесь можно также добавить получение минимума от 84 алгоритмв хэширования)
				$this->_shingles[$i] = join(' ', $this->_shingles[$i]);
				$this->_shingles[$i] = crc32($this->_shingles[$i]);
				$this->_firstNofullShingle++;                   //и сдвигаю начало отсчета на 1 вправо
			}
		}
		$this->_shingles[][] = $word;               //новое слово - новый шингл
	}
	/**
	 * @desc проверка,не слово ли стоп слово 
	 * @param string $word
	 * @return bool
	 * **/
	private function _isStopWord($word) {
		if ( array_search(crc32($word), $this->_stopWords) === false ) {
			return false;
		}
		return true;
	}
	/**
	 * @desc установка размера шингла (при юнит- тесте показалось полезно) 
	 * @param int $size
	 * **/
	public function setShingleSize($size) {
		if ( (int)$size ) {
			$this->_shingleSize = (int)$size;
		}
	}
	/**
	 * @desc получение размера шингла (а как бы я проверил, что конструктор работет... хотя нафига это проверять, я не знаю, но в ТЗ написано про все паблик методы) 
	 * @param int $size
	 * **/
	public function getShingleSize() {
		return $this->_shingleSize;
	}
	/**
	 * @desc Загрузка текста из файла, если его размер больше чем свободная память, сейчас бросается исключение, потом можно работать с ним посторчно 
	 * @param string $path
	***/
	public function _loadFromFile($path) {
		$size = filesize($path);
		if ($size > self::MAX_FILE_SIZE) {
			throw new ShingleMethodException("File too big", ShingleMethodException::FILE_TO_BIG);
		}
	}
}

class ShingleMethodException extends Exception{
	const FILE_TO_BIG = 1;
	const NOTHING_TO_DO = 2;
	public $code;
	public $message;
	public function __construct($msg, $code) {
		$this->message = $msg;
		$this->code = $code;
	}
}