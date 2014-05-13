<?php
class Validators {
	static public function is_require($var, $label, &$errors, $post = true) {
		$data = $_POST;
		if (!$post) {
			$data = $_GET;
		}
		if (trim(@$data[$var]) == '') {
			$errors[$var] = "Поле \"$label\" обязательно для заполнения";
		}
	}
}