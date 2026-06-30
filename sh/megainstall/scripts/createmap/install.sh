# 1. Сохраните скрипт как lcreatemap
sudo cp lcreatemap.py /usr/local/bin/lcreatemap

# 2. Сделайте его исполняемым
sudo chmod +x /usr/local/bin/lcreatemap

# 3. Убедитесь, что директория в PATH (обычно /usr/local/bin уже в PATH)
echo $PATH | grep /usr/local/bin
