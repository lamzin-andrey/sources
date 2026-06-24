#!/bin/bash
cp -rf /opt/p-landlib/apps/installer/samples/installDSGPaint/data/a/i /home/andrey/.local/share/applications/DSGImageEditor
cp -rf /opt/p-landlib/apps/installer/samples/installDSGPaint/data/a/p /home/andrey/.local/share/applications/DSGImageEditor
cp -f /opt/p-landlib/apps/installer/samples/installDSGPaint/data/a/c.res /home/andrey/.local/share/applications/DSGImageEditor/c.res
cp -f /opt/p-landlib/apps/installer/samples/installDSGPaint/data/a/my.jpg /home/andrey/.local/share/applications/DSGImageEditor/my.jpg
cp -f /opt/p-landlib/apps/installer/samples/installDSGPaint/data/a/Readme.ru.txt /home/andrey/.local/share/applications/DSGImageEditor/Readme.ru.txt
cp -f /opt/p-landlib/apps/installer/samples/installDSGPaint/data/a/DSGImagEditor.desktop /home/andrey/.local/share/applications/DSGImagEditor.desktop
cp -f /opt/p-landlib/apps/installer/samples/installDSGPaint/data/a/DSGImageEditor.exe /home/andrey/.local/share/applications/DSGImageEditor/DSGImageEditor.exe
update-desktop-database /home/andrey/.local/share/applications/
