class CFS:
    def readfile(self, path):
      f = open(path, 'r')
      c = f.read()
      f.close()
      return c

    def writefile(self, path, c):
      f = open(path, 'w')
      f.write(c)
      f.close()

FS = CFS()
             
