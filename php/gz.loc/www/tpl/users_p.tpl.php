<? include DR . "/tpl/usermenu.tpl.php" ?>
<? include DR . "/tpl/adminmenu.tpl.php" ?>
<?php if (@$_SESSION["ok_msg"] && @$_GET["status"] === '0') {
?><div id="mainsfrormsuccess" class="vis"><?=@$_SESSION["ok_msg"] ?></div><?php
	unset( $_SESSION["ok_msg"] );
} ?>
<?php if (@$_SESSION["ok_msg"] && @$_GET["status"] > 0) {
?><div id="mainsfrormerror" class="vis"><?=@$_SESSION["ok_msg"] ?></div><?php
	unset( $_SESSION["ok_msg"] );
} ?>
<? FV::$obj = $settingForm ?>
<div id="mainsfrormadd" class="bgwhite">
	<div id="add_legend">Сменить пароль</div>
	<hr id="add_hr"/>
		<form action="/private/users" method="post" name="">
			<div class="aformwrap upformwrap">
					<div class="aphone">
						<label for="phone" class="slabel">Phone</label><br/>
						<?=FV::i("phone") ?>
					</div>
					<div class="right upformbtn">
						<?=FV::sub("sup", "Отправить"); ?>
					</div>
			</div>
			<input type="hidden" name="token" value="<?=@$_SESSION["utoken"] ?>" />
			<input type="hidden" name="action" value="gpwd" />
		</form>
		<div style="border:1px solid gray; margin: 0 auto; width:380px">
		<textarea rows="7" style="width:98%"><?php 
if ($settingForm->pwd) {
	?>Ваш пароль на сайте gazel.me <?="\n".$settingForm->pwd . "\n"?>
Не теряйте его больше!
	<?php
}
?></textarea></div>
</div> 

<div id="mainsfrormadd" class="bgwhite">
	<div id="add_legend">Получить пароль</div>
	<hr id="add_hr"/>
		<form action="/private/users" method="post" name="">
			<div class="aformwrap upformwrap">
					<div class="aphone">
						<label for="phone" class="slabel">Phone</label><br/>
						<?=FV::i("phone") ?>
					</div>
					<div class="right upformbtn">
						<?=FV::sub("sup", "Отправить"); ?>
					</div>
			</div>
			<input type="hidden" name="token" value="<?=@$_SESSION["utoken"] ?>" />
			<input type="hidden" name="action" value="snpwd" />
		</form>
</div> 





