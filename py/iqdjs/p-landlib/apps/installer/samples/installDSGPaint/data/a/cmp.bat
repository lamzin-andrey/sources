windres man.rc -O coff c.res
g++ -Xlinker c.res -mwindows -o bmp_editor main.cpp -lcomctl32 -lgdi32 -lcomdlg32
