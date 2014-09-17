<?php

include $_SERVER["DOCUMENT_ROOT"] . "/config.php";
require_once DR . "/lib/main.php";
$handler = "404.php";
$inner = TPLS . "/404.tpl.php";
$title="Заказ Газели онлайн в любом городе России";
$h1 = "Заказ ГАЗели в любом городе России";

$showCabBtn = $showAddAdvBtn = true;
$showExitBtn = (bool)@$_SESSION["uid"] || (@$_SESSION["role"] == "root");
$showSetBtn =(bool)@$_SESSION["uid"];

include DR . "/lib/request_patcher.php";
include DR . "/router.php";
include DR . "/lib/view_helpers.php";

include DR . "/controls/$handler";
include TPLS . "/master.tpl.php";

