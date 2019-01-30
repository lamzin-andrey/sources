<?php
/**
 * Классы, реализующие обработку файлов (заготовка)
 * */
class CFileProcessor {
	public function __construct() {
		
	}
	
	public function load($filename) {
		
	}
	
	public function process() {
		
	}
}

class CtxtFileProcessor extends CFileProcessor{
	public function process() {
		print "I'm txt Processor<br>";
	}
}

class CdocFileProcessor extends CFileProcessor{
	public function process() {
		print "I'm doc Processor<br>";
	}
}

class CxmlFileProcessor extends CFileProcessor{
	public function process() {
		print "I'm xml Processor<br>";
	}
}
