#! /bin/bash

#2026-11-24 x26.04


#сначала установи lampp, распакуй, скопируй hdata, flipcat.lan copyif NEED!

# Для XamppSsl делать надо такой фикс: во всех файлах вверх выносишь


#import gi

#gi.require_version('Gtk', '3.0')
#gi.require_version('Gdk', '3.0')

# Для qdjs
# ln -s /usr/lib/x86_64-linux-gnu/libxml2.so.16.1.2 ./libxml2.so.2

# Запрос параметров для настройки ssmtp (сама нстройка вызывается ниже, а скрипты в hdata_soft_bash)

#Устанавливаем ping 65
#sudo iptables -t mangle -A POSTROUTING -j TTL --ttl-set 65

#И создаем сервис для этого
#sudo $HOME/hdata/soft/bash/gprsfix/create_service.sh

workdir=`pwd`

# отменено, так как smtp в общедоступных известных почтовых сервисах практически всё.
#ssmptuser=`zenity --entry --text="Введите email с которого планируете спамить в Интернеты"`
#ssmptpassword=`zenity --entry --text="Введите пароль от email с которого планируете сапамить в Интернеты" --hide-text`

# Но оставлены фейковые меёл и пароль, чтобы просто не забыть конфигурацию
ssmptuser=punk@mail.ru
ssmptpassword=forbidden123456

# Отменено, так как на ноябрь 2026 поддержки не предвидится. Ниже две команды, которые работают в xubuntu 26.04
# Что приятно - из коробки. 
# Как только установлю всё что смогу, напишу форму для этоих команд.

#Добавляем всё что есть нестандартного
##it old for 14.04 sudo apt-add-repository ppa:osmoma/audio-recorder
#sudo add-apt-repository ppa:audio-recorder/ppa

# sudo add-apt-repository ppa:ubuntuhandbook1/audio-recorder

# две команды, которые работают в xubuntu 26.04
# line input
# pw-record -P '{ "stream.capture.sink": true }' ~/system-audio.wav

# mic
# pw-record --output ~/recording.wav # notest!

# Обновляемся
sudo apt-get update
#
#Ставим нестандартное
#sudo apt-get install audio-recorder

# echo "Мы постарались установить аудио рекордер. Что получилось, мы не знаем."

# exit

#Ставим стандартное
# wireshark
sudo apt-get install filezilla  mtools mc git putty meld geany synaptic g++ virtualbox oxygen-icon-theme kate kolourpaint gimp qgit 7zip 7zip-full 7zip-rar graphicsmagick gparted nodejs npm mplayer fontforge ssmtp  curl vim  tor kazam nestopia ktorrent  sshpass vlc libx11-dev ghex brasero cpufrequtils hardinfo  net-tools webp gthumb chromium-browser -y

echo "Смотри, что теперь нельзя установиьт через sudo apt-get install";
# telegram-desktop
#chromium-browser wireshark
# exit;

#Ставим nodejs && gulp - пока почти неактуально
##gulp
#cd /opt/lampp/htdocs/flipcat.lan
#rm -rf node_modules
#sudo npm install -g npm@6.5.0
sudo npm install -g gulp@3.9.1
sudo npm i -g gulp-cli
#точно помню что на i386 пришлось также npm install gulp без sudo  и -g иначе не работало, но на amd64 пошло
#npm install laravel-elixir
#sudo chown andrey:andrey -R $HOME/.npm
#sudo chmod 777 -R $HOME/.npm

#npm install gulp
#npm install laravel-elixir

cd /home/$USER/hdata/soft/bash/merge
sudo ln -s $HOME/hdata/soft/bash/publicmy/public /usr/bin/public
sudo ln -s /opt/lampp/bin/php /usr/bin/php

# TODO чекнуть версии - не удалось найти ничего похожего
# sudo ln -s /usr/lib/i386-linux-gnu/libMagickWand-6.Q16.so.3 /usr/lib/i386-linux-gnu/libMagickWand.so.5
# sudo ln -s /usr/lib/i386-linux-gnu/libMagickCore-6.Q16.so.3 /usr/lib/i386-linux-gnu/libMagickCore.so.5

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
sudo chmod 755  /usr/local/bin/lfgit
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

#lwgit 2026
cd $workdir/scripts/lwgit
tar -xvzf aws.tar.gz
sudo cp -rf $workdir/scripts/lwgit/aws /usr/local/bin/aws
sudo cp -f $workdir/scripts/lwgit/laws.php /usr/local/bin/laws.php
sudo cp -f $workdir/scripts/lwgit/lwgit.php /usr/local/bin/lwgit
rm -rf $workdir/scripts/lwgit/aws

#lpinger 2026
crontab -l > $workdir/scripts/pinger/cron.tpl.txt
python3 $workdir/scripts/pinger/install.py
crontab $workdir/scripts/pinger/cron.txt

#lcreatemap 2026
sudo cp -f $workdir/scripts/createmap/lcreatemap.py /usr/local/bin/lcreatemap
sudo chmod +x $workdir/scripts/createmap/lcreatemap

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
#sudo cp /usr/bin/xfce4-screenshooter /usr/bin/xfce4-screenshooter.native.ironcopy
#$HOME/hdata/soft/bash/screenshooter/screenshooter-installer.sh

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

# TODO здесь иметь ввиду, что появился каталог gtk-4

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

# 2026-11-24 path geany
killall geany
cp -f $workdir/cnf/geany.tar.gz $HOME/.config/geany.tar.gz
mv $HOME/.config/geany $HOME/.config/geany--
cd $HOME/.config
tar -xvzf geany.tar.gz

