import os
import gi
import subprocess
import threading
import re
gi.require_version('Gtk', '3.0')
from gi.repository import Gtk, Gdk, GdkPixbuf, Pango
from gi.repository import GLib

# Константы
HEADER_SIZE = 12
TEXT_SIZE = 12
DEFAULT_HEADER = "Добро пожаловать в мастер установки DSGImageEditor"
DEFAULT_TEXT = "<p>Программа установит DSGImageEditor 1.0.0 на ваш копьютер</p><p>Нажмите Next для продолжения или Cancel для выхода из установки."
DEFAULT_PREV_TEXT = "Назад"
DEFAULT_NEXT_TEXT = "Далее"
DEFAULT_CANCEL_TEXT = "Отмена"
STEP = 0

def onCreate():
    app.modBtn("p", "", 0) # "p" - id Previous Button; "с", "n" - Next and Cancel.
    # Сразу же формируем скрипт установки.
    
    # Проверяем, доступен ли wine, необходимый для запуска
    wine32 = app.checkWine32()
    wine64 = app.checkWine64()
    if wine32 == False and wine64 == False:
        app.setText(DEFAULT_HEADER, "<p>Вам нужно установить wine перед тем, как продолжить установку. Выполните sudo apt-get install wine в терминале")
        app.modBtn("n", "", 0)
        app.modBtn("c", "Выход", 0)
        return
    
    programDir = app.getHome() + "/.local/share/applications/DSGImageEditor"
    desktopFileDir = app.getHome() + "/.local/share/applications"
    app.createDir(programDir)
    distrDir = app.getAppDir() + "/data/a"
    shell = f"cp -rf {distrDir}/i {programDir}\n"
    shell += f"cp -rf {distrDir}/p {programDir}\n"
    shell += f"cp -f {distrDir}/c.res {programDir}/c.res\n"
    shell += f"cp -f {distrDir}/my.jpg {programDir}/my.jpg\n"
    shell += f"cp -f {distrDir}/Readme.ru.txt {programDir}/Readme.ru.txt\n"
    shell += f"cp -f {distrDir}/DSGImagEditor.desktop {desktopFileDir}/DSGImagEditor.desktop\n"
    
    if wine32 == False:
        shell += f"cp -f {distrDir}/64/DSGImageEditor.exe {programDir}/DSGImageEditor.exe\n"
        shell += f"cp -f {distrDir}/64/lib1.dll {programDir}/lib1.dll\n" # TODO
        shell += f"cp -f {distrDir}/64/lib2.dll {programDir}/lib2.dll\n" # TODO
        shell += f"cp -f {distrDir}/64/lib3.dll {programDir}/lib3.dll\n" # TODO
    else:
        shell += f"cp -f {distrDir}/DSGImageEditor.exe {programDir}/DSGImageEditor.exe\n"
        
    # готовим desktop файл
    desk = app.readFile(f"{distrDir}/DSGImagEditorTpl.desktop")
    desk = desk.replace("/home/andrey/hdata/vdis/bridge/isya/xp-wall/dsgPaint/my.jpg", f"{programDir}/my.jpg")
    desk = desk.replace("/home/andrey/hdata/vdis/bridge/isya/xp-wall/dsgPaint/bmp_editor.exe", f"{programDir}/DSGImageEditor.exe")
    app.writeFile(f"{distrDir}/DSGImagEditor.desktop", desk)
    shell += "update-desktop-database " + app.getHome() + "/.local/share/applications/\n"
    app.writeFile(f"{distrDir}/p/u.sh", "#!/bin/bash\n" + shell)
    
def onFinishInstall(arg1):
    app.modBtn("p", "", 0)
    app.modBtn("n", "", 0)
    app.modBtn("c", "Готово")
    app.setText(DEFAULT_HEADER, "<p>Установка завершена</p>")

# Обработчики кнопок (расположены в начале файла)
def onClicPrev(button):
    app.setText(DEFAULT_HEADER, "Previous button clicked, appDir = " + app.getHome())
    app.modBtn("p", "", 0)

def onClickNext(button):
    #app.setText(DEFAULT_HEADER, "Next button clicked, but you is `" +  app.getUser() + "`")
    #app.modBtn("p", "", 1);
    distrDir = app.getAppDir() + "/data/a"
    app.exec(f"{distrDir}/p/u.sh", onFinishInstall);

def onClickCancel(button):
    #app.setText("Cancel button clicked")
    Gtk.main_quit()

