#!/usr/bin/env python3
"""
Скрипт для конвертации изображений между различными форматами
Поддерживает: PNG, BMP, GIF, WEBP, JPEG (и его вариации)
Использует только стандартные библиотеки Python3
"""

import os
import sys
import argparse
from PIL import Image
import glob

# Поддерживаемые форматы и их расширения
SUPPORTED_FORMATS = {
    'png': ['png'],
    'bmp': ['bmp', 'dib'],
    'gif': ['gif'],
    'webp': ['webp'],
    'jpeg': ['jpg', 'jpeg', 'jpe', 'jfif', 'jif', 'jfi']  # Все известные вариации JPEG
}

# Создаем список всех поддерживаемых расширений для поиска файлов
ALL_SUPPORTED_EXTENSIONS = []
for extensions in SUPPORTED_FORMATS.values():
    ALL_SUPPORTED_EXTENSIONS.extend(extensions)

def get_format_from_extension(filename):
    """
    Определяет формат изображения по расширению файла
    """
    ext = os.path.splitext(filename)[1].lower().lstrip('.')
    
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
        with Image.open(input_path) as img:
            # Для многокадровых GIF берем первый кадр
            if img.format == 'GIF' and img.n_frames > 1:
                img.seek(0)
                # Создаем новое изображение с первым кадром
                first_frame = Image.new('RGBA', img.size)
                first_frame.paste(img, (0, 0))
                img = first_frame
            
            # Если выходной путь не указан, генерируем его автоматически
            if output_path is None:
                name, ext = os.path.splitext(input_path)
                input_format, input_ext = get_format_from_extension(input_path)
                
                if output_format:
                    # Используем указанный выходной формат
                    output_ext = SUPPORTED_FORMATS.get(output_format, [output_format])[0]
                    output_path = f"{name}.{output_ext}"
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
                # Для JPEG сохраняем в режиме RGB и с качеством 95%
                if img.mode in ('RGBA', 'LA', 'P'):
                    img = img.convert('RGB')
                img.save(output_path, 'JPEG', quality=95)
            else:
                img.save(output_path)
            
            print(f"Успешно: {input_path} -> {output_path}")
            return True
            
    except Exception as e:
        print(f"Ошибка при конвертации {input_path}: {str(e)}")
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
        output_path = f"{name}.{output_ext}"
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
        for file_path in glob.glob(search_pattern, recursive=recursive):
            success = False
            
            if target_format:
                # Конвертировать в указанный формат
                name, current_ext = os.path.splitext(file_path)
                output_ext = SUPPORTED_FORMATS.get(target_format, [target_format])[0]
                output_path = f"{name}.{output_ext}"
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
    print("Поддерживаемые форматы:")
    for format_name, extensions in SUPPORTED_FORMATS.items():
        print(f"  {format_name.upper():6} -> {', '.join(extensions)}")

def main():
    parser = argparse.ArgumentParser(
        description='Конвертация изображений между различными форматами',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=f"""
Поддерживаемые форматы:
  PNG    -> {', '.join(SUPPORTED_FORMATS['png'])}
  BMP    -> {', '.join(SUPPORTED_FORMATS['bmp'])}
  GIF    -> {', '.join(SUPPORTED_FORMATS['gif'])}
  WEBP   -> {', '.join(SUPPORTED_FORMATS['webp'])}
  JPEG   -> {', '.join(SUPPORTED_FORMATS['jpeg'])}

Примеры использования:
  %(prog)s image.png                 # Конвертирует image.png в image.bmp
  %(prog)s image.bmp                 # Конвертирует image.bmp в image.png
  %(prog)s image.jpg image.png       # Конвертирует image.jpg в image.png
  %(prog)s image.gif                 # Конвертирует GIF в BMP (первый кадр)
  %(prog)s -d /path/to/images        # Конвертирует все изображения в директории
  %(prog)s -d /path/to/images -r     # Рекурсивная конвертация
  %(prog)s -f png image.bmp          # Конвертирует BMP в PNG
  %(prog)s -f jpg image.png          # Конвертирует PNG в JPG
  %(prog)s --formats                 # Показать поддерживаемые форматы
        """
    )
    
    parser.add_argument('input', nargs='?', help='Входной файл')
    parser.add_argument('output', nargs='?', help='Выходной файл (опционально)')
    parser.add_argument('-d', '--directory', help='Директория для пакетной конвертации')
    parser.add_argument('-r', '--recursive', action='store_true', 
                       help='Рекурсивный поиск в поддиректориях')
    parser.add_argument('-f', '--format', choices=list(SUPPORTED_FORMATS.keys()),
                       help='Целевой формат для конвертации')
    parser.add_argument('--formats', action='store_true',
                       help='Показать поддерживаемые форматы и выйти')
    
    args = parser.parse_args()
    
    # Показать поддерживаемые форматы
    if args.formats:
        show_supported_formats()
        return
    
    # Проверяем, что указан хотя бы один источник
    if not args.input and not args.directory:
        parser.print_help()
        print("\nОшибка: необходимо указать входной файл или директорию")
        sys.exit(1)
    
    # Обрабатываем одиночный файл
    if args.input and not args.directory:
        if not os.path.exists(args.input):
            print(f"Ошибка: файл '{args.input}' не найден")
            sys.exit(1)
        
        # Проверяем формат входного файла
        input_format, input_ext = get_format_from_extension(args.input)
        if input_format is None:
            print(f"Ошибка: неподдерживаемый формат файла '{args.input}'")
            print(f"Расширение '.{input_ext}' не поддерживается")
            show_supported_formats()
            sys.exit(1)
        
        if convert_image(args.input, args.output, args.format):
            print("Конвертация завершена успешно!")
        else:
            print("Конвертация завершена с ошибками!")
            sys.exit(1)
    
    # Обрабатываем директорию
    elif args.directory:
        if not os.path.isdir(args.directory):
            print(f"Ошибка: директория '{args.directory}' не найдена")
            sys.exit(1)
        
        print(f"Обработка директории: {args.directory}")
        if args.recursive:
            print("Рекурсивный поиск: включен")
        if args.format:
            print(f"Целевой формат: {args.format}")
        
        converted, errors = convert_directory(args.directory, args.format, args.recursive)
        print(f"\nРезультат: успешно - {converted}, ошибок - {errors}")
        
        if errors > 0:
            sys.exit(1)

if __name__ == "__main__":
    main()
