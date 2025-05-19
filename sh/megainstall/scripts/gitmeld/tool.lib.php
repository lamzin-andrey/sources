<?php
/**
 * @desc  Возвращает путь к рабочей копии или false
 * @param $target - путь к любому файлу в рабочей копии
*/
function getGitRoot($target) {
	$arr = explode("/", $target);
	unset( $arr[ count($arr) - 1 ] );
	$path = join('/', $arr);
	while (true) {
		$subject = "{$path}/.git";
		if (file_exists($subject) && is_dir($subject) ) {
			return $path;
		}
		$arr = explode("/", $path);
		unset( $arr[ count($arr) - 1 ] );
		if (count($arr) == 0) {
			return false;
		}
		$path = join('/', $arr);
	}
}
/**
 * @desc  Возвращает alert
 * @param $msg - путь к любому файлу в рабочей копии
*/
function alert($msg) {
	if (!$msg) $msg = 'NULL';
	system("zenity --info --text=\"{$msg}\"");
}
/**
 * @desc  Чтение данных из диалога zenity --form
 * @param string $input_data вывод диалога zenity после нажатия списка
 * @param array $config = array() в случае если массив не пуст, данные будут 
 * @param string $input_separator = '|' значение символа - разделителя значений форм
 * @param string $list_values_separator = ',' значение символа - разделителя значений списка
*/
function read_z_form_data($input_data, $config = array(), $input_separator = '|',  $list_values_separator = ',') {
    //normalize config
    /*$new_config = array();
    $is_assoc = false;
    foreach ($config as $key => $item) {
        if (strval($key) != strval(intval($key))) {
            $is_assoc = true;
        }
        $new_config[$item] = 1;
    }
    if ($is_assoc == false) {
        $config = $new_config;
    }
    
    echo "config:\n";
    print_r($config);*/
    
    $data = explode($input_separator, $input_data);
    $result = array();
    foreach ($data as $key => $value) {
        if (strpos($value, $list_values_separator) !== false) {
            $value = explode($list_values_separator, $value);
        }
        if (isset($config[$key])) {
            $key = $config[$key];
        }
        $result[$key] = $value;
    }
    //echo "result:\n";
    //print_r($result);
    return $result;
}
