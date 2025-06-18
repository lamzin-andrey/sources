#! /bin/bash
sudo /opt/lampp/lampp stop
sudo rm /opt/lampp/logs/httpd.pid
sudo rm /opt/lampp/var/proftpd.pid
sudo rm /opt/lampp/var/mysql/your-linux-machine-name.pid
sudo rm /opt/lampp/var/mysql/ib_logfile0
sudo rm /opt/lampp/var/mysql/ib_logfile1
sudo /opt/lampp/lampp start

