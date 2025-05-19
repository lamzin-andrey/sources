<?php
$R = dirname(__FILE__);
require_once $R . '/tool.lib.php';

function main($R) {
    $id = trim(@file_get_contents($R. '/cache/fc_last_root'));
    $cmd = "$R/zenitynocommfromconsole.sh";
    if ($id) {
        $cmd = "$R/zenitynocommfromconsole.sh $id";
    }
    $info = exec($cmd);
    
    $values = gitmeld_path_read_data($info, $err_code, $R);
    switch ($err_code) {
        case 1:
            alert('Вам необходимо указать корень проекта');
            return;
        case 2:
            alert('Не выбран файл');
            return;
        case 3:
           alert('Файл "' . $values['filepath'] . '" не найден');
           return; 
    }
    gitmeld_compare_nocommit_file($values['filepath']);
}

function gitmeld_compare_nocommit_file($path) {
    $cmd = "php " . dirname(__FILE__) . '/gitmeldnocomm.php ' . $path;
    echo "$cmd\n";
    exec($cmd);
}
/**
 * @param int has_error (0 - hasnot error, 1 - empty taskid, 2 - empty file, 3 - file not found)
*/
function gitmeld_path_read_data($info, &$has_error = false, $R) {
    $has_error = false;
    $values = read_z_form_data($info, array('new_path_to_project', 'path_to_project', 'path'));
    gitmeld_parse_newpath_to_project($values);
    $result = array();
    if ( isset($values['new_path_to_project']) && trim($values['new_path_to_project'])) {
        $result['root'] = trim($values['new_path_to_project']);
    } else {
        $list = $values['path_to_project'];
        if (is_array($list) && isset($list[0])) {
            $result['root'] =  trim($list[0]);
        }
    }
    $result['path'] = trim($values['path']);
    if (!$result['path']) {
        $has_error = 2;
    }
    if (!$result['root']) {
        $has_error = 1;
    }
    $result['root'] = preg_replace("#/$#", '', $result['root'] );
    if ($result['root']) {
        file_put_contents($R. '/cache/fc_last_root', $result['root']);
    }
    $filepath = $result['root'] . '/' . $result['path'];
    $result['filepath'] = $filepath;
    if (!file_exists($filepath)) {
        $has_error = 3;
    }
    return $result;
}
/**
 * @param array $a массив данных из формы
*/
function gitmeld_parse_newpath_to_project(&$a) 
{
	$s = isset($a['new_path_to_project']) ? $a['new_path_to_project'] : '';
	$dPos = strpos($s, ':');
	$bPos = strpos($s, '$');
	if ($dPos !== false && $bBos !== false && $bPos > $dPos) {
		$b = explode(':', $s);
		if (count($b) > 1) {
			$s = str_replace('$', '', $b[1]);
			$a['new_path_to_project'] = $s;
		}
	} 
	else if ($dPos !== false) {
		$b = explode(':', $s);
		if (count($b) > 1 ) {
			$s = str_replace('$', '', $b[1]);
			$a['new_path_to_project'] = $s;
		}
	}
}

main($R);

