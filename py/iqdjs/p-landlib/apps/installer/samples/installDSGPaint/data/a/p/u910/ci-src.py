#!/usr/bin/env python
"""
Скрипт для конвертации изображений между различными форматами
Для Python 2.6 (Ubuntu 9.10)
Поддерживает: PNG, BMP, GIF, JPEG (JPG, JPEG, JPE, JFIF)
"""

import os
import sys
import glob
import optparse

# Проверяем доступность PIL
try:
    import Image
except ImportError:
    print "Ошибка: PIL (Python Imaging Library) не установлена"
    print "Установите: sudo apt-get install python-imaging"
    sys.exit(1)

# Поддерживаемые форматы и их расширения
SUPPORTED_FORMATS = {
    'png': ['png'],
    'bmp': ['bmp', 'dib'],
    'gif': ['gif'],
    'jpeg': ['jpg', 'jpeg', 'jpe', 'jfif']
}

# Создаем список всех поддерживаемых расширений для поиска файлов
ALL_SUPPORTED_EXTENSIONS = []
for extensions in SUPPORTED_FORMATS.values():
    ALL_SUPPORTED_EXTENSIONS.extend(extensions)

def get_format_from_extension(filename):
    """
    Определяет формат изображения по расширению файла
    """
    name, ext = os.path.splitext(filename)
    ext = ext.lower().lstrip('.')
    
    for format_name, extensions in SUPPORTED_FORMATS.items():
        if ext in extensions:
            return format_name, ext
    return None, ext

def convert_image(input_path, output_path=None, output_format=None):
    """
    Конвертирует изображение между различными форматами
    """
    try:
        # Открываем изображение
        img = Image.open(input_path)
        
        # Для многокадровых GIF берем первый кадр
        if hasattr(img, 'n_frames') and img.n_frames > 1:
            try:
                img.seek(0)
            except EOFError:
                pass  # Не можем перемотать, используем как есть
        
        # Если выходной путь не указан, генерируем его автоматически
        if output_path is None:
            name, ext = os.path.splitext(input_path)
            input_format, input_ext = get_format_from_extension(input_path)
            
            if output_format:
                # Используем указанный выходной формат
                output_ext = SUPPORTED_FORMATS.get(output_format, [output_format])[0]
                output_path = "%s.%s" % (name, output_ext)
            else:
                # Автоматическое определение: если BMP -> PNG, иначе -> BMP
                if input_format == 'bmp':
                    output_path = name + '.png'
                else:
                    output_path = name + '.bmp'
        
        # Определяем формат для сохранения из расширения выходного файла
        output_format_from_path = get_format_from_extension(output_path)[0]
        
        # Сохраняем изображение
        if output_format_from_path == 'jpeg':
            # Для JPEG сохраняем в режиме RGB
            if img.mode in ('RGBA', 'LA', 'P'):
                img = img.convert('RGB')
            img.save(output_path, 'JPEG', quality=95)
        else:
            img.save(output_path)
        
        print "Успешно: %s -> %s" % (input_path, output_path)
        return True
        
    except Exception, e:
        print "Ошибка при конвертации %s: %s" % (input_path, str(e))
        return False

def convert_to_bmp(input_path, output_path=None):
    """
    Конвертирует любое изображение в BMP
    """
    if output_path is None:
        name, ext = os.path.splitext(input_path)
        output_path = name + '.bmp'
    return convert_image(input_path, output_path, 'bmp')

def convert_from_bmp(input_path, output_format='png', output_path=None):
    """
    Конвертирует BMP в указанный формат
    """
    if output_path is None:
        name, ext = os.path.splitext(input_path)
        output_ext = SUPPORTED_FORMATS.get(output_format, [output_format])[0]
        output_path = "%s.%s" % (name, output_ext)
    return convert_image(input_path, output_path, output_format)

def convert_directory(directory, target_format=None, recursive=False):
    """
    Конвертирует все изображения в директории
    """
    converted_count = 0
    error_count = 0
    
    # Определяем шаблон поиска
    pattern = "**/*" if recursive else "*"
    
    # Ищем все поддерживаемые файлы
    for ext in ALL_SUPPORTED_EXTENSIONS:
        search_pattern = os.path.join(directory, pattern + "." + ext)
        for file_path in glob.glob(search_pattern):
            success = False
            
            if target_format:
                # Конвертировать в указанный формат
                name, current_ext = os.path.splitext(file_path)
                output_ext = SUPPORTED_FORMATS.get(target_format, [target_format])[0]
                output_path = "%s.%s" % (name, output_ext)
                success = convert_image(file_path, output_path, target_format)
            else:
                # Автоматическая конвертация: в BMP или из BMP
                input_format, _ = get_format_from_extension(file_path)
                if input_format == 'bmp':
                    success = convert_from_bmp(file_path, 'png')
                else:
                    success = convert_to_bmp(file_path)
            
            if success:
                converted_count += 1
            else:
                error_count += 1
    
    return converted_count, error_count

def show_supported_formats():
    """Показывает поддерживаемые форматы"""
    print "Поддерживаемые форматы:"
    for format_name, extensions in SUPPORTED_FORMATS.items():
        print "  %-6s -> %s" % (format_name.upper(), ', '.join(extensions))

def main():
    parser = optparse.OptionParser(
        usage="%prog [options] [input] [output]",
        description='Конвертация изображений между различными форматами',
        version="1.0"
    )
    
    parser.add_option('-d', '--directory', dest='directory',
                      help='Директория для пакетной конвертации')
    parser.add_option('-r', '--recursive', action='store_true', dest='recursive',
                      help='Рекурсивный поиск в поддиректориях')
    parser.add_option('-f', '--format', dest='format',
                      choices=['png', 'bmp', 'gif', 'jpeg'],
                      help='Целевой формат для конвертации')
    parser.add_option('--formats', action='store_true', dest='show_formats',
                      help='Показать поддерживаемые форматы и выйти')
    
    # Парсим аргументы вручную для позиционных параметров
    options, args = parser.parse_args()
    
    # Показать поддерживаемые форматы
    if options.show_formats:
        show_supported_formats()
        return 0
    
    # Извлекаем позиционные аргументы
    input_file = args[0] if len(args) > 0 else None
    output_file = args[1] if len(args) > 1 else None
    
    # Проверяем, что указан хотя бы один источник
    if not input_file and not options.directory:
        parser.print_help()
        print "\nОшибка: необходимо указать входной файл или директорию"
        return 1
    
    # Обрабатываем одиночный файл
    if input_file and not options.directory:
        if not os.path.exists(input_file):
            print "Ошибка: файл '%s' не найден" % input_file
            return 1
        
        # Проверяем формат входного файла
        input_format, input_ext = get_format_from_extension(input_file)
        if input_format is None:
            print "Ошибка: неподдерживаемый формат файла '%s'" % input_file
            print "Расширение '.%s' не поддерживается" % input_ext
            show_supported_formats()
            return 1
        
        if convert_image(input_file, output_file, options.format):
            print "Конвертация завершена успешно!"
        else:
            print "Конвертация завершена с ошибками!"
            return 1
    
    # Обрабатываем директорию
    elif options.directory:
        if not os.path.isdir(options.directory):
            print "Ошибка: директория '%s' не найдена" % options.directory
            return 1
        
        print "Обработка директории: %s" % options.directory
        if options.recursive:
            print "Рекурсивный поиск: включен"
        if options.format:
            print "Целевой формат: %s" % options.format
        
        converted, errors = convert_directory(options.directory, options.format, options.recursive)
        print "\nРезультат: успешно - %d, ошибок - %d" % (converted, errors)
        
        if errors > 0:
            return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
