import threading
class Array:
    def __init__(self):
        self.ls = []
        self.length = 0
        
    def __delitem__(self, x):
        self.ls.__delattr__(x)
        
    def __getitem__(self, x):
        return self.ls[x]
        
    def __setitem__(self, x, y):
        while (len(self.ls) < x + 1):
          self.ls.append("undefined")
          self.length = self.length + 1
          
        self.ls[x] = y

    def push(self, item):
        self.ls.append(item)
        self.length = self.length + 1
        
    def pop(self):
        self.length = self.length - 1
        return self.ls.pop()
        
    def join(self, sep):
        s = ""
        n = 0
        for i in self.ls:
            if (n > 0):
                s = s + sep + str(i)
            else:
                s = s + str(i)
            n = n + 1
        return s
        
    def sort(self, f=None):
        return self.ls.sort(key=f)
        
    
        
    def trace(self):
        print(self.ls) 
        

class SetInterval:
  def __init__(self):
    self.timer = 0
    self.ls = Array()
SI = SetInterval()


def setInterval(func, sec):
  def func_wrapper():
    setInterval(func, sec)
    func()
  t = threading.Timer(sec, func_wrapper)
  t.start()
  SI.timer = t
  return t
  
def __setIntervalRun(func, sec):
  def func_wrapper():
    __setIntervalRun(func, sec)
    func()
  t = threading.Timer(sec, func_wrapper)
  t.start()
  SI.timer = t
  
def __setIntervalHandler():
  i = 0
  while (i < SI.ls.length):
    fn = SI.ls[i]
    f = fn[0]
    lim = fn[1]
    cnt = fn[2]
    if (f != 0):
      cnt = cnt + 1
      if (cnt >= lim):
        cnt = 0
        fn[2] = cnt
        SI.ls[i] = fn
        f()
      else:
        fn[2] = cnt
        SI.ls[i] = fn
    i = i + 1
  
def setInterval2(func, sec):
  fn = Array()
  fn.push(func)
  fn.push(sec) 
  fn.push(0)
  SI.ls.push(fn)
  if(SI.timer == 0):
    __setIntervalRun(__setIntervalHandler, 1)
  return SI.ls.length - 1

def clearInterval(i):
  if (i >= SI.ls.length):
    return
  SI.ls[i][0] = 0

# arr = Array()
# arr.push("z8")
# print(arr.length)
# arr.push("Hertz")
# print(arr.length)
# arr[5] = "Erd"
# print(arr.length)
# arr.trace()
# print(arr[5])
# print(arr.pop())
# arr.trace()
# print(arr.length)
# print(arr.join("Ahha"))
# arr.sort()
# arr.trace()