<?php if (@$_SESSION["ok_msg"] && @$_GET["status"] === '0') {
?><div id="mainsfrormsuccess" class="vis"><?=@$_SESSION["ok_msg"] ?></div><?php
	unset( $_SESSION["ok_msg"] );
} ?>
<?php if (@$_SESSION["ok_msg"] && @$_GET["status"] > 0) {
?><div id="mainsfrormerror" class="vis"><?=@$_SESSION["ok_msg"] ?></div><?php
	unset( $_SESSION["ok_msg"] );
} ?>
<? if ($list->numRows) {
	$a = explode('?', $_SERVER["REQUEST_URI"]);
	$currentTail =  @$a[1] ? '' . '?' . $a[1] : '';
?>
	<ul class="lstnone mlist" id="strip">
		<? foreach($list->rows as $n) {?>
		<?php include DR . "/tpl/mainpagelist_item.tpl.php"?>
		<? }?>
	</ul>
<? } else {?>
<div id="mainsfrormsuccess" class="vis"><p>Извините, для этого населенного пункта пока ничего нет. <br/>Станьте первым, предложившим здесь услуги по перевозке на Газели!</div>
<?php }?>