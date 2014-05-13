<? include DR . "/tpl/usermenu.tpl.php" ?>
<?php if (@$_SESSION["ok_msg"] && @$_GET["status"] === '0') {
?><div id="mainsfrormsuccess" class="vis"><?=@$_SESSION["ok_msg"] ?></div><?php
	unset( $_SESSION["ok_msg"] );
} ?>
<?php if (@$_SESSION["ok_msg"] && @$_GET["status"] > 0) {
?><div id="mainsfrormerror" class="vis"><?=@$_SESSION["ok_msg"] ?></div><?php
	unset( $_SESSION["ok_msg"] );
} ?>
<? if ($cabinet->numRows) {?>
	<ul class="lstnone mlist">
		<? foreach($cabinet->rows as $n) {?>
		<li>
			<img src="<?=$n['image'] ?>" class="ii" title="<?=$n['addtext'] ?>" />
			<div class="shortitemtext left">
				<header><a href='#' title="<?=$n['addtext'] ?>"><?=$n['title'] ?></a></header>
				<div class="text">
					<?php if ($n['price']) {?><div class="vprice b"><span class="name">Цена:</span> <?=Shared::price($n['price']) ?></div><?} ?>
					<div class="name"><?=$n['region_name'] ?>  <?=$n['city_name'] ?></div>
					<div class="name"><?=$n['name'] ?></div>
					<div class="name"><?=$n['type'] ?></div>
					<div class="phone">
						Телефон: <a class="dashed gn" data-id="<?=$n["id"] ?>" href="#">
						Показать</a>
					</div>
				</div>
			</div>
			<div class="cabcontrols">
				<a href="/cabinet/edit/<?=$n['id'] ?>">Редактировать</a>
				<a href="/cabinet/up/<?=$n['id'] ?>">Поднять</a>
				<a href="/cabinet/<?=($n["is_hide"] == 0 ? 'hide' : 'show') ?>/<?=$n["id"] ?>" class="hideshow"><?=($n["is_hide"] == 0 ? 'Скрыть' : 'Показать') ?></a>
				<a href="/cabinet/delete/<?=$n['id'] ?>" class="delitem">Удалить</a>
				<? if (!$n["is_moderate"]) {?>
					<span class="cabitem darkred pt10">Не проверено модератором</span>
				<?} ?>
			</div>
			<div class="both"></div>
			<div class="b please hide">
			<div class="please_in">
				<img src="/images/l-w.gif" width="16" class="ldr">
				<span >Пожалуйста, скажите, что вы звоните по объявлению на сайте GAZel.Me</span>
				<img src="/images/blank.png" class="result hide"/>
			</div>
		</div>
		</li>
		<? }?>
	</ul>
<? } ?>