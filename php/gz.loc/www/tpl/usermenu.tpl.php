<div class="buttons">
		<table><tr>
			<?php if ($showAddAdvBtn) {?><td>
				<a href="/podat_obyavlenie" class="hidelink">
					<div class="add button">
						Подать объявление
					</div>
				</a>
			</td><?php }?>
			<?php if ($showCabBtn) {?><td>
				<a href="/cabinet" id="authlink" class="hidelink">
					<div class="auth button">
						<img src="/images/encrypted.png" class="w16"/> <span style="vertical-align:top; display:block-inline" class="">Мои объявления</span>
					</div>
				</a>
			</td><?php }?>
			<?php if ($showExitBtn) {?><td>
				<a href="/logout" id="logoutlink" class="hidelink" title="Выход">
					<div class="out button">
						<img src="/images/out.png" class="w20"/>
					</div>
				</a>
			</td><?php } ?>
			<?php if ($showSetBtn) {?><td>
				<a href="/cabinet/setting" class="hidelink" title="Ваши данные">
					<div class="out button">
						<img src="/images/set.png" class="w20"/>
					</div>
				</a>
			</td><?php } ?>
		</tr></table>
	</div>
	<?php FV::$obj = @$aform; ?>
	<noindex>
		<div class="popupouter hide" id="alayer">
			<div class="aformwrap">
					<div id="autherror" class="both hide">Не найден пользователь с таким логином и паролем</div>
					<div class="aphone">
						<label for="login" class="slabel">Номер телефона</label><br/>
						<label for="login"><img alt="Телефон" title="Телефон" src="/images/phone32.png" /></label> 
						<?=FV::i("login") ?>
					</div>
					<div class="apwd">
						<label for="password" class="slabel">Пароль</label><br/> 
						<?=FV::i("password", @$aform->password, 1) ?>
					</div>
					<div class="left lpm1">
						<a class="smbr" href="/remind" target="_blank">Восстановление пароля</a>
					</div>
					<div class="right prmf">
						<?=FV::but("aop", "Вход"); ?>
					</div>
			</div>
		</div>
	</noindex>