<?php //start 10 00 - 13 00, 13 42 - 15:17 (начал комментировать), 15 56 зарегил бенсплатный ъост и залил на него
define("APP_ROOT", dirname(__FILE__));       //чтобы работало повсюду
require_once APP_ROOT . "/config.php";       //config
require_once APP_ROOT . "/CApplication.php"; //logic
$app = new CApplication();
require_once APP_ROOT . "/master.tpl.php";   //view