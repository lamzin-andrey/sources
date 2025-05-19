<?php
include dirname(__FILE__) . '/tool.lib.php';
$target = $argv[1];
$git_dir = getGitRoot($target);   //каталог, в котором лежит рабочая копия гит
if ($git_dir) {
	/*
	 * # Скопировать заданный файл в темп (к1)
		# Откатить с помощью гит заданный файл
		# Скопировать заданный файл в темп
		# Скопировать к1 из темп как заданный файл
		# Запустить мелд для копий
		#неплохо бы еще добавить получение имени каталога с .git и сделать таким образом универсальный скрипт
	 */
	 //Скопировать заданный файл в темп (к1)
	 $tmp_file = md5($target . time());
	 $tmp_dir = dirname(__FILE__) . "/tmp";
	 copy($target, "{$tmp_dir}/{$tmp_file}");
	 // # Откатить с помощью гит заданный файл
	 $target_for_git = str_replace($git_dir . '/', '', $target);
	 system("cd {$git_dir}; git checkout -- {$target_for_git}");
	 //alert("cd {$git_dir}; git checkout -- {$target_for_git}");
	 // # Скопировать заданный файл в темп
	 $tmp_file_r = md5($target . '_reverted_' . time());
	 copy($target, "{$tmp_dir}/{$tmp_file_r}");
	 // # Скопировать к1 из темп как заданный файл
	 copy("{$tmp_dir}/{$tmp_file}", $target);
	 # Запустить мелд для копий
	 system("/usr/bin/meld {$target} {$tmp_dir}/{$tmp_file_r}");
	 unlink("{$tmp_dir}/{$tmp_file_r}");
	 unlink("{$tmp_dir}/{$tmp_file}");
} else {
	alert('Не найдена рабочая копия для файла ' . $target . ', выход');
}
