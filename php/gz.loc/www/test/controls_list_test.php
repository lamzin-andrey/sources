<?php
require_once 'PHPUnit.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/controls/list.php';
class ControlsListTest extends PHPUnit_TestCase {

}

/* запускаем набор тестов и выводим результат */
    $suite = new PHPUnit_TestSuite('MessageTest'); 
    $result = PHPUnit::run($suite);
    echo $result->toHTML(); 

