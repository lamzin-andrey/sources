<?php
include dirname(__FILE__) . '/tool.lib.php';
$target = $argv[1];
$git_dir = getGitRoot($target);   //каталог, в котором лежит рабочая копия гит
if ($git_dir) {
	/*
	 * Получить список коммитов данного файла 
	 * распарсить список
	 * запустить шелл, который выведет список для зенити и при выборе каких-то пунктов запустит php скрипт, который получит и выведет в meld копии файлов
	*/
	
	//Получить список коммитов данного файла 
	$commit_log_file = dirname(__FILE__) . '/tmp/' . md5($target . time() . 'logfile');
	$filename_for_git = str_replace($git_dir . '/', '', $target);
	system("cd {$git_dir}; git log {$filename_for_git} > {$commit_log_file}");
	$data = gitLogParser($commit_log_file, $git_dir, $filename_for_git, $target);
} else {
	alert('Не найдена рабочая копия для файла ' . $target . ', выход');
}

/**
 * @desc
*/
function gitLogParser($path, $git_dir, $filename_for_git, $target) {
	$raw = file_get_contents($path);
	$lines = explode("\n", $raw);
	$i = $length = count($lines);
	
	$data = array();     //данные 
	$comment = array();  //сюда будет скапливаться текст комментария
	$record = array();   //author comment date short_commit_id commit_id
	
	$author_label = 'Author:';
	$date_label   = 'Date:';
	$commit_label   = 'commit';
	
	while ($i--) {
		$s = $lines[$i];
		if ( strpos($s, $author_label) === false && strpos($s, $date_label) === false && strpos($s, $commit_label) !== 0 ) { //is comment area
			$comment[] = $s;
		} else{
			//save comment
			if ( count($comment) ) {
				$record['comment'] = '\' ' . str_replace('"', '\'', trim(join(" ", array_reverse($comment))) ) . ' \'';
			} else if (!isset($record['comment']) ) {
				$record['comment'] = '\' \'';
			}
			$comment = array();
			
			//author block
			if (strpos($s, $author_label) !== false) {
				$record['author'] = trim( str_replace($author_label, '', $s) );
			} else if (strpos($s, $date_label) !== false) {
				$record['date'] = date('Y-m-d H:i:s', strtotime(trim( str_replace($date_label, '', $s) ) ) );//TODO str to time
			} else if (strpos($s, $commit_label) === 0) {
				$commit = trim( str_replace($commit_label, '', $s) );
				$short = substr($commit, 0, 4) . ' ... ' .  substr( strlen($commit) - 5, 0, 4); //TODO 
				$record['commit'] = $commit;
				$record['short']  = $short;
				$data[$commit]    = $record;
				
				$record = array();
			}
		}
	}
	
	$data = array_reverse($data);
	$buf = array();
	foreach ($data as $row) {
		if (!$row['comment']) {
			$row['comment'] = '\' \'';
		}
		/*if (!$row['short']) {
			$row['comment'] = '\' \'';
		}*/
		$buf[] = 'FALSE "'. $row['date'] .'" "' . $row['comment'] . '" "' . $row['author'] . '" "' . $row['short'] . '" "' . $row['commit'] . '"';
	}
	$s_buf = join(' ', $buf);
	//file_put_contents(dirname(__FILE__) . '/tmp/log.log', $s_buf);
	//system("Q=`zenity --width=1000 --height=500 --list --checklist --multiple --title=\"История изменения файла\" --text=\"Выберите два файла:\" --column=\"0\" --column=\"Дата изменения\" --column=\"Comment\" --column=\"Автор\" --column=\"Тэг\" --column=\"Полный тэг\"  --print-column=\"6\" --separator=\";\" {$s_buf}`; echo " . '$Q > ' . dirname(__FILE__) . '/tmp/result');
	$result_file = dirname(__FILE__) . '/tmp/result';
	file_put_contents($result_file, '');
	$cmd = "Q=`zenity --width=1000 --height=500 --list --checklist --multiple --title=\"История изменения файла\" --text=\"Выберите два файла:\"";
	$cmd .= " --column=\"0\" --column=\"Дата изменения\" --column=\"Comment\" --column=\"Автор\" --column=\"Тэг\" --column=\"Полный тэг\"";
	$cmd .= " --print-column=\"6\" --separator=\";\" ";
	$cmd .= "{$s_buf}`;";
	$cmd .= "echo " . '$Q > ' . $result_file;
	system($cmd);
	$result = file_get_contents($result_file);
	
	//сохранить ревизии в файлы и сравнить их в meld
	if ($result) {
		$pair = explode(';', $result);
		if (count($pair) == 2) {
			$one = trim($pair[0]);
			$two = trim($pair[1]);
			if (@$data[$one] && @$data[$two]) {
				$one = checkout($one, $target, $data[$one]['date'], $git_dir, $filename_for_git);
				$two = checkout($two, $target, $data[$two]['date'], $git_dir, $filename_for_git);
				system("/usr/bin/meld {$one} {$two}");
			} else {
				alert("Не найдены даты!");
			}
		} else {
			alert("Надо выбрать две версии файла");
		}
	}
}
/**
 * @desc Восстанавливает файл target до ревизии md5 добавляя дату в имя файла
*/
function checkout($md5, $target, $date, $git_dir, $filename_for_git) {
	$a = explode('/', $filename_for_git);
	$shortname = $a[ count($a) - 1 ];
	$date = str_replace(':', '-', $date);
	$date = str_replace(' ', '-', $date);
	$dest = dirname(__FILE__) . '/tmp/' . $date . '-' . $shortname;
	if (file_exists($dest)) {
		return $dest;
	}
	$tmp = dirname(__FILE__) . '/tmp/' . md5($target . time() . '_saved');
	copy($target, $tmp);
	system("cd {$git_dir}; git checkout {$md5} {$filename_for_git}");
	copy($target, $dest);
	system("cd {$git_dir}; git checkout HEAD {$filename_for_git}");
	copy($tmp, $target);
	return $dest;
}
