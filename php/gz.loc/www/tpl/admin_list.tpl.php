<?php if (@$_SESSION["ok_msg"] && @$_GET["status"] === '0') {
?><div id="mainsfrormsuccess" class="vis"><?=@$_SESSION["ok_msg"] ?></div><?php
	unset( $_SESSION["ok_msg"] );
} ?>
<?php if (@$_SESSION["ok_msg"] && @$_GET["status"] > 0) {
?><div id="mainsfrormerror" class="vis"><?=@$_SESSION["ok_msg"] ?></div><?php
	unset( $_SESSION["ok_msg"] );
} ?>
<? if ($list->numRows) {?>
	<ul class="lstnone mlist">
		<? foreach($list->rows as $n) {?>
		<li id="item-<?=$n["id"]?>">
			<img src="<?=$n['image'] ?>" class="ii" title="<?=$n['addtext'] ?>" />
			<div class="shortitemtext left">
				<header><a href='#' title="<?=$n['addtext'] ?>"><?=$n['title'] ?></a></header>
				<div class="text">
					<?php if ($n['price'] > 0) {?><div class="vprice b"><span class="name">Цена:</span> <?=Shared::price($n['price']) ?></div><?} ?>
					<div class="name"><?=$n['region_name'] ?>  <?=$n['city_name'] ?></div>
					<div class="name"><?=$n['name'] ?></div>
					<div class="name"><?=$n['type'] ?></div>
					<div class="phone">
						Телефон: <?=Shared::formatPhone($n["phone"]) ?>
					</div>
				</div>
			</div>
			<div class="cabcontrols">
				<?php 
					if (!$n["is_moderate"]) {
						print FV::but("moder", "Публиковать", 'mbtn', array("id" => $n["id"]));
					}
				?>
				<?=FV::but("delete", "Удалить", 'dbtn', array("id" => $n["id"])) ?>
				<? if (!$n["is_moderate"]) {?>
					<span class="cabitem darkred pt10">Не проверено модератором</span>
				<?} ?>
			</div>
			<div class="both"></div>
			<div class="pt10">
				<div class="avte">
					<?php print str_replace("\n", "<br>", $n["addtext"]) ?>
				</div>
			</div>
		</li>
		<? }?>
	</ul>
<? } ?>