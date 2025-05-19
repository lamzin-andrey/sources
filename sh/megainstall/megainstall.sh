#! /bin/bash

#2025-05-13


#сначала установи lampp, распакуй, скопируй hdata, flipcat.lan copyif NEED!

# Запрос параметров для настройки ssmtp (сама нстройка вызывается ниже, а скрипты в hdata_soft_bash)

#Устанавливаем ping 65
#sudo iptables -t mangle -A POSTROUTING -j TTL --ttl-set 65

#И создаем сервис для этого
#sudo $HOME/hdata/soft/bash/gprsfix/create_service.sh

workdir=`pwd`

ssmptuser=`zenity --entry --text="Введите email с которого планируете спамить в Интернеты"`


ssmptpassword=`zenity --entry --text="Введите пароль от email с которого планируете сапамить в Интернеты" --hide-text`

#Добавляем всё что есть нестандартного
##it old for 14.04 sudo apt-add-repository ppa:osmoma/audio-recorder
sudo add-apt-repository ppa:audio-recorder/ppa

#Обновляемся
sudo apt-get update

#Ставим нестандартное
sudo apt-get install audio-recorder


#Ставим стандартное
#chromium-browser wireshark
sudo apt-get install filezilla  mtools mc git putty meld geany synaptic g++ virtualbox oxygen-icon-theme kate kolourpaint gimp qgit p7zip p7zip-full p7zip-rar gparted nodejs npm mplayer fontforge ssmtp telegram-desktop curl vim  tor kazam nestopia ktorrent  sshpass vlc libx11-dev ghex brasero cpufrequtils hardinfo  net-tools graphicsmagick-imagemagick-compat webp gthumb -y



#exit;

#Ставим nodejs && gulp
##gulp
cd /opt/lampp/htdocs/flipcat.lan
rm -rf node_modules
sudo npm install -g npm@6.5.0
sudo npm install -g gulp@3.9.1
sudo npm i -g gulp-cli
#точно помню что на i386 пришлось также npm install gulp без sudo  и -g иначе не работало, но на amd64 пошло
npm install laravel-elixir
sudo chown andrey:andrey -R $HOME/.npm
sudo chmod 777 -R $HOME/.npm

npm install gulp
npm install laravel-elixir

cd /home/$USER/hdata/soft/bash/merge
sudo ln -s $HOME/hdata/soft/bash/publicmy/public /usr/bin/public
sudo ln -s /opt/lampp/bin/php /usr/bin/php

sudo ln -s /usr/lib/i386-linux-gnu/libMagickWand-6.Q16.so.3 /usr/lib/i386-linux-gnu/libMagickWand.so.5
sudo ln -s /usr/lib/i386-linux-gnu/libMagickCore-6.Q16.so.3 /usr/lib/i386-linux-gnu/libMagickCore.so.5

public $HOME/hdata/soft/bash/merge/create_migration.sh
public $HOME/hdata/soft/bash/merge/drop_last_mig.sh
public $HOME/hdata/soft/bash/merge/fix.sh
public $HOME/hdata/soft/bash/merge/gulp.sh
public $HOME/hdata/soft/bash/merge/gulpperiod.sh
public $HOME/hdata/soft/bash/merge/gulpperiodrun.sh
public $HOME/hdata/soft/bash/merge/gulpperiodstop.sh
public $HOME/hdata/soft/bash/merge/merbs.sh
public $HOME/hdata/soft/bash/merge/merge.sh
public $HOME/hdata/soft/bash/merge/mergepart.sh
public $HOME/hdata/soft/bash/merge/mupdater.sh
public $HOME/hdata/soft/bash/merge/newtask.sh
public $HOME/hdata/soft/bash/merge/reindex.sh
public $HOME/hdata/soft/bash/merge/release.sh
public $HOME/hdata/soft/bash/merge/rlb.sh
public $HOME/hdata/soft/bash/merge/rorig.sh
public $HOME/hdata/soft/bash/merge/switchphp.sh
public $HOME/hdata/soft/bash/merge/ttf2svg.sh
public $HOME/hdata/soft/bash/merge/viewlog.sh
public $HOME/hdata/soft/bash/xamppclean/xamppclean.sh
public $HOME/hdata/soft/bash/phv.sh
public $HOME/hdata/soft/bash/quick_back/qb.sh
public $HOME/hdata/soft/bash/sym/docdbupd.sh
public $HOME/hdata/soft/bash/sym/cache_clear.sh
public $HOME/hdata/soft/bash/sym/make_controller.sh
public $HOME/hdata/soft/bash/sym/make_form.sh
public $HOME/hdata/soft/bash/merge/rmnm.sh
public $HOME/hdata/soft/bash/sym/migrun.sh
public $HOME/hdata/soft/bash/merge/clear_rosfin_cache/db_feat/set_user_id.sh
public $HOME/hdata/soft/bash/merge/clear_rosfin_cache/add_test_user.sh
public $HOME/hdata/soft/bash/settl.sh
public $HOME/hdata/soft/bash/merge/clear_rosfin_cache/db_feat/offerlog.sh
public $HOME/hdata/soft/bash/merge/labeep.sh
public $HOME/hdata/soft/bash/merge/clear_rosfin_cache/db_feat/run_sql_query.sh
public $HOME/hdata/soft/bash/merge/labeep/labeep.sh
public $HOME/hdata/soft/bash/sym/migrun.sh
public $HOME/hdata/soft/bash/merge/clear_rosfin_cache/qb2/qb2.sh

