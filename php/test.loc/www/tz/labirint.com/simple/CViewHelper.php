<?php
class CViewHelper {
	static public function renderTree($tree, $offset = 1) {
		if (count($tree) == 0) {
			return;
		}
		foreach ($tree as $branch) {
			?><div class="treeitem" style="padding-left:<?=$offset *20?>px"><?=@$branch["data"]["section_name"] ?><span class="green">(id = <?=@$branch["data"]["id"] ?>, parentId = <?=@$branch["data"]["parent_id"] ?>)</span></div><?
			CViewHelper::renderTree(@$branch["childs"], ($offset + 1));
		}
	}
}