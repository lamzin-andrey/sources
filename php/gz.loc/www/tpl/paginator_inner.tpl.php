<?php if ($list->maxpage > $list->page) {?>
	<div class="left pl3">
		<a href="#" id="moreitems" class="hidelink">
			<div class="button more" id="bmore">
				<img src="/images/lw.gif"class="plm hide"/>
				<span style="vertical-align:top; display:block-inline">Еще <?=$list->limit ?></span>
			</div>
		</a>
	</div>
<?php }?>
<div class="both"></div>
<ul id="paglist">
<?php foreach ($pageData as $p) {?>
	<li <? if ($p->active) {?>class="active"<?}?> ><? if (!$p->active) {?><a href="<?=Shared::setUrlVar("page", $p->n); ?>"><?
		print ($p->text ? $p->text : $p->n);
	 ?></a><?} else { 
	 	?><span><?=$p->n ?></span><?php
         }?></li>
<?php }?>
</ul>