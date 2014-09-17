<?
/*echo "<pre>";
print_r($regions->data);
echo "</pre>";
die (__FILE__ . ", " . __LINE__) . "\n"; /**/ 
?><?=$regions->breadCrumbs() ?>
<ul class="region-outer-list"><?php
foreach ($regions->data as $letter => $_list) { ?>
	<li>
		<div class="region-inner-list">
		   <? if (count($_list) > $regions->wordsOnLetter) { ?>
<?php ?>			<p><a href="/regions/<?=$regions->regionInnerName?><?=utils_translite_url( utils_cp1251($letter) ) ?>" class="qbtn js-get-regions"><?=$letter ?></a></p>
			<?} else { ?>
				<p><span class="qbtn-dis"><?=$letter ?></span></p>
			<?}  ?>
			<? for ($i = 0; $i < $regions->wordsOnLetter; $i++) {?>
			<?php if (isset($_list[$i])) {?>
				<?php if (!$regions->isRegionInner && $_list[$i]['is_city'] == 0) {?>
					<a href="/regions/<?=utils_translite_url(utils_cp1251($_list[$i]['region_name'])) ?>" class="regions_item js-get-cities"><?=$_list[$i]['region_name'] ?></a>
				<?} else { ?>
					<a href="/<?=$regions->regionInnerName?><?=utils_translite_url(utils_cp1251($_list[$i]['region_name'])) ?>" class="regions_item"><?=$_list[$i]['region_name'] ?></a>
				<?}?>
			<?} ?>
			<?} ?>
		</div>
	</li>
<?php
} 
?></ul>