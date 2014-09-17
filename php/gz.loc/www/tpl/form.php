<div id="mfwrap">
	<? include DR . "/tpl/usermenu.tpl.php" ?>
	<div>&nbsp;</div>
	<div id="mainsfrorm">
		<form action="/" method="get" name="search" id ="search">
			<?php FV::$obj = $list; ?>
			<span class="ib"><a href="/regions" class="regions_page_link">Мегаполис/Регион</a>: <select id="region" name="region"><option>Выберите регион</option></select> </span>
			<span class="ib">Населенный пункт: <select id="city" name="city"><option>Выберите город</option></select> </span>
			<div class="center slogan">
				<a href="/regions" class="regions_page_link">Воспользуйтесь альтернативным выбором Вашего населенного пункта</a>
			</div>
			<div class="right prmf">
				<?=FV::checkbox("people", "Пассажирская") ?>
				<?=FV::checkbox("box", "Грузовая", '') ?>
				<?=FV::checkbox('term', 'Термобудка', '') ?>
				<?=FV::checkbox('far', 'Межгород', '') ?>
				<?=FV::checkbox('near', 'По городу', '') ?>
				<?=FV::checkbox('piknik', 'За город (пикник)', '') ?>
				<input type="submit" value="Найти"/>
			</div>
			<div class="both"></div>
		</form>
	</div>
</div>
