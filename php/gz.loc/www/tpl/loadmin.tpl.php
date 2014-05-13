<? include DR . "/tpl/usermenu.tpl.php" ?>
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
	<div id="add_legend">Авторизация</div>
	<hr id="add_hr"/>
		<form action="/private/login" method="post" name="">
			<div class="aformwrap upformwrap">
					<div class="aphone">
						<label for="login" class="slabel">Логин</label><br/>
						<?=FV::i("login") ?>
					</div>
					<div class="aphone">
						<label for="pwd" class="slabel">Пароль</label><br/>
						<?=FV::i("pwd", null, 1) ?>
					</div>
					
					<div class="right upformbtn">
						<?=FV::sub("sup", "Вход"); ?>
					</div>
			</div>
			<input type="hidden" name="token" value="<?=@$_SESSION["utoken"] ?>" />
		</form>
</div> 



