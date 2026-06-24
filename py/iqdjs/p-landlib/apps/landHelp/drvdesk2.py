#!/usr/bin/env python3
import gi
gi.require_version('Gtk', '3.0')
#gi.require_version('WebKit2', '4.0')
try:
    gi.require_version('WebKit2', '4.1')
except ValueError:
	gi.require_version('WebKit2', '4.0')
    
from gi.repository import Gtk, WebKit2, Gdk
import os

class HelpWindow(Gtk.Window):
    def __init__(self):
        Gtk.Window.__init__(self, title="Справка")
        self.set_default_size(900, 600)
        
        # Главный контейнер
        self.hpaned = Gtk.Paned(orientation=Gtk.Orientation.HORIZONTAL)
        self.add(self.hpaned)
        
        # === ЛЕВАЯ ОБЛАСТЬ - Содержание ===
        left_scroll = Gtk.ScrolledWindow()
        left_scroll.set_policy(Gtk.PolicyType.NEVER, Gtk.PolicyType.AUTOMATIC)
        left_scroll.set_shadow_type(Gtk.ShadowType.IN)
        left_scroll.set_size_request(250, -1)
        
        left_box = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=5)
        left_box.set_margin_start(10)
        left_box.set_margin_end(10)
        left_box.set_margin_top(10)
        left_box.set_margin_bottom(10)
        
        # Заголовок содержания
        title_label = Gtk.Label()
        title_label.set_markup("<b><big>Содержание</big></b>")
        title_label.set_halign(Gtk.Align.START)
        left_box.pack_start(title_label, False, False, 10)
        
        # Ссылки-кнопки для навигации
        self.nav_buttons = []
        
        # Пример разделов
        sections = [
            ("Введение", "intro"),
            ("Установка", "install"),
            ("Настройка", "config"),
            ("Использование", "usage"),
            ("Глава 1: Основы", "chapter1"),
            ("Глава 2: Продвинутые техники", "chapter2"),
            ("Глава 3: Оптимизация", "chapter3"),
            ("Глава 4: Отладка", "chapter4"),
            ("Глава 5: Развертывание", "chapter5"),
            ("Глава 6: Безопасность", "chapter6"),
            ("Глава 7: Интеграция", "chapter7"),
            ("Глава 8: Тестирование", "chapter8"),
            ("Глава 9: Мониторинг", "chapter9"),
            ("Глава 10: Масштабирование", "chapter10"),
            ("Часто задаваемые вопросы", "faq"),
            ("Обратная связь", "feedback"),
            ("Лицензия", "license"),
        ]
        
        for i, (label, anchor) in enumerate(sections):
            btn = Gtk.Button(label=label)
            btn.set_halign(Gtk.Align.FILL)
            btn.set_hexpand(True)
            btn.set_relief(Gtk.ReliefStyle.NONE)
            btn.set_alignment(0.0, 0.5)
            
            # Сохраняем якорь для кнопки
            btn.anchor = anchor
            
            # При клике прокручиваем к якорю
            btn.connect("clicked", self.on_nav_click)
            
            left_box.pack_start(btn, False, False, 0)
            self.nav_buttons.append(btn)
        
        # Кнопка "Наверх"
        top_btn = Gtk.Button(label="▲ Наверх")
        top_btn.set_halign(Gtk.Align.FILL)
        top_btn.set_hexpand(True)
        top_btn.connect("clicked", self.scroll_to_top)
        left_box.pack_start(top_btn, False, False, 20)
        
        left_scroll.add(left_box)
        self.hpaned.pack1(left_scroll, False, False)
        
        # === ПРАВАЯ ОБЛАСТЬ - HTML контент ===
        right_scroll = Gtk.ScrolledWindow()
        right_scroll.set_policy(Gtk.PolicyType.AUTOMATIC, Gtk.PolicyType.AUTOMATIC)
        
        # Создаем WebKit виджет
        self.webview = WebKit2.WebView()
        
        # Генерируем HTML контент с якорями
        html_content = self.generate_html()
        
        # Загружаем HTML
        self.webview.load_html(html_content, "file:///")
        
        right_scroll.add(self.webview)
        self.hpaned.pack2(right_scroll, True, False)
        
        # Настройка разделителя
        self.hpaned.set_position(280)
        
        self.connect("destroy", Gtk.main_quit)
    
    def generate_html(self):
        """Генерирует HTML страницу с якорями"""
        return """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    padding: 20px;
                    max-width: 800px;
                    margin: 0 auto;
                    color: #333;
                }
                h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
                h2 { color: #34495e; margin-top: 40px; border-left: 4px solid #3498db; padding-left: 15px; }
                h3 { color: #555; margin-top: 25px; }
                .section {
                    margin-bottom: 30px;
                    padding: 15px;
                    background: #f8f9fa;
                    border-radius: 5px;
                }
                .highlight {
                    background: #fff3cd;
                    padding: 10px;
                    border-left: 4px solid #ffc107;
                    margin: 15px 0;
                }
                code {
                    background: #e9ecef;
                    padding: 2px 6px;
                    border-radius: 3px;
                    font-family: monospace;
                }
                ul, ol {
                    margin: 10px 0;
                    padding-left: 25px;
                }
                .nav-hint {
                    background: #d4edda;
                    padding: 10px;
                    border-radius: 5px;
                    margin: 20px 0;
                }
            </style>
        </head>
        <body>
            <h1 id="intro">📖 Введение</h1>
            <div class="section">
                <p>Добро пожаловать в справочную систему! Это пример приложения-справки с навигацией по якорям.</p>
                <p>Используйте левую панель для быстрого перехода к разделам.</p>
            </div>
            
            <h2 id="install">🚀 Установка</h2>
            <div class="section">
                <h3>Системные требования</h3>
                <ul>
                    <li>Python 3.6+</li>
                    <li>GTK 3.0</li>
                    <li>WebKit2GTK</li>
                </ul>
                <h3>Установка зависимостей</h3>
                <div class="highlight">
                    <code>sudo apt install python3-gi gir1.2-webkit2-4.0</code>
                </div>
                <h3>Установка приложения</h3>
                <div class="highlight">
                    <code>pip install -r requirements.txt</code>
                </div>
            </div>
            
            <h2 id="config">⚙️ Настройка</h2>
            <div class="section">
                <p>Настройка приложения производится через конфигурационный файл <code>config.ini</code>.</p>
                <p>Основные параметры:</p>
                <ul>
                    <li><strong>debug</strong> - режим отладки</li>
                    <li><strong>language</strong> - язык интерфейса</li>
                    <li><strong>theme</strong> - тема оформления</li>
                </ul>
            </div>
            
            <h2 id="usage">💡 Использование</h2>
            <div class="section">
                <p>Основные функции приложения:</p>
                <ol>
                    <li>Откройте файл через меню "Файл → Открыть"</li>
                    <li>Редактируйте содержимое</li>
                    <li>Сохраните изменения (Ctrl+S)</li>
                </ol>
            </div>
            
            <h2 id="chapter1">📚 Глава 1: Основы</h2>
            <div class="section">
                <p>В этой главе рассматриваются базовые концепции работы с приложением.</p>
                <h3>1.1 Интерфейс</h3>
                <p>Главное окно разделено на две панели: навигацию и содержимое.</p>
                <h3>1.2 Навигация</h3>
                <p>Используйте левую панель для переключения между разделами.</p>
                <h3>1.3 Первые шаги</h3>
                <p>Начните с создания нового проекта через меню.</p>
            </div>
            
            <h2 id="chapter2">🚀 Глава 2: Продвинутые техники</h2>
            <div class="section">
                <p>Более сложные возможности приложения.</p>
                <ul>
                    <li>Пакетная обработка</li>
                    <li>Автоматизация задач</li>
                    <li>Интеграция с внешними API</li>
                </ul>
            </div>
            
            <h2 id="chapter3">⚡ Глава 3: Оптимизация</h2>
            <div class="section">
                <p>Советы по улучшению производительности:</p>
                <ul>
                    <li>Используйте кэширование</li>
                    <li>Оптимизируйте запросы к БД</li>
                    <li>Настройте параметры памяти</li>
                </ul>
            </div>
            
            <h2 id="chapter4">🐛 Глава 4: Отладка</h2>
            <div class="section">
                <p>Инструменты для отладки:</p>
                <div class="highlight">
                    <code>python -m pdb main.py</code>
                </div>
                <p>Используйте логирование для отслеживания ошибок.</p>
            </div>
            
            <h2 id="chapter5">📦 Глава 5: Развертывание</h2>
            <div class="section">
                <p>Процесс развертывания приложения:</p>
                <ol>
                    <li>Сборка проекта</li>
                    <li>Настройка окружения</li>
                    <li>Запуск в production</li>
                </ol>
            </div>
            
            <h2 id="chapter6">🔒 Глава 6: Безопасность</h2>
            <div class="section">
                <p>Рекомендации по безопасности:</p>
                <ul>
                    <li>Всегда проверяйте входные данные</li>
                    <li>Используйте HTTPS</li>
                    <li>Шифруйте чувствительные данные</li>
                </ul>
            </div>
            
            <h2 id="chapter7">🔗 Глава 7: Интеграция</h2>
            <div class="section">
                <p>Интеграция с другими системами:</p>
                <ul>
                    <li>REST API</li>
                    <li>Webhooks</li>
                    <li>Базы данных</li>
                </ul>
            </div>
            
            <h2 id="chapter8">🧪 Глава 8: Тестирование</h2>
            <div class="section">
                <p>Стратегии тестирования:</p>
                <ul>
                    <li>Модульное тестирование</li>
                    <li>Интеграционное тестирование</li>
                    <li>Нагрузочное тестирование</li>
                </ul>
            </div>
            
            <h2 id="chapter9">📊 Глава 9: Мониторинг</h2>
            <div class="section">
                <p>Настройка мониторинга:</p>
                <ul>
                    <li>Системные метрики</li>
                    <li>Логи приложения</li>
                    <li>Оповещения</li>
                </ul>
            </div>
            
            <h2 id="chapter10">📈 Глава 10: Масштабирование</h2>
            <div class="section">
                <p>Как масштабировать приложение:</p>
                <ul>
                    <li>Горизонтальное масштабирование</li>
                    <li>Балансировка нагрузки</li>
                    <li>Кэширование</li>
                </ul>
            </div>
            
            <h2 id="faq">❓ Часто задаваемые вопросы</h2>
            <div class="section">
                <h3>Вопрос: Как начать работу?</h3>
                <p>Ответ: Установите приложение и запустите <code>main.py</code></p>
                <h3>Вопрос: Где найти логи?</h3>
                <p>Ответ: Логи сохраняются в <code>~/app/logs/</code></p>
                <h3>Вопрос: Поддерживается ли плагины?</h3>
                <p>Ответ: Да, с версии 2.0</p>
            </div>
            
            <h2 id="feedback">💬 Обратная связь</h2>
            <div class="section">
                <p>Мы будем рады вашим отзывам и предложениям!</p>
                <ul>
                    <li>Email: support@example.com</li>
                    <li>GitHub: github.com/example/app</li>
                </ul>
            </div>
            
            <h2 id="license">📄 Лицензия</h2>
            <div class="section">
                <p>Это приложение распространяется под лицензией MIT.</p>
                <p>Copyright © 2026 Все права защищены.</p>
            </div>
            
            <div style="text-align: center; margin-top: 50px; color: #999; font-size: 12px;">
                Справка сгенерирована автоматически
            </div>
        </body>
        </html>
        """
    
    def on_nav_click(self, button):
        """Обработчик клика по кнопке навигации"""
        anchor = getattr(button, 'anchor', None)
        if anchor:
            # Прокручиваем к якорю в WebView
            script = f"""
                (function() {{
                    var element = document.getElementById('{anchor}');
                    if (element) {{
                        element.scrollIntoView({{behavior: 'smooth', block: 'start'}});
                        return true;
                    }}
                    return false;
                }})();
            """
            self.webview.run_javascript(script)
    
    def scroll_to_top(self, button):
        """Прокрутка к началу страницы"""
        script = "window.scrollTo({top: 0, behavior: 'smooth'});"
        self.webview.run_javascript(script)

def main():
    win = HelpWindow()
    win.show_all()
    Gtk.main()

if __name__ == "__main__":
    main()
