<? include DR . "/tpl/usermenu.tpl.php" ?>
<? include DR . "/tpl/adminmenu.tpl.php" ?><?php
if ($stat->numRows) {
	?><ul class="lstnone"><?
	foreach ($stat->rows as $r) {
		?><li><?=$r["country_name"] ?>, <?=$r["region_name"]?>, <?=$r["city_name"]?></li><?
	}
	?></ul><?
} else {
	?><div id="mainsfrormsuccess" class="vis">Никто ничего не искал здесь<p></div><?php
}