<?
	class FV {
		static public $obj = null;
		
		static public function  i($id, $value = null, $isPassword = 0) {
			$type = "text";
			if ($isPassword) {
				$type = "password";
			}
			self::checkValue($value, $id);
			$label = str_replace('*', '<span class="red">*</span>', $label);
			return '<input type="'.$type.'" name="'.$id.'" id="'.$id.'" value="'.$value.'" />';
		}
		static public function  checkbox($id, $label, $space = ' ') {
			self::checkValue($v, $id);
			$ch = '';
			if ($v) {
				$ch = 'checked="checked"';
			}
			return '<input type="checkbox" name="'.$id.'" id="'.$id.'" value="1" '.$ch.'/>' . $space . '<label for="'.$id.'">'.$label.'</label>';
		}
		static public function  radio($id, $name, $label, $value = null) {
			self::checkValue($value, $id);
			$ch = '';
			if ($value) {
				$ch = 'checked="checked"';
			}
			$label = str_replace('*', '<span class="red">*</span>', $label);
			return '<input type="radio" name="'.$name.'" id="'.$id.'" value="'.$value.'" '.$ch.'/> <label for="'.$id.'">'.$label.'</label>';
		}
		static public function  sub($id, $value = null) {
			self::checkValue($value, $id);
			return '<input type="submit" name="'.$id.'" id="'.$id.'" value="'.$value.'" />';
		}
		static public function  but($id, $value = null, $css = '', $dataattr = array()) {
			self::checkValue($value, $id);
			if ($css) {
				$css = ' class="' . $css . '" ';
			}
			$attr = '';
			foreach ($dataattr as $k => $i) {
				$attr .= "data-$k=\"$i\" ";
			}
			return '<input type="button" name="'.$id.'" id="'.$id.'" value="'.$value.'" ' . $css . ' ' . $attr . ' />';
		}
		static public function  inplab($id, $label, $value = null) {
			self::checkValue($value, $id);
			$label = str_replace('*', '<span class="red">*</span>', $label);
			return '<input type="text" name="'.$id.'" id="'.$id.'" value="'.$value.'" /> <label for="'.$id.'">'.$label.'</label>';
		}
		static public function  labinp($id, $label, $value = null, $maxlength = 0, $ispass = 0, $disabled = 0) {
			self::checkValue($value, $id);
			$label = str_replace('*', '<span class="red">*</span>', $label);
			$s =  '';
			if ($maxlength) {
				$s = 'maxlength="'.$maxlength.'"';
			}
			$type = "text";
			if ($ispass) {
				$type = "password";
			}
			$dis = '';
			if ($disabled) {
				$dis = 'disabled="disabled"';
			}
			return '<label for="'.$id.'">'.$label.'</label> <input type="'.$type.'" name="'.$id.'" id="'.$id.'" value="'.$value.'" '.$maxlength.' ' . $dis . '/>';
		}
		static private function checkValue(&$value, $id) {
			if ($value ===  null && @self::$obj->$id) {
				$value = self::$obj->$id;
			}
		}
	}