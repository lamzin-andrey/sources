def exec(self, shellFile, onFinishExecute):
    # Отключаем кнопки во время выполнения
    self.set_buttons_sensitive(False)
    
    # Сохраняем текущий заголовок
    current_text = self.text_buffer.get_text(
        self.text_buffer.get_start_iter(),
        self.text_buffer.get_end_iter(),
        False
    )
    lines = current_text.split('\n')
    self.current_header = lines[0] if lines else DEFAULT_HEADER
    
    if self.current_header.startswith("<span"):
        self.current_header = self.current_header.replace(f"<span size='{HEADER_SIZE * 1000}' weight='bold'>", "").replace("</span>", "")
    
    self.last_output = []
    self.exec_process = None

    def run_script():
        try:
            self.exec_process = subprocess.Popen(
                ['bash', shellFile],
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                universal_newlines=True,
                bufsize=1
            )
            
            # Читаем вывод
            for line in iter(self.exec_process.stdout.readline, ''):
                self.last_output.append(line.strip())
                if len(self.last_output) > 20:
                    self.last_output.pop(0)
            
            self.exec_process.stdout.close()
            return_code = self.exec_process.wait()
            
            GLib.idle_add(self.on_script_finished, onFinishExecute, return_code)
            
        except Exception as e:
            self.last_output.append(f"Ошибка: {str(e)}")
            GLib.idle_add(self.on_script_finished, onFinishExecute, 1)
    
    # Запускаем таймер для периодического обновления
    GLib.timeout_add(1000, self.update_exec_display)
    
    # Запускаем скрипт в отдельном потоке
    thread = threading.Thread(target=run_script)
    thread.daemon = True
    thread.start()

def update_exec_display(self):
    """Обновляет отображение вывода каждую секунду"""
    if hasattr(self, 'exec_process') and self.exec_process and self.exec_process.poll() is None:
        # Процесс еще работает, обновляем текст
        display_text = "Выполняется установка:\n\n" + "\n".join(self.last_output[-8:])
        self.update_exec_text(display_text)
        return True  # Продолжаем таймер
    return False  # Останавливаем таймер

def update_exec_text(self, content):
    """Обновляет текст во время выполнения"""
    self.setText(self.current_header, content)
    return False
