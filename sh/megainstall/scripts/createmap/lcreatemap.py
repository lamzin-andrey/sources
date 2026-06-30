#!/usr/bin/env python3
"""
lcreatemap - Создание дерева каталогов и файлов из map.txt
Утилита для генерации структуры проекта по текстовому описанию
"""

import os
import sys
import re
from pathlib import Path

# Словарь расширений и соответствующих им языков комментариев
COMMENT_STYLES = {
    '.py': '# ',
    '.js': '// ',
    '.ts': '// ',
    '.jsx': '// ',
    '.tsx': '// ',
    '.c': '// ',
    '.cpp': '// ',
    '.h': '// ',
    '.hpp': '// ',
    '.pascal': '{ ',
    '.pas': '{ ',
    '.pp': '{ ',
    '.sh': '# ',
    '.bash': '# ',
    '.sql': '-- ',
    '.php': '// ',
    '.rb': '# ',
    '.perl': '# ',
    '.pl': '# ',
    '.pm': '# ',
    '.go': '// ',
    '.rs': '// ',
    '.java': '// ',
    '.kt': '// ',
    '.swift': '// ',
    '.m': '// ',
    '.mm': '// ',
    '.cs': '// ',
}

# Комментарий по умолчанию для неизвестных расширений
DEFAULT_COMMENT = '# '


def get_comment_style(filename):
    """Определяет стиль комментария по расширению файла"""
    ext = Path(filename).suffix.lower()
    return COMMENT_STYLES.get(ext, DEFAULT_COMMENT)


def parse_tree_line(line):
    """
    Парсит строку дерева и возвращает (путь, комментарий, тип)
    Тип: 'dir' или 'file'
    """
    # Удаляем пробелы в начале и конце
    line = line.rstrip()
    if not line:
        return None, None, None
    
    # Определяем отступ (количество пробелов или символов дерева)
    # Ищем первый непробельный символ
    indent_match = re.match(r'^([\s│├└─]*)', line)
    if not indent_match:
        return None, None, None
    
    indent = indent_match.group(1)
    # Очищаем от графических символов дерева и пробелов
    clean_line = re.sub(r'^[\s│├└─]+', '', line).strip()
    
    if not clean_line:
        return None, None, None
    
    # Разделяем на имя и комментарий
    comment = None
    if '#' in clean_line:
        # Находим первый # который не внутри кавычек (упрощенно)
        parts = clean_line.split('#', 1)
        name = parts[0].strip()
        if len(parts) > 1:
            comment = parts[1].strip()
            if comment.startswith(' ') or comment.startswith('\t'):
                comment = comment.lstrip()
            # Если комментарий в кавычках, он не является комментарием
            if comment and (comment.startswith('"') or comment.startswith("'")):
                # Восстанавливаем исходную строку
                comment = None
                # Перепарсим с учетом кавычек
                quote_match = re.search(r'["\']', clean_line)
                if quote_match:
                    quote_pos = quote_match.start()
                    # Проверяем, что # находится после открывающей кавычки
                    if '#' in clean_line and clean_line.index('#') > quote_pos:
                        # Это # внутри строки, не комментарий
                        name = clean_line
                        comment = None
    else:
        name = clean_line
    
    # Определяем тип (каталог или файл)
    is_dir = False
    if name.endswith('/'):
        is_dir = True
        name = name[:-1]  # Убираем слеш
    
    # Если имя содержит '.', скорее всего файл
    if '.' in name and not is_dir:
        is_dir = False
    
    return name, comment, is_dir


def get_path_from_indent(lines, index):
    """
    Реконструирует полный путь из строки и предыдущих строк
    """
    line = lines[index]
    # Определяем уровень вложенности по количеству пробелов и символов
    indent_match = re.match(r'^([\s│├└─]*)', line)
    if not indent_match:
        return None, None, None
    
    indent = indent_match.group(1)
    # Количество символов отступа (пробелы + графические символы)
    indent_level = len(indent)
    
    # Очищаем строку от символов дерева
    clean_line = re.sub(r'^[\s│├└─]+', '', line).strip()
    if '#' in clean_line:
        parts = clean_line.split('#', 1)
        name = parts[0].strip()
    else:
        name = clean_line
    
    if name.endswith('/'):
        name = name[:-1]
    
    # Ищем родительский путь
    path_parts = []
    
    # Строим путь, поднимаясь вверх
    for i in range(index - 1, -1, -1):
        prev_line = lines[i]
        prev_indent = re.match(r'^([\s│├└─]*)', prev_line)
        if not prev_indent:
            continue
        
        prev_indent_level = len(prev_indent.group(1))
        
        # Если предыдущий отступ меньше текущего - это родитель
        if prev_indent_level < indent_level:
            prev_clean = re.sub(r'^[\s│├└─]+', '', prev_line).strip()
            if '#' in prev_clean:
                prev_name = prev_clean.split('#', 1)[0].strip()
            else:
                prev_name = prev_clean
            
            if prev_name.endswith('/'):
                prev_name = prev_name[:-1]
            
            # Добавляем в начало списка
            path_parts.insert(0, prev_name)
            # Обновляем уровень для продолжения поиска
            indent_level = prev_indent_level
    
    return path_parts, name, indent_group


