#!/usr/bin/env python3
import sys
import os
import gi
import signal
from pathlib import Path

gi.require_version('Gtk', '3.0')
from gi.repository import Gtk, Gdk, GLib, GdkPixbuf

class NotificationApp:
    def __init__(self):
        # Читаем файл data.txt
        self.read_data_file()
        
        # Создаем окно
        self.window = Gtk.Window()
        self.window.set_title("Notification")
        
        # Устанавливаем фон окна в темно-фиолетовый
        css = b"""
        window {
            background-color: #4B0082;
            color: white;
        }
        """
        css_provider = Gtk.CssProvider()
        css_provider.load_from_data(css)
        Gtk.StyleContext.add_provider_for_screen(
            Gdk.Screen.get_default(),
            css_provider,
            Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION
        )
        
        # Устанавливаем параметры окна
        if self.has_frame and self.frame_option == "1":
            self.window.set_decorated(True)
        else:
            self.window.set_decorated(False)
            
        self.window.set_resizable(False)
        self.window.set_skip_taskbar_hint(True)
        self.window.set_skip_pager_hint(True)
        self.window.set_type_hint(Gdk.WindowTypeHint.NOTIFICATION)
        
        # Создаем основной контейнер
        self.box = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
        self.box.set_border_width(10)
        self.window.add(self.box)
        
        # Добавляем изображение если есть
        if self.image_path and os.path.exists(self.image_path):
            self.add_image()
        
        # Добавляем текстовую часть
        self.add_text_content()
        
        # Позиционируем окно
        self.position_window()
        
        # Устанавливаем таймер для закрытия
        if self.duration > 0:
            GLib.timeout_add_seconds(self.duration, self.close_app)
        
        # Обработка закрытия окна
        self.window.connect("destroy", Gtk.main_quit)
        
    def read_data_file(self):
        """Чтение и парсинг файла data.txt"""
        script_dir = Path(__file__).parent
        data_file = script_dir / "data.txt"
        
        # Значения по умолчанию
        self.title = "Уведомление"
        self.text = "Текст уведомления"
        self.image_path = None
        self.duration = 5
        self.frame_option = "0"
        self.has_frame = False
        
        try:
            with open(data_file, 'r', encoding='utf-8') as f:
                lines = [line.strip() for line in f.readlines()]
            
            # Строка 1: Заголовок
            if len(lines) > 0:
                self.title = lines[0]
            
            # Строка 2: Текст с возможными \n
            if len(lines) > 1:
                # Заменяем \n на байт 0x13 (вертикальная табуляция)
                # Но в GTK лучше использовать обычные переносы строк
                self.text = lines[1].replace('\\n', '\x13')
                # Заменяем 0x13 на перенос строки для отображения
                self.text = self.text.replace('\x13', '\n')
            
            # Строка 3: Путь к изображению
            if len(lines) > 2 and lines[2]:
                self.image_path = lines[2]
                # Проверяем, существует ли файл
                if not os.path.exists(self.image_path):
                    self.image_path = None
            
            # Строка 4: Длительность отображения
            if len(lines) > 3:
                try:
                    self.duration = int(lines[3])
                except ValueError:
                    self.duration = 5
            
            # Строка 5: Параметр рамки окна
            if len(lines) > 4:
                self.frame_option = lines[4]
                self.has_frame = True
                
        except FileNotFoundError:
            print(f"Файл {data_file} не найден")
        except Exception as e:
            print(f"Ошибка при чтении файла: {e}")
    
    def add_image(self):
        """Добавление изображения с масштабированием"""
        try:
            # Загружаем изображение
            pixbuf = GdkPixbuf.Pixbuf.new_from_file(self.image_path)
            
            # Масштабируем если необходимо
            width = pixbuf.get_width()
            height = pixbuf.get_height()
            
            if width > 128 or height > 128:
                # Сохраняем пропорции
                if width > height:
                    new_width = 128
                    new_height = int(height * 128 / width)
                else:
                    new_height = 128
                    new_width = int(width * 128 / height)
                
                pixbuf = pixbuf.scale_simple(
                    new_width, 
                    new_height, 
                    GdkPixbuf.InterpType.BILINEAR
                )
            
            # Создаем виджет изображения
            image = Gtk.Image.new_from_pixbuf(pixbuf)
            self.box.pack_start(image, False, False, 0)
            
        except Exception as e:
            print(f"Ошибка при загрузке изображения: {e}")
    
    def add_text_content(self):
        """Добавление текстового содержимого"""
        # Создаем вертикальный бокс для текста
        text_box = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=5)
        
        # Заголовок (жирный)
        title_label = Gtk.Label()
        title_label.set_markup(f"<b>{GLib.markup_escape_text(self.title)}</b>")
        title_label.set_halign(Gtk.Align.START)
        title_label.set_line_wrap(True)
        title_label.set_max_width_chars(40)
        
        # Применяем стиль к заголовку
        title_label_context = title_label.get_style_context()
        title_label_context.add_class("title-label")
        
        # Основной текст (не жирный)
        text_label = Gtk.Label(self.text)
        text_label.set_halign(Gtk.Align.START)
        text_label.set_line_wrap(True)
        text_label.set_max_width_chars(40)
        
        # Применяем стиль к основному тексту
        text_label_context = text_label.get_style_context()
        text_label_context.add_class("text-label")
        
        # Добавляем CSS для шрифтов
        css_text = b"""
        .title-label {
            font-weight: bold;
            font-size: 13px;
            color: white;
        }
        .text-label {
            font-weight: normal;
            font-size: 13px;
            color: white;
        }
        """
        css_provider = Gtk.CssProvider()
        css_provider.load_from_data(css_text)
        Gtk.StyleContext.add_provider_for_screen(
            Gdk.Screen.get_default(),
            css_provider,
            Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION
        )
        
        # Добавляем виджеты в контейнер
        text_box.pack_start(title_label, False, False, 0)
        text_box.pack_start(text_label, False, False, 0)
        
        self.box.pack_start(text_box, True, True, 0)
    
    def position_window(self):
        """Позиционирование окна в правом верхнем углу"""
        # Получаем размеры экрана
        screen = Gdk.Screen.get_default()
        screen_width = screen.get_width()
        
        # Показываем окно чтобы вычислить его размеры
        self.window.show_all()
        
        # Получаем размеры окна
        self.window.realize()
        window_width = self.window.get_window().get_width()
        
        # Рассчитываем позицию
        x_pos = screen_width - 64 - window_width
        y_pos = 64
        
        # Устанавливаем позицию
        self.window.move(x_pos, y_pos)
    
    def close_app(self):
        """Закрытие приложения"""
        self.window.destroy()
        return False
    
    def run(self):
        """Запуск главного цикла"""
        self.window.show_all()
        Gtk.main()

def main():
    # Обработка Ctrl+C
    signal.signal(signal.SIGINT, signal.SIG_DFL)
    
    # Создаем и запускаем приложение
    app = NotificationApp()
    app.run()

if __name__ == "__main__":
    main()
