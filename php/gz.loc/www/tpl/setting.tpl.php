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
	<div id="add_legend">Ваши данные</div>
	<hr id="add_hr"/>
		<form action="/cabinet/setting" method="post" name="">
			<div class="aformwrap upformwrap setform">
					<div class="aphone sz12">
						<label for="email" class="slabel">E-mail</label><br/>
						<?=FV::i("email") ?>
					</div>
					<div class="aphone sz12">
						<label for="name" class="slabel">Имя или название орагнизации</label><br/>
						<?=FV::i("name") ?>
					</div>
					
					<div class="aphone sz12">
						<label for="cpwd" class="slabel">Ваш текущий пароль</label><br/>
						<?=FV::i("cpwd", null, 1) ?>
					</div>
					
					<div class="aphone sz12">
						<label for="pwd1" class="slabel">Новый пароль</label><br/>
						<?=FV::i("pwd1", null, 1) ?>
					</div>
					
					<div class="aphone sz12">
						<label for="pwd2" class="slabel">Новый пароль повторно</label><br/>
						<?=FV::i("pwd2", null, 1) ?>
					</div>
					
					<div class="right upformbtn">
						<?=FV::sub("sup", "Отправить"); ?>
					</div>
			</div>
			<input type="hidden" name="token" value="<?=@$_SESSION["utoken"] ?>" />
		</form>
</div> 



