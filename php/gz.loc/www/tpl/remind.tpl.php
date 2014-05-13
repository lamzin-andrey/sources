<? include DR . "/tpl/usermenu.tpl.php" ?>
<?php if (@$_SESSION["ok_msg"] && @$_GET["status"] === '0') {
?><div id="mainsfrormsuccess" class="vis"><?=@$_SESSION["ok_msg"] ?></div><?php
	unset( $_SESSION["ok_msg"] );
} ?>
<?php if (@$_SESSION["ok_msg"] && @$_GET["status"] > 0) {
?><div id="mainsfrormerror" class="vis"><?=@$_SESSION["ok_msg"] ?></div><?php
	unset( $_SESSION["ok_msg"] );
} ?>
<? FV::$obj = $rform ?>
<div id="mainsfrormadd" class="bgwhite">
	<div id="add_legend">Восстановление доступа</div>
	<hr id="add_hr"/>
		<form action="/remind" method="post" name="">
			<div class="aformwrap upformwrap" id="upform">
					<div id="uperror" class="both hide">Неверно введен код</div>
					<div class="aphone">
						<label for="login" class="slabel">Номер телефона</label><br/>
						<label for="login"><img alt="Телефон" title="Телефон" src="/images/phone32.png" /></label> 
						<?=FV::i("login") ?>
					</div>
					<table class="capthtabl">
								<tbody><tr>
									<td> <img width="174" id="cpi" src="/images/random"><br><a class="smbr" id="smbr" href="#">Кликните для обновления рисунка</a> </td>
									<td>
										<input type="text" value="" id="cp" name="cp">
										<div class="right upformbtn">
											<?=FV::sub("sup", "Отправить"); ?>
										</div>
									</td>
								</tr>
						</tbody></table>
					
			</div>
			<input type="hidden" name="token" value="<?=@$_SESSION["utoken"] ?>" />
		</form>
</div> 



