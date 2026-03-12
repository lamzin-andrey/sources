class CFS:
    def readfile(self, path):
      f = open(path, 'r')
      try:
        c = f.read()
      except:
        c = ""
      f.close()
      return c

    def writefile(self, path, c):
      f = open(path, 'w')
      f.write(c)
      f.close()

FS = CFS()
             
