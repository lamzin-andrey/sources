<? include DR . "/tpl/usermenu.tpl.php" ?>
<div id="mainsfrormadd" class="bgwhite">
	<div id="add_legend">Поднять объявление</div>
	<hr id="add_hr"/>
		<form action="/cabinet/up/<?=$upform->id ?>" method="post" name="">
			<div class="aformwrap upformwrap" id="upform">
					<div id="uperror" class="both hide">Неверно введен код</div>
					<div class="f10">Для того, чтобы поднять в результатах поиска объявление "<?=$upform->title ?>" 
					введите текст с изображения ниже и нажмите кнопку "Поднять". 
					</div>
					<table class="capthtabl">
								<tbody><tr>
									<td> <img width="174" id="cpi" src="/images/random"><br><a class="smbr" id="smbr" href="#">Кликните для обновления рисунка</a> </td>
									<td>
										<input type="text" value="" id="cp" name="cp">
										<div class="right upformbtn">
											<?=FV::sub("sup", "Поднять"); ?>
										</div>
									</td>
								</tr>
						</tbody></table>
					
			</div>
			<input type="hidden" name="token" value="<?=@$_SESSION["utoken"] ?>" />
		</form>
</div> 



