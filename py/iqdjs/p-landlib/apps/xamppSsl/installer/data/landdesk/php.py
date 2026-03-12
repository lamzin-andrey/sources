import os;

SCANDIR_SORT_ASCENDING = 0
SCANDIR_SORT_DESCENDING  = 1
SCANDIR_SORT_NONE = 2

FILE_APPEND = 8

def count(s):
  return len(s)

def explode(separator, s):
  return str(s).split(separator, 100000)
 
def implode(separator, ls):
    return separator.join(ls)

def strpos(s, needle, offset=0):
  try:
    offset = int(offset)
  except:
    offset = 0
  n = -1
  try:
    n = str(s).index(needle, offset);
  except:
    n = -1
    
  return n

def file_exists(path):
  return os.path.exists(path)

def trim(text, charlist=None):
    if charlist is None:
        # Стандартные символы для удаления в PHP
        charlist = " \t\n\r\x0b\x00"
    
    return text.strip(charlist)

import os

def scandir(directory, sort_by_name = SCANDIR_SORT_ASCENDING):
    try:
        # Получаем список файлов и папок
        files = os.listdir(directory)
        
        # Сортируем по имени, как делает PHP по умолчанию
        if sort_by_name == SCANDIR_SORT_DESCENDING:
            files.sort(reverse=True)
        elif sort_by_name == SCANDIR_SORT_ASCENDING:
            files.sort(reverse=False)
            
        return files
    except FileNotFoundError:
        # print(f"Директория '{directory}' не найдена")
        return []
    except PermissionError:
        # print(f"Нет доступа к директории '{directory}'")
        return []
