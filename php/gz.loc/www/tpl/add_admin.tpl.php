<? include DR . "/tpl/usermenu.tpl.php" ?>
<? include DR . "/tpl/adminmenu.tpl.php" ?>
<?php FV::$obj = $addForm; ?>
<div id="mainsfrormerror"><?php if (count($addForm->errors)) {
?><? foreach($addForm->errors as $e) print "<p>$e</p>\n";?><?php } ?></div>
<?php if (count($addForm->errors)) {
?><script type="text/javascript">
	$("mainsfrormerror").setStyle("display", "block");
</script>
<?php }?>
<div id="mainsfrormsuccess"><?php if ($addForm->success) { print $addForm->successMessage; }?></div><?php if ($addForm->success) {?>
	<script type="text/javascript">
	$("mainsfrormsuccess").setStyle("display", "block");
</script>
<?}?>
<div id="mainsfrorm">
	<div id="add_legend">Добавить свое объявление</div>
	<hr id="add_hr"/>
		<form action="/podat_obyavlenie" method="post" name="add" id ="add" enctype="multipart/form-data">
			<span class="ib">Мегаполис/Регион: <select id="region" name="region"><option>Выберите регион</option></select> </span>
			<span class="ib">Населенный пункт: <select id="city" name="city"><option>Выберите город</option></select> </span>
			<div class="right prmf">
				<input type="checkbox" value="1" id="people" name="people"/><label for="people">Пассажирская</label>
				<input type="checkbox" value="1" id="box" name="box"/><label for="box">Грузовая</label>
				<?=FV::checkbox('term', 'Термобудка') ?>
				<input type="checkbox" value="1" id="far" name="far"/><label for="far">Межгород</label>
				<input type="checkbox" value="1" id="near" name="near"/><label for="near">По городу</label>
				<input type="checkbox" value="1" id="piknik" name="piknik"/><label for="piknik">За город (пикник)</label>
			</div>
			<div class="both"></div>
			<p class="adtitle">
				<?=FV::labinp("title", "Заголовок объявления *", @$addform->title);?>
			</p>
			<p class="add_text">
				<label for="addtext">Текст объявления <span class="red">*</span></label>
				<textarea id="addtext" name="addtext" rows="16" style="width:100%" rel="afctrl"><?=@$addForm->addtext?></textarea>
				<span class="right praf" id="afctrl">955 / 1000</span>
			</p>
			<p class="price">
					<?=FV::labinp("price", "Стоимость");?>
				</p>
			<p class="image ">
				<img src="<?=(@$addForm->image ? $addForm->image : '/images/gazel.jpg') ?>" class="ii" id="imgview"/> <label for="image">Загрузите изображение</label><br/>
				<table>
					<tr>
						<td>
							<input type="file" id="image" name="image" style="width:173px"/>
						</td>
						<td>
							<img src="/images/l-w.gif" id="upLdr" class="hide"/>
						</td>
					</tr>
				</table>
				<input type="hidden" id="ipath" name="ipath" value="<?=@$addForm->image ?>"/>
			</p>
			<div class="both"></div>
			<div class="both"></div>
			<p class="adname">
				<?=FV::labinp("name", "Введите ваше имя или название компании *", @$addform->name);?>
			</p>
			
			<p class="adphone">
				<?=FV::labinp("phone", "Введите ваш телефон *", @$addform->phone);?>
			</p>
			<div class="both"></div>
			
			<div class="right prmf">
				<input type="submit" value="Подать объявление" id="addsubmit" />
				<input type="hidden" name="token" value="<?=$_SESSION["utoken"] ?>"/>
			</div>
			<div class="both"></div>
		</form>
</div> 



