def count(s):
  return len(s)

def explode(separator, s):
  return str(s).split(separator, 100000)
  
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
  