#Install tools 2025
sudo cp -f $workdir/scripts/dcint.php /usr/local/bin/pcint
sudo cp -f $workdir/scripts/dspub.py /usr/local/bin/dspub
sudo cp -f $workdir/scripts/lfgit/lfgit.php /usr/local/bin/lfgit
sudo cp -f $workdir/scripts/lfgit/FtpService.php /usr/local/bin/FtpService.php
#gitmeld 2025
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
#echo "Exec php $workdir/scripts/gitmeld/install.php";
php $workdir/scripts/gitmeld/install.php $workdir/scripts/gitmeld $target $HOME/.local/share/applications//GitMeld.desktop




#qdjs
sudo ln -s $HOME/hdata/soft/desktop-js/run.sh /usr/local/bin/qdjs

#capslock
cd /home/$USER/hdata/programs/my/qdjs/capslockstate/app/c/capslockstate/
rm /home/$USER/hdata/programs/my/qdjs/capslockstate/app/c/capslockstate/capslockstate
./compile.sh
cp /home/$USER/hdata/programs/my/qdjs/capslockstate/app/c/capslockstate/capslockstate /home/$USER/hdata/programs/my/qdjs/capslockstate/app/capslockstate
cp /home/$USER/hdata/programs/my/qdjs/capslockstate/yuic.desktop /home/$USER/.config/autostart/yuic.desktop

#screenshoter
#mkdir $HOME/screenshots
#sudo cp /usr/bin/xfce4-screenshooter /usr/bin/xfce4-screenshooter.native
$HOME/hdata/soft/bash/screenshooter/screenshooter-installer.sh

#ssmtpconfig

sudo /opt/lampp/bin/php /home/$USER/hdata/soft/bash/ssmtp/ssmtpconf.php $ssmptuser $ssmptpassword

#install flash
$HOME/hdata/programs/my/qdjs/jaqFlash/app/flash_addons/flashplayer/install.sh
cd $HOME/hdata/programs/my/qdjs/jaqFlash/app/i/icons
./setmime-run-in-console.sh
# ?? cd cp $HOME/hdata

#Copy .desktop files
mkdir $HOME/.local/share/applications
cp $HOME/hdata/programs/my/qdjs/moonPhase/moonPhase.desktop $HOME/.local/share/applications -f
cp $HOME/hdata/soft/bash/screenshooter/screnshooter.desktop $HOME/.local/share/applications -f
cp $HOME/hdata/programs/my/qdjs/jaqFlash/jqflash.desktop $HOME/.local/share/applications -f
cp $HOME/hdata/programs/my/qdjs/jaqVideoConverter/jaqF.desktop $HOME/.local/share/applications -f
cp $HOME/hdata/soft/bash/merge/g-s-t-custom.desktop $HOME/.local/share/applications -f


# set scrollbars
mkdir $HOME/.config/gtk-3.0

echo '
.scrollbar.vertical slider, 
	scrollbar.vertical slider {
	min-width: 14px;
	background-color:#C3D5FD;
	border-radius: 1px;
	border: 2px solid #6285D4;
}

.scrollbar.horizontal slider, 
	scrollbar.horizontal slider {
	min-height: 14px;
	background-color:#C3D5FD;
	border-radius: 1px;
	border: 2px solid #6285D4;
}' > $HOME/.config/gtk-3.0/gtk.css


# 2022-09-03
# Patch lock/unlock layer icon for Inkscape with oxygen
sudo cp -f /usr/share/icons/oxygen/base/16x16/actions/document-decrypt.png /usr/share/icons/oxygen/base/16x16/actions/document-decrypt-origin.png
sudo cp -f /usr/share/icons/oxygen/base/16x16/actions/document-edit.png /usr/share/icons/oxygen/base/16x16/actions/document-decrypt.png
