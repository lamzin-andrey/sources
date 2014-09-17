<?php
define("LIB_ROOT", dirname(__FILE__));
define("LIB_HROOT", "/lib");
//время жизни файла со структурой таблицы базы данных
define("LIB_CACHE_TIMEOFLIFE", 100*24*3600);
define("LIB_DEFAULT_RECORDSET_LIMIT", 10);
define("LIB_DEFAULT_RECORDSET_ITEM_PER_PAGING", 12);
define("LIB_UPLOAD_IMAGE_FOLDER", DOC_ROOT . "/img");
define("LIB_UPLOAD_MAX_SIZE", 5*1024*1024);
define("SUMMER_TIME", 3600);
define("LIB_DEV_MODE", 1);
//define("DB_TRIGGER_OFF", true); !!
//здесь можно подключить другой класс для работы с базами данных, 
//если вы используете не mySql
//require_once LIB_ROOT."/classes/db/pgsql.php";  
//require_once LIB_ROOT."/classes/db/mssql.php";
require_once LIB_ROOT."/classes/db/mysql.php";