#Ваш код установщика должен завершаться до этой строки. Хотя, никто не мешает вам экспериментировать.


class InstallerApp:
    def __init__(self):
        self.window = Gtk.Window(title="Installer")
        self.window.set_resizable(False)
        self.window.set_size_request(500, 356)
        
        # Установка иконки
        app_dir = self.getAppDir()
        ico_path = os.path.join(app_dir, "data", "i", "nstaller", "ico.png")
        if os.path.exists(ico_path):
            self.window.set_icon_from_file(ico_path)
        
        # Основной контейнер
        main_box = Gtk.Box(orientation=Gtk.Orientation.VERTICAL)
        self.window.add(main_box)
        
        # Область Б (верхняя часть)
        self.area_b = Gtk.Box()
        self.area_b.set_size_request(500, 315)
        main_box.pack_start(self.area_b, True, True, 0)
        
        # Левая часть области Б - изображение
        self.image_area = Gtk.Box()
        self.image_area.set_size_request(166, 315)
        self.area_b.pack_start(self.image_area, False, False, 0)
        
        # Загрузка изображения
        promo_path = os.path.join(app_dir, "data", "i", "nstaller", "promo.png")
        self.setMainImage(promo_path)
        
        # Правая часть области Б - текст
        self.text_area = Gtk.Box()
        self.text_area.set_size_request(334, 315)
        self.area_b.pack_start(self.text_area, True, True, 0)
        
        # Создаем область с прокруткой для текста
        scrolled_window = Gtk.ScrolledWindow()
        scrolled_window.set_policy(Gtk.PolicyType.AUTOMATIC, Gtk.PolicyType.AUTOMATIC)
        self.text_area.pack_start(scrolled_window, True, True, 0)
        
        # Текстовая область
        self.text_view = Gtk.TextView()
        self.text_view.set_editable(False)
        self.text_view.set_cursor_visible(False)
        self.text_view.set_wrap_mode(Gtk.WrapMode.WORD)
        self.text_view.set_left_margin(12)
        self.text_view.set_right_margin(12)
        scrolled_window.add(self.text_view)
        
        # Установка белого фона
        white_color = Gdk.RGBA()
        white_color.parse("white")
        self.text_view.override_background_color(Gtk.StateFlags.NORMAL, white_color)
        
        # Получаем буфер текста
        self.text_buffer = self.text_view.get_buffer()
        
        # Область Г (нижняя часть с кнопками)
        self.area_g = Gtk.Box()
        self.area_g.set_size_request(500, 41)
        self.area_g.override_background_color(Gtk.StateFlags.NORMAL, self.parse_color("#ECE9D8"))
        main_box.pack_start(self.area_g, False, False, 0)
        
        # Создаем контейнер для кнопок (выравнивание по правому краю)
        button_box = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL)
        button_box.set_margin_top(14)
        button_box.set_margin_end(14)
        button_box.set_margin_bottom(14)
        self.area_g.pack_end(button_box, False, False, 0)
        
        # Создаем кнопки
        self.btn_prev = self.create_button(DEFAULT_PREV_TEXT, onClicPrev)
        self.btn_next = self.create_button(DEFAULT_NEXT_TEXT, onClickNext)
        self.btn_cancel = self.create_button(DEFAULT_CANCEL_TEXT, onClickCancel)
        
        # Добавляем кнопки в контейнер
        button_box.pack_start(self.btn_prev, False, False, 15)
        button_box.pack_start(self.btn_next, False, False, 15)
        button_box.pack_end(self.btn_cancel, False, False, 0)
        
        # Скрываем кнопку Previous при запуске
        self.btn_prev.hide()
        self.modBtn("p", "", 0)
        
        # Устанавливаем начальный текст
        self.setText(DEFAULT_HEADER, DEFAULT_TEXT)
        
        GLib.timeout_add(100, self.delayed_onCreate)
        
        self.window.connect("destroy", Gtk.main_quit)
    
    def delayed_onCreate(self):
        onCreate()
        return False  # Не повторять таймер
    
    def parse_color(self, hex_color):
        color = Gdk.RGBA()
        color.parse(hex_color)
        return color
    
    def create_button(self, text, handler):
        button = Gtk.Button(label=text)
        button.connect("clicked", handler)
        
        # Настройка стиля кнопки
        button.override_background_color(Gtk.StateFlags.NORMAL, self.parse_color("#F4F4F0"))
        button.override_color(Gtk.StateFlags.NORMAL, self.parse_color("black"))
        
        # Настройка границы
        ctx = button.get_style_context()
        ctx.add_class("button-border")
        
        return button
    
    def setText(self, header, content):
        # Преобразуем базовые HTML-теги в Pango Markup
        formatted_content = self.html_to_pango(content)
    
        # Форматируем текст с заголовком и содержимым
        full_text = f"<span size='{HEADER_SIZE * 1000}' weight='bold'>{header}</span>\n\n{formatted_content}"
    
        # Устанавливаем текст с поддержкой разметки Pango
        self.text_buffer.set_text("")
        iter = self.text_buffer.get_iter_at_offset(0)
        self.text_buffer.insert_markup(iter, full_text, -1)

    def html_to_pango(self, html_text):
        """Преобразует базовые HTML-теги в Pango Markup"""
        # Заменяем HTML-теги на Pango-теги
        pango_text = html_text
    
        # Обрабатываем параграфы
        pango_text = pango_text.replace('<p>', '\n')
        pango_text = pango_text.replace('</p>', '\n')
    
        # Обрабатываем жирный текст
        pango_text = pango_text.replace('<b>', '<span weight="bold">')
        pango_text = pango_text.replace('</b>', '</span>')
    
        # Обрабатываем курсив
        pango_text = pango_text.replace('<i>', '<span style="italic">')
        pango_text = pango_text.replace('</i>', '</span>')
    
        # Убираем лишние переносы строк
        pango_text = pango_text.strip()
    
        return pango_text
    
    def modBtn(self, id, text=None, hide=None):
        button = None
        if id == "p":
            button = self.btn_prev
        elif id == "n":
            button = self.btn_next
        elif id == "c":
            button = self.btn_cancel
        
        if button:
            if text is not None and text != "":
                button.set_label(text)
            if hide is not None:
                if hide == 0:
                    button.hide()
                elif hide == 1:
                    button.show()
    
    def getUser(self):
        return os.getenv('USER', '')
    
    def getHome(self):
        return os.getenv('HOME', '')
    
    def createDir(self, path):
        os.makedirs(path, exist_ok=True)
    
    def getAppDir(self):
        return os.path.dirname(os.path.abspath(__file__))
    
    def exec(self, shellFile, onFinishExecute):
        # Отключаем кнопки во время выполнения
        self.set_buttons_sensitive(False)
        
        def run_script():
            try:
                process = subprocess.Popen(
                    ['bash', shellFile],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.STDOUT,
                    universal_newlines=True
                )
                
                output_lines = []
                for line in process.stdout:
                    output_lines.append(line.strip())
                    # Берем последние 2 строки для отображения
                    display_text = "Выполняется установка:\n\n" + "\n".join(output_lines[-2:])
                    
                    # Обновляем UI в основном потоке
                    Gdk.threads_add_idle(0, self.update_text, display_text)
                
                process.wait()
                
                # Восстанавливаем кнопки и вызываем callback
                Gdk.threads_add_idle(0, self.on_script_finished, onFinishExecute, process.returncode)
                
            except Exception as e:
                error_text = f"Ошибка выполнения: {str(e)}"
                Gdk.threads_add_idle(0, self.update_text, error_text)
                Gdk.threads_add_idle(0, self.on_script_finished, onFinishExecute, 1)
        
        # Запускаем в отдельном потоке
        thread = threading.Thread(target=run_script)
        thread.daemon = True
        thread.start()
    
    def set_buttons_sensitive(self, sensitive):
        self.btn_prev.set_sensitive(sensitive)
        self.btn_next.set_sensitive(sensitive)
        self.btn_cancel.set_sensitive(sensitive)
    
    def update_text(self, content):
        # Сохраняем предыдущий заголовок
        current_text = self.text_buffer.get_text(
            self.text_buffer.get_start_iter(),
            self.text_buffer.get_end_iter(),
            False
        )
        lines = current_text.split('\n')
        header = lines[0] if lines else DEFAULT_HEADER
        
        # Убираем разметку из заголовка для повторного использования
        if header.startswith("<span"):
            # Простая очистка - в реальном приложении нужно парсить разметку
            header = header.replace(f"<span size='{HEADER_SIZE * 1000}'><b>", "").replace("</b></span>", "")
        
        self.setText(header, content)
        return False
    
    def on_script_finished(self, onFinishExecute, returncode):
        self.set_buttons_sensitive(True)
        if onFinishExecute:
            onFinishExecute(returncode)
        return False
    
    def writeFile(self, filePath, text):
        try:
            with open(filePath, 'w', encoding='utf-8') as f:
                f.write(text)
            return True
        except Exception as e:
            print(f"Ошибка записи файла: {e}")
            return False
    
    def readFile(self, filePath):
        try:
            with open(filePath, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            print(f"Ошибка чтения файла: {e}")
            return None

    def checkLinuxInt(self):
        """Определяет разрядность операционной системы"""
        try:
            result = subprocess.run(['uname', '-m'], capture_output=True, text=True)
            arch = result.stdout.strip()
            if '64' in arch:
                return 64
            else:
                return 32
        except:
            return 64  # предполагаем 64-бит по умолчанию

    def checkWine32(self):
        """Проверяет доступность 32-битного Wine"""
        try:
            # Проверяем наличие wine и его 32-битной поддержки
            result = subprocess.run(['wine', '--version'], capture_output=True, text=True)
            if result.returncode == 0:
                # Дополнительная проверка через winecfg или winepath
                result = subprocess.run(['wine', 'winecfg', '/?'], 
                                      capture_output=True, text=True, timeout=5)
                return True
            return False
        except:
            return False

    def checkWine64(self):
        """Проверяет доступность 64-битного Wine"""
        try:
            # Проверяем наличие WINEARCH=win64
            env = os.environ.copy()
            env['WINEARCH'] = 'win64'
            result = subprocess.run(['wine', '--version'], env=env, 
                                  capture_output=True, text=True)
            if result.returncode == 0:
                # Проверяем поддержку 64-бит через winepath
                result = subprocess.run(['wine', 'winepath', 'C:\\windows\\system32'], 
                                      env=env, capture_output=True, text=True, timeout=5)
                return True
            return False
        except:
            return False

    def getRAM(self, in_bytes=False):
        """Возвращает размер оперативной памяти"""
        try:
            with open('/proc/meminfo', 'r') as f:
                meminfo = f.read()
            
            # Ищем общую память
            match = re.search(r'MemTotal:\s+(\d+)\s+kB', meminfo)
            if match:
                kb = int(match.group(1))
                bytes_value = kb * 1024
                
                if in_bytes:
                    return bytes_value
                else:
                    # Конвертируем в человекопонятный формат
                    if bytes_value >= 1024**3:  # GB
                        return f"{bytes_value / (1024**3):.1f} Gb"
                    elif bytes_value >= 1024**2:  # MB
                        return f"{bytes_value / (1024**2):.1f} Mb"
                    else:  # KB
                        return f"{bytes_value / 1024:.1f} Kb"
            return "Unknown"
        except:
            return "Unknown"

    def getCPUName(self):
        """Возвращает человекопонятное название процессора"""
        try:
            with open('/proc/cpuinfo', 'r') as f:
                cpuinfo = f.read()
            
            # Ищем модель процессора
            model_match = re.search(r'model name\s*:\s*(.+)', cpuinfo)
            if model_match:
                cpu_name = model_match.group(1).strip()
                
                # Упрощаем название (убираем лишнюю информацию)
                # Убираем "(R)", "(TM)", лишние пробелы
                cpu_name = re.sub(r'\(R\)|\(TM\)|@', '', cpu_name)
                cpu_name = re.sub(r'\s+', ' ', cpu_name).strip()
                
                return cpu_name
            return "Unknown CPU"
        except:
            return "Unknown CPU"

    def setMainImage(self, filePath):
        # Очищаем область изображения
        for child in self.image_area.get_children():
            self.image_area.remove(child)
        
        if os.path.exists(filePath):
            try:
                pixbuf = GdkPixbuf.Pixbuf.new_from_file_at_size(filePath, 166, 315)
                image = Gtk.Image.new_from_pixbuf(pixbuf)
                self.image_area.pack_start(image, True, True, 0)
                image.show()
            except Exception as e:
                print(f"Ошибка загрузки изображения: {e}")
                # Создаем placeholder если изображение не загрузилось
                label = Gtk.Label(label="Image\nnot found")
                self.image_area.pack_start(label, True, True, 0)
                label.show()
        else:
            label = Gtk.Label(label="Image\nnot found")
            self.image_area.pack_start(label, True, True, 0)
            label.show()
    
    def run(self):
        self.window.show_all()
        Gtk.main()

# Запуск приложения
if __name__ == "__main__":
    app = InstallerApp()
    app.modBtn("p", "", 0)
    app.run()
    
