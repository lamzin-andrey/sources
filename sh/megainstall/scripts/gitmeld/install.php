<?php
function main(string $workdir, string $target, string $lnkDir)
{
	// 1 create desktop file
	updatePaths("$workdir/GitMeld.desktop", $lnkDir, $target);
	// 2 path shell script
	updatePaths("$workdir/gitmeldnocommfromconsole.sh", "$target/gitmeldnocommfromconsole.sh", $target);
}

function updatePaths(string $src, string $dest, string $targetPathFragment) {
	$content = file_get_contents($src);

	echo "Reading content:\n\n $content\n=====EOF====\n\n";
	$SRCSTR = '/home/andrey/hdata/soft/bash/gitmeld';
	$DESTSTR = $targetPathFragment;
	echo "Replace '$SRCSTR' to '$targetPathFragment'\n\n";
	$content = str_replace($SRCSTR, $DESTSTR, $content);
	echo "Replaced content:\n\n $content\n=====EOF====\n\n";
	file_put_contents($dest, $content);
	echo "end UP\n\n\n";
}

main($argv[1], $argv[2], $argv[3]);
// Tuple test 