def create_structure(base_path, lines):
    """
    Создает структуру каталогов и файлов на основе разобранных строк
    """
    created_paths = {}  # Словарь для хранения созданных путей
    
    # Первый проход: парсим все строки и определяем структуру
    parsed_lines = []
    for i, line in enumerate(lines):
        if not line.strip():
            continue
        
        # Определяем уровень вложенности
        indent_match = re.match(r'^([\s│├└─]*)', line)
        if not indent_match:
            continue
        
        indent = indent_match.group(1)
        indent_level = len(indent)
        
        # Очищаем от символов дерева
        clean = re.sub(r'^[\s│├└─]+', '', line).strip()
        if not clean:
            continue
        
        # Разбираем на имя и комментарий
        comment = None
        if '#' in clean:
            parts = clean.split('#', 1)
            name = parts[0].strip()
            comment = parts[1].strip()
            # Проверка на комментарий в кавычках
            if comment and (comment.startswith('"') or comment.startswith("'")):
                # Восстанавливаем
                comment = None
                name = clean
        else:
            name = clean
        
        is_dir = name.endswith('/')
        if is_dir:
            name = name[:-1]
        
        parsed_lines.append({
            'index': i,
            'level': indent_level,
            'name': name,
            'comment': comment,
            'is_dir': is_dir,
            'line': line
        })
    
    # Второй проход: создаем структуру
    for i, parsed in enumerate(parsed_lines):
        name = parsed['name']
        comment = parsed['comment']
        is_dir = parsed['is_dir']
        level = parsed['level']
        
        # Находим родительский путь
        parent_parts = []
        for j in range(i - 1, -1, -1):
            if parsed_lines[j]['level'] < level:
                parent_parts.insert(0, parsed_lines[j]['name'])
                level = parsed_lines[j]['level']
        
        full_path = Path(base_path)
        for part in parent_parts:
            full_path = full_path / part
        
        if is_dir:
            # Создаем каталог
            dir_path = full_path / name
            os.makedirs(dir_path, exist_ok=True)
            
            # Если есть комментарий, создаем README.md
            if comment:
                readme_path = dir_path / 'Readme.md'
                with open(readme_path, 'w', encoding='utf-8') as f:
                    f.write(f"{comment}\n")
                print(f"📁 Создан каталог: {dir_path}")
                print(f"   📄 Создан Readme.md с комментарием: {comment}")
            else:
                print(f"📁 Создан каталог: {dir_path}")
        else:
            # Создаем файл
            file_path = full_path / name
            # Создаем родительские каталоги если их нет
            os.makedirs(file_path.parent, exist_ok=True)
            
            # Записываем комментарий в файл, если он есть
            if comment:
                comment_style = get_comment_style(name)
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(f"{comment_style}{comment}\n")
                print(f"📄 Создан файл: {file_path} (с комментарием)")
            else:
                # Создаем пустой файл
                file_path.touch()
                print(f"📄 Создан файл: {file_path}")


def read_map_file(filename):
    """Читает и обрабатывает файл map.txt"""
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        return lines
    except FileNotFoundError:
        print(f"Ошибка: Файл '{filename}' не найден")
        sys.exit(1)
    except Exception as e:
        print(f"Ошибка при чтении файла: {e}")
        sys.exit(1)


def main():
    """Основная функция"""
    if len(sys.argv) != 2:
        print("Использование: lcreatemap map.txt")
        sys.exit(1)
    
    map_file = sys.argv[1]
    
    # Проверяем существование файла
    if not os.path.isfile(map_file):
        print(f"Ошибка: Файл '{map_file}' не найден")
        sys.exit(1)
    
    # Читаем файл
    lines = read_map_file(map_file)
    
    # Создаем структуру
    try:
        create_structure('.', lines)
        print("\n✅ Структура успешно создана!")
    except Exception as e:
        print(f"Ошибка при создании структуры: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
