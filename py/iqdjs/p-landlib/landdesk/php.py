# It danger! While...

def count(s):
  return len(s)

def explode(separator, s):
  return str(s).split(separator)
  
def strpos(s, needle, offset=0):
  #offset = int(offset) ? int(offset) : 0;
  try:
    offset = int(offset)
  except:
    offset = 0
  try:
    n = str(s).index(needle, offset);
  except:
    return -1
    
  return n
  
