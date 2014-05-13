<? include DR . "/tpl/usermenu.tpl.php" ?>
<?php if (@$addForm->javascript) {?>
<script type="text/javascript">
$(document).addEvent('domready', addFormPostAction);
function addFormPostAction() {
<?=$addForm->javascript ?>
}
</script>
<?php }?>
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
<div id="mainsfrormadd">
	<div id="add_legend">Добавить свое объявление</div>
	<hr id="add_hr"/>
		<form action="/podat_obyavlenie" method="post" name="add" id ="add" enctype="multipart/form-data">
			<span class="ib">Мегаполис/Регион: <select id="region" name="region"><option>Выберите регион</option></select> </span>
			<span class="ib">Населенный пункт: <select id="city" name="city"><option>Выберите город</option></select> </span>
			<div class="right prmf">
				<?=FV::checkbox('people', 'Пассажирская') ?>
				<?=FV::checkbox('box', 'Грузовая') ?>
				<?=FV::checkbox('term', 'Термобудка') ?>
				<?=FV::checkbox('far', 'Межгород') ?>
				<?=FV::checkbox('near', 'По городу') ?>
				<?=FV::checkbox('piknik', 'За город (пикник)') ?>
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
			<p class="adname">
				<?=FV::labinp("name", "Введите ваше имя или название компании *", @$addform->name, 0, 0, $authorized);?>
			</p>
			
			<p class="adphone">
				<?=FV::labinp("phone", "Введите ваш телефон *", @$addform->phone, 0, 0, $authorized);?>
			</p>
			<?php if (!$authorized) {?>
			<div id="grb">
				<p class="register">Если хотите обновлять и редактировать объявление, введите пароль
				<br/>Адрес электронной почты понадобится вам, если вы его забудете.</p>
				<p class="pwdmail">
					<?=FV::labinp("pwd", "Пароль", '', 0, 1);?>
				</p>
				<p class="pwdmail">
					<?=FV::labinp("email", "Email");?>
				</p>
			</div>
			<? } ?>
			
			<div class="both"></div>
			
			<div class="left">
				<table class="capthtabl">
						<tr>
							<td> <img src="/images/random" width="174"id="cpi" /><br><a href="#" class="smbr" id="smbr">Кликните для обновления рисунка</a> </td>
							<td>
								<label for="cp">Введите текст <span class="red">*</span></label><br>
								<?=FV::i("cp", '')?>
							</td>
						</tr>
				</table>
			</div>
			
			<div class="right prmf">
				<input type="submit" value="Подать объявление" id="addsubmit" />
				<input type="hidden" name="token" value="<?=$_SESSION["utoken"] ?>"/>
			</div>
			<div class="both"></div>
		</form>
</div> 



