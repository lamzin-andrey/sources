#! /bin/bash
/etc/init.d/apache stop
/etc/init.d/apache22 stop
/etc/init.d/apache24 stop
/opt/lampp/lampp stop
echo Копирование файлов
cp -f /home/xubuntu/64-xampp-7.4.28-installer-u22.04-qt5.5.1-r06/app/data/xampp-php74.tar.gz /opt/xampp.tar.gz
echo Распаковка архива, пожалуйста ждите
cd /opt
adduser --system --disabled-password --disabled-login mysql
tar -xzvf /opt/xampp.tar.gz
echo 'extract_complete'

mv /opt/lampp/etc/extra /opt/lampp/etc/__extra
cp -rf /home/xubuntu/64-xampp-7.4.28-installer-u22.04-qt5.5.1-r06/app/data/extra /opt/lampp/etc/extra
chmod -R 777 /opt/lampp/etc/extra
chmod  776 /etc/hosts
echo 'Конфигурация multihosts'
mv /opt/lampp/etc/httpd.conf /opt/lampp/etc/__httpd.conf
cp -f /home/xubuntu/64-xampp-7.4.28-installer-u22.04-qt5.5.1-r06/app/data/httpd.conf /opt/lampp/etc/httpd.conf
chmod 777 /opt/lampp/htdocs
mkdir /opt/lampp/htdocs/localhost
mkdir /opt/lampp/htdocs/localhost/www
chmod 777 /opt/lampp/htdocs/localhost/www
cp -rf /opt/lampp/htdocs/dashboard /opt/lampp/htdocs/localhost/www/dashboard
rm -r /opt/lampp/htdocs/dashboard
cp -rf /opt/lampp/htdocs/img /opt/lampp/htdocs/localhost/www/img
rm -r /opt/lampp/htdocs/img
cp -rf /opt/lampp/htdocs/webalizer /opt/lampp/htdocs/localhost/www/webalizer
rm -r /opt/lampp/htdocs/webalizer
cp -f /opt/lampp/htdocs/applications.html /opt/lampp/htdocs/localhost/www/applications.html
rm  /opt/lampp/htdocs/applications.html
cp -f /opt/lampp/htdocs/bitnami.css /opt/lampp/htdocs/localhost/www/bitnami.css
rm  /opt/lampp/htdocs/bitnami.css
cp -f /opt/lampp/htdocs/favicon.ico /opt/lampp/htdocs/localhost/www/favicon.ico
rm  /opt/lampp/htdocs/favicon.ico
cp -f /opt/lampp/htdocs/index.php /opt/lampp/htdocs/localhost/www/index.php
rm  /opt/lampp/htdocs/index.php
mv /opt/lampp/etc/php.ini /opt/lampp/etc/__php.ini
cp -f /home/xubuntu/64-xampp-7.4.28-installer-u22.04-qt5.5.1-r06/app/data/php.ini /opt/lampp/etc/php.ini
cp -f /home/xubuntu/64-xampp-7.4.28-installer-u22.04-qt5.5.1-r06/app/data/exts/memcached.so /opt/lampp/lib/php/extensions/no-debug-non-zts-20190902/memcached.so
cp -f /home/xubuntu/64-xampp-7.4.28-installer-u22.04-qt5.5.1-r06/app/data/exts/libmemcached.so.11 /opt/lampp/lib/libmemcached.so.11
cp -f /home/xubuntu/64-xampp-7.4.28-installer-u22.04-qt5.5.1-r06/app/data/exts/xdebug.so /opt/lampp/lib/php/extensions/no-debug-non-zts-20190902/xdebug.so
cp -f /home/xubuntu/64-xampp-7.4.28-installer-u22.04-qt5.5.1-r06/app/data/exts/amqp.so /opt/lampp/lib/php/extensions/no-debug-non-zts-20190902/amqp.so
cp -f /home/xubuntu/64-xampp-7.4.28-installer-u22.04-qt5.5.1-r06/app/data/exts/opcache.so /opt/lampp/lib/php/extensions/no-debug-non-zts-20190902/opcache.so
cp -f /home/xubuntu/64-xampp-7.4.28-installer-u22.04-qt5.5.1-r06/app/data/exts/redis.so /opt/lampp/lib/php/extensions/no-debug-non-zts-20190902/redis.so
cp -f /home/xubuntu/64-xampp-7.4.28-installer-u22.04-qt5.5.1-r06/app/data/exts/sodium.so /opt/lampp/lib/php/extensions/no-debug-non-zts-20190902/sodium.so
cp -f /home/xubuntu/64-xampp-7.4.28-installer-u22.04-qt5.5.1-r06/app/data/exts/imagick.so /opt/lampp/lib/php/extensions/no-debug-non-zts-20190902/imagick.so
cp -f /home/xubuntu/64-xampp-7.4.28-installer-u22.04-qt5.5.1-r06/app/data/exts/libMagickWand-6.Q16.so.6 /opt/lampp/lib/libMagickWand-6.Q16.so.6
cp -f /home/xubuntu/64-xampp-7.4.28-installer-u22.04-qt5.5.1-r06/app/data/exts/libMagickCore-6.Q16.so.6 /opt/lampp/lib/libMagickCore-6.Q16.so.6
cp -f /home/xubuntu/64-xampp-7.4.28-installer-u22.04-qt5.5.1-r06/app/data/exts/liblqr-1.so.0 /opt/lampp/lib/liblqr-1.so.0
cp -f /home/xubuntu/64-xampp-7.4.28-installer-u22.04-qt5.5.1-r06/app/data/exts/libmemcached.so.11 /opt/lampp/lib/libmemcached.so.11
rm -r /opt/xampp.tar.gz
echo 'Конфигурация multihosts завершена'
echo 'Создание каталога fastxampp'
mkdir /usr/local/Trolltech
mkdir /usr/local/Trolltech/Qt-5.5.1
mkdir /usr/local/Trolltech/Qt-5.5.1/lib
mkdir /usr/local/fastxampp
mkdir /usr/share/icons/Faenza
mkdir /usr/share/icons/Faenza/apps
mkdir /usr/share/icons/Faenza/apps/64
cp -rf /home/xubuntu/64-xampp-7.4.28-installer-u22.04-qt5.5.1-r06/app/data/lib /usr/local/Trolltech/Qt-5.5.1
cp -rf /home/xubuntu/64-xampp-7.4.28-installer-u22.04-qt5.5.1-r06/app/data/plugins /usr/local/Trolltech/Qt-5.5.1
cp -f /home/xubuntu/64-xampp-7.4.28-installer-u22.04-qt5.5.1-r06/app/data/bin/fastxampp /usr/local/fastxampp/fastxampp
cp -f /home/xubuntu/64-xampp-7.4.28-installer-u22.04-qt5.5.1-r06/app/data/bin/fastxampp.sh /usr/local/fastxampp/fastxampp.sh
cp -f /home/xubuntu/64-xampp-7.4.28-installer-u22.04-qt5.5.1-r06/app/data/bin/fastxamppd /usr/local/fastxampp/fastxamppd
cp -f /home/xubuntu/64-xampp-7.4.28-installer-u22.04-qt5.5.1-r06/app/data/bin/ru/lang /usr/local/fastxampp/lang
cp -f /home/xubuntu/64-xampp-7.4.28-installer-u22.04-qt5.5.1-r06/app/data/bin/netstat /bin/netstat
cp -f /home/xubuntu/64-xampp-7.4.28-installer-u22.04-qt5.5.1-r06/app/data/systemctl/fastxamppd.sh /usr/local/fastxampp/fastxamppd.sh
chmod 766 /usr/local/fastxampp/fastxamppd.sh
echo '#! /bin/sh' >> /usr/local/fastxampp/fastxamppd.sh
echo '#fastxamppdaemon start' >> /usr/local/fastxampp/fastxamppd.sh
echo 'mount -t tmpfs tmpfs /home/xubuntu/.config/fastxampp -o size=1M' >> /usr/local/fastxampp/fastxamppd.sh
echo '#echo "" > /home/xubuntu/.config/fastxampp/.sock' >> /usr/local/fastxampp/fastxamppd.sh
echo '#chown xubuntu:xubuntu /home/xubuntu/.config/fastxampp/.sock' >> /usr/local/fastxampp/fastxamppd.sh
echo '/usr/local/fastxampp/fastxamppd xubuntu' >> /usr/local/fastxampp/fastxamppd.sh
echo '# /fastxamppdaemon start' >> /usr/local/fastxampp/fastxamppd.sh
cp -f /home/xubuntu/64-xampp-7.4.28-installer-u22.04-qt5.5.1-r06/app/data/systemctl/fastxampp.service /etc/systemd/system/fastxampp.service
systemctl enable fastxampp.service
echo 'Создание файловой системы в оперативной памяти'
mount -t tmpfs tmpfs /home/xubuntu/.config/fastxampp -o size=1M
sleep 2
echo 'Создание сокета'
echo '' > /home/xubuntu/.config/fastxampp/.sock
chown xubuntu:xubuntu /home/xubuntu/.config/fastxampp/.sock
mkdir /usr/share/icons/Faenza
mkdir /usr/share/icons/Faenza/apps
mkdir /usr/share/icons/Faenza/apps/64
cp -f /home/xubuntu/64-xampp-7.4.28-installer-u22.04-qt5.5.1-r06/app/data/bin/xampp.png /usr/share/icons/Faenza/apps/64/fastxampp.png
echo 'Запуск демона fastxamppd'
killall fastxamppd
/usr/local/fastxampp/fastxamppd xubuntu &
mkdir /usr/local/fastxampp/launcher
echo 'Копирование программы запуска'
cp -rf /home/xubuntu/64-xampp-7.4.28-installer-u22.04-qt5.5.1-r06/app/data/bin/launcher/app /usr/local/fastxampp/launcher
cp -rf /home/xubuntu/64-xampp-7.4.28-installer-u22.04-qt5.5.1-r06/app/data/bin/launcher/default /usr/local/fastxampp/launcher
echo 'Копирование вспомогательных файлов программы запуска'
cp -f /home/xubuntu/64-xampp-7.4.28-installer-u22.04-qt5.5.1-r06/app/data/bin/launcher/launch-fastxampp.sh /usr/local/fastxampp/launcher/launch-fastxampp.sh
cp -f /home/xubuntu/64-xampp-7.4.28-installer-u22.04-qt5.5.1-r06/app/data/bin/launcher/qdjs /usr/local/fastxampp/launcher/qdjs
cp -f /home/xubuntu/64-xampp-7.4.28-installer-u22.04-qt5.5.1-r06/app/data/bin/fastxampp.desktop /usr/share/applications/fastxampp.desktop
