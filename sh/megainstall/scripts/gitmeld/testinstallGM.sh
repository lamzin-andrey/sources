#fragment from megainstall.sh It autmotive

workdir=`pwd`

# .... 

mkdir $HOME/.local/landlib
mkdir $HOME/.local/landlib/apps/
mkdir $HOME/.local/landlib/apps/gitmeld
target=$HOME/.local/landlib/apps/gitmeld
mkdir $target/cache
mkdir $target/tmp
mkdir $HOME/.local/share/applications
cp $workdir/scripts/gitmeld/GitMeld.desktop $HOME/.local/share/applications -f
cp $workdir/scripts/gitmeld/gitmeldnocommfromconsole.sh $target/gitmeldnocommfromconsole.sh -f
cp $workdir/scripts/gitmeld/gitmeldnocommfromconsole.php $target/gitmeldnocommfromconsole.php -f
cp $workdir/scripts/gitmeld/zenitynocommfromconsole.sh $target/zenitynocommfromconsole.sh -f
cp $workdir/scripts/gitmeld/k3b.png $target/k3b.png -f
cp $workdir/scripts/gitmeld/tool.lib.php $target/tool.lib.php -f
cp $workdir/scripts/gitmeld/gitmeldnocomm.php $target/gitmeldnocomm.php -f
echo "Exec php $workdir/scripts/gitmeld/install.php";
php $workdir/scripts/gitmeld/install.php $workdir/scripts/gitmeld $target $HOME/.local/share/applications//GitMeld.desktop
