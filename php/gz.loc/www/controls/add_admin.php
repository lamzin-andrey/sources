<?php 
require_once DR . "/lib/validators.php";
require_once DR . "/controls/classes/cadmin_add.php";

$addForm = new CAdminAdd();

$javascript = '<script type="text/javascript" src="/js/upload/Source/Request.File.js"></script>
';
$javascript .= '<script type="text/javascript" src="/js/short/nr.js"></script>
';