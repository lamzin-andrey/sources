import gi
import os
import dbus
import dbus.service
import dbus.mainloop.glib
from dbus.mainloop.glib import DBusGMainLoop

gi.require_version('Gtk', '3.0')
from gi.repository import Gtk, Gdk, GLib

class AboutDialogDBus(dbus.service.Object):
    def __init__(self, window):
        self.window = window
        bus_name = dbus.service.BusName('com.about.fastxampp', bus=dbus.SessionBus())
        dbus.service.Object.__init__(self, bus_name, '/com/about/fastxampp')
    
    @dbus.service.method('com.about.fastxampp')
    def activate(self):
        """Активировать окно приложения"""
        if self.window.is_visible():
            self.window.present()
        else:
            self.window.show_all()
        return True

class AboutDialog(Gtk.Window):
    def __init__(self):
        Gtk.Window.__init__(self, title="О программе")
        
        # Устанавливаем фиксированный размер окна
        self.set_resizable(False)
        self.set_default_size(450, 180)
        
        # Пробуем загрузить иконку из файла
        try:
            icon_path = os.path.abspath("../../i/sxampp.png")
            if os.path.exists(icon_path):
                self.set_icon_from_file(icon_path)
            else:
                icon_path = os.path.abspath("i/sxampp.png")
                if os.path.exists(icon_path):
                    self.set_icon_from_file(icon_path)
        except Exception as e:
            print(f"Не удалось загрузить иконку: {e}")
        
        # Основной контейнер
        main_box = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=0)
        main_box.set_margin_top(20)
        main_box.set_margin_bottom(20)
        main_box.set_margin_start(20)
        main_box.set_margin_end(20)
        
        # Устанавливаем цвет фона как в CSS (#EFEBE7) через CSS
        self.set_name("mainWindow")
        
        # Первый абзац с inline ссылкой
        paragraph1_box = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=5)
        paragraph1_box.set_margin_bottom(15)
        
        # Часть текста до ссылки
        text1_before = Gtk.Label(label="Официальный сайт проекта XAMPP ")
        text1_before.set_halign(Gtk.Align.START)
        
        # Ссылка как Label с обработкой клика
        link1_label = Gtk.Label()
        link1_label.set_markup('<span color="#0000EE" underline="single">apachefriends.org</span>')
        link1_label.set_halign(Gtk.Align.START)
        link1_label.set_selectable(False)
        link1_label.set_can_focus(False)
        
        # Делаем label кликабельным с изменением курсора
        link1_event_box = Gtk.EventBox()
        link1_event_box.add(link1_label)
        link1_event_box.connect("button-press-event", self.on_link1_clicked)
        link1_event_box.set_tooltip_text("https://www.apachefriends.org/")
        link1_event_box.set_name("linkEventBox")
        link1_event_box.set_events(Gdk.EventMask.POINTER_MOTION_MASK)
        link1_event_box.connect("enter-notify-event", self.on_link_enter)
        link1_event_box.connect("leave-notify-event", self.on_link_leave)
        
        # Создаем курсор-указатель
        self.hand_cursor = Gdk.Cursor.new_from_name(Gdk.Display.get_default(), "pointer")
        
        paragraph1_box.pack_start(text1_before, False, False, 0)
        paragraph1_box.pack_start(link1_event_box, False, False, 0)
        
        # Второй абзац с inline ссылкой
        paragraph2_box = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=5)
        
        # Первая строка второго абзаца
        text2_line1 = Gtk.Label(label="Новые версии утилиты для управления виртуальными хостами")
        text2_line1.set_halign(Gtk.Align.START)
        
        # Вторая строка второго абзаца со ссылкой
        text2_line2_box = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=5)
        
        text2_before = Gtk.Label(label="вы можете скачать на ")
        text2_before.set_halign(Gtk.Align.START)
        
        # Ссылка как Label с обработкой клика
        link2_label = Gtk.Label()
        link2_label.set_markup('<span color="#0000EE" underline="single">fastxampp.org</span>')
        link2_label.set_halign(Gtk.Align.START)
        link2_label.set_selectable(False)
        link2_label.set_can_focus(False)
        
        # Делаем label кликабельным с изменением курсора
        link2_event_box = Gtk.EventBox()
        link2_event_box.add(link2_label)
        link2_event_box.connect("button-press-event", self.on_link2_clicked)
        link2_event_box.set_tooltip_text("http://fastxampp.org/")
        link2_event_box.set_name("linkEventBox")
        link2_event_box.set_events(Gdk.EventMask.POINTER_MOTION_MASK)
        link2_event_box.connect("enter-notify-event", self.on_link_enter)
        link2_event_box.connect("leave-notify-event", self.on_link_leave)
        
        text2_line2_box.pack_start(text2_before, False, False, 0)
        text2_line2_box.pack_start(link2_event_box, False, False, 0)
        
        paragraph2_box.pack_start(text2_line1, False, False, 0)
        paragraph2_box.pack_start(text2_line2_box, False, False, 0)
        
        # Добавляем абзацы в основной контейнер
        main_box.pack_start(paragraph1_box, False, False, 0)
        main_box.pack_start(paragraph2_box, False, False, 0)
        
        # Кнопка "Закрыть"
        button_box = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL)
        button_box.set_halign(Gtk.Align.END)
        button_box.set_margin_top(20)
        
        close_button = Gtk.Button(label="Закрыть")
        close_button.set_size_request(100, 30)
        close_button.connect("clicked", self.on_close_clicked)
        
        button_box.pack_start(close_button, False, False, 0)
        main_box.pack_start(button_box, False, False, 0)
        
        # Применяем CSS стили
        self.apply_styles()
        
        # Добавляем основной контейнер в окно
        self.add(main_box)
        
        # Подключаем обработчик закрытия окна
        self.connect("destroy", self.on_destroy)
    
    def apply_styles(self):
        """Применить CSS стили ко всем элементам"""
        css = """
        #mainWindow {
            background-color: #EFEBE7;
        }
        
        * {
            font-family: Arial;
            font-size: 12px;
            font-weight: normal;
        }
        
        label {
            color: #000000;
        }
        
        button {
            background: linear-gradient(to bottom, #fcfcfd, #DEE5E8);
            border: 1px solid #548CAF;
            border-radius: 3px;
            font-size: 12px;
            color: #000000;
            padding: 2px 8px;
            min-height: 20px;
        }
        
        button:hover {
            background: linear-gradient(to bottom, #e6e6e6, #c8d1d4);
        }
        
        /* Стили для ссылок */
        #linkEventBox label {
            color: #0000EE;
            text-decoration: underline;
        }
        """
        
        css_provider = Gtk.CssProvider()
        try:
            css_provider.load_from_data(css.encode())
            screen = Gdk.Screen.get_default()
            style_context = Gtk.StyleContext()
            style_context.add_provider_for_screen(screen, css_provider, Gtk.STYLE_PROVIDER_PRIORITY_USER)
        except Exception as e:
            print(f"Ошибка при загрузке CSS: {e}")
    
    def on_link_enter(self, event_box, event):
        """Обработчик входа курсора в область ссылки"""
        # Изменяем курсор на указатель
        window = event_box.get_window()
        if window:
            window.set_cursor(self.hand_cursor)
        return False
    
    def on_link_leave(self, event_box, event):
        """Обработчик выхода курсора из области ссылки"""
        # Возвращаем стандартный курсор
        window = event_box.get_window()
        if window:
            window.set_cursor(None)
        return False
    
    def on_link1_clicked(self, event_box, event):
        """Обработчик клика на первую ссылку"""
        import subprocess
        try:
            subprocess.run(['xdg-open', 'https://www.apachefriends.org/'], check=True)
        except Exception as e:
            print(f"Не удалось открыть ссылку: {e}")
    
    def on_link2_clicked(self, event_box, event):
        """Обработчик клика на вторую ссылку"""
        import subprocess
        try:
            subprocess.run(['xdg-open', 'http://fastxampp.org/'], check=True)
        except Exception as e:
            print(f"Не удалось открыть ссылку: {e}")
    
    def on_close_clicked(self, button):
        """Обработчик клика на кнопку 'Закрыть'"""
        self.destroy()
    
    def on_destroy(self, widget):
        """Обработчик закрытия окна"""
        Gtk.main_quit()

def check_already_running():
    """Проверить, запущено ли приложение уже"""
    try:
        bus = dbus.SessionBus()
        # Пытаемся получить доступ к сервису
        proxy = bus.get_object('com.about.fastxampp', '/com/about/fastxampp')
        interface = dbus.Interface(proxy, 'com.about.fastxampp')
        # Активируем существующее окно
        interface.activate()
        return True
    except dbus.exceptions.DBusException as e:
        # Сервис не найден, значит приложение не запущено
        return False
    except Exception as e:
        print(f"Ошибка при проверке D-Bus: {e}")
        return False

def main():
    # Инициализируем D-Bus
    DBusGMainLoop(set_as_default=True)
    
    # Проверяем, не запущено ли приложение уже
    if check_already_running():
        print("Диалог 'О программе' уже открыт. Активируем существующее окно.")
        return
    
    # Создаем окно
    app = AboutDialog()
    
    # Регистрируем сервис D-Bus
    try:
        dbus_service = AboutDialogDBus(app)
        print("D-Bus сервис успешно зарегистрирован")
    except Exception as e:
        print(f"Ошибка регистрации D-Bus сервиса: {e}")
    
    # Показываем окно
    app.show_all()
    
    # Запускаем главный цикл
    Gtk.main()

if __name__ == "__main__":
    main()
