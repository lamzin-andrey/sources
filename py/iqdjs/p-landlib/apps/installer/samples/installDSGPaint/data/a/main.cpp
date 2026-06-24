/**
 * Смещена палитра вправо
*/
#include <windows.h>
#include <commdlg.h>
#include <commctrl.h>
#include <string>
#include <cmath>
#include <vector>
#include <fstream>
#include <sstream>
#include <algorithm>
#include <ctime>
#include <secext.h> // для GetUserNameEx
//#include <unistd.h>
#include "resource.h"

#pragma comment(lib, "comctl32.lib")
#pragma comment(lib, "comdlg32.lib")

using namespace std;

LRESULT CALLBACK EditProc(HWND hWnd, UINT uMsg, WPARAM wParam, LPARAM lParam);
LRESULT CALLBACK ImageBtnProc(HWND hWnd, UINT uMsg, WPARAM wParam, LPARAM lParam);
LRESULT CALLBACK WndProc(HWND hwnd, UINT msg, WPARAM wParam, LPARAM lParam);

// Константы и глобальные переменные
const int TOOLBAR_WIDTH = 150;
const int TOOLBAR_BUTTON_SIZE = 32;
const int BUTTON_PADDING = 16;
const int BUTTON_SPACING = 10;
const int BUTTONS_PER_ROW = 3;
const int PALETTE_COLORS = 16;
const int COLOR_BOX_SIZE = 32;
const int SELECTED_COLOR_SIZE = 48;
const int DEV_Y_OFFSET = 25;
const int DEV_X_PALETTE_OFFSET = 159;
WNDPROC defaultEditProc;
WNDPROC defaultBtnProc;

// Цвет панели инструментов #EFE9D6 в RGB
const COLORREF TOOLBAR_BG_COLOR = RGB(0xEF, 0xE9, 0xD6);

// js layer
void alert(string s) {
	MessageBoxA(0, s.c_str(), "Alert", 0);
}

void alert(wstring s) {
	MessageBoxW(0, (const WCHAR*)s.c_str(), (const WCHAR*)"Alert", 0);
}

void alert(int n) {
	char s[256];
	sprintf(s, "%d", n);
	MessageBoxA(0, s, "Alert", 0);
}
// END js layer

// micron layer
string v(HWND h, string s = ""){
	char cName[256];
	int r = GetClassNameA(h, cName, sizeof(cName));
	if (r > 0) {
		string sCn = cName;
		if (sCn == "Edit" || sCn == "Static") {
			if (s.length() > 0) {
				SetWindowTextA(h, s.c_str());
				return s;
			}
			GetWindowTextA(h, cName, 256);
			string sR = cName;
			return sR;
		}
	}  else {
		alert("Unable detect input type");
	}
}

string prop(HBITMAP hBmp, string propName, string propValue = ""){
	BITMAP bmp;
	if (GetObject(hBmp, sizeof(BITMAP), &bmp) == 0) {
		// here for any case
		//ReleaseDC(hwnd, hdc);
		return "";
	}
	if (propName == "width") {
		char ch[255];
		sprintf(ch, "%d", bmp.bmWidth);
		string r = ch;
		return r;
	}
	
	if (propName == "height") {
		char ch[255];
		sprintf(ch, "%d", bmp.bmHeight);
		string r = ch;
		return r;
	}
	
	return "";
}
// END micron layer

// LLD layer
void lldDrawRect(HWND hWnd, int x, int y, int w, int h, COLORREF color)
{
    // Получаем контекст устройства для окна
    HDC hdc = GetDC(hWnd);
    
    if (hdc == NULL)
        return;
    
    // Создаем кисть с нужным цветом
    HBRUSH hBrush = CreateSolidBrush(color);
    HBRUSH hOldBrush = NULL;
    
    if (hBrush != NULL)
    {
        // Выбираем кисть в контекст
        hOldBrush = (HBRUSH)SelectObject(hdc, hBrush);
        
        // Рисуем залитый прямоугольник
        Rectangle(hdc, x, y, x + w, y + h);
        
        // Восстанавливаем старую кисть
        SelectObject(hdc, hOldBrush);
        
        // Удаляем созданную кисть
        DeleteObject(hBrush);
    }
    
    // Освобождаем контекст устройства
    ReleaseDC(hWnd, hdc);
}


void lldImage(HWND hWnd, string bmpFilePath, int x, int y, int w = -1, int h = -1, 
                        int transparentR = -1, int transparentG = -1, int transparentB = -1) {
    
    HBITMAP hBitmap = (HBITMAP)LoadImageA(NULL, bmpFilePath.c_str(), IMAGE_BITMAP, 0, 0, 
                                        LR_LOADFROMFILE | LR_CREATEDIBSECTION);
    if (!hBitmap) return;
    
    HDC hdc = GetDC(hWnd);
    HDC hdcMem = CreateCompatibleDC(hdc);
    HBITMAP hOldBitmap = (HBITMAP)SelectObject(hdcMem, hBitmap);
    
    BITMAP bmp;
    GetObject(hBitmap, sizeof(BITMAP), &bmp);
    
    int origWidth = bmp.bmWidth;
    int origHeight = bmp.bmHeight;
    
    int finalWidth = origWidth;
    int finalHeight = origHeight;
    
    if (w != -1 && h != -1) {
        finalWidth = w;
        finalHeight = h;
    }
    else if (w != -1 && h == -1) {
        finalWidth = w;
        finalHeight = (int)((float)origHeight * w / origWidth);
    }
    else if (w == -1 && h != -1) {
        finalHeight = h;
        finalWidth = (int)((float)origWidth * h / origHeight);
    }
    
    bool useTransparency = (transparentR != -1 && transparentG != -1 && transparentB != -1);
    
    if (useTransparency) {
        COLORREF transparentColor = RGB(transparentR, transparentG, transparentB);
        
        // Используем TransparentBlt если доступен (Windows 2000+)
        HINSTANCE hMsImg = LoadLibrary("msimg32.dll");
        if (hMsImg) {
            typedef BOOL (WINAPI *TransparentBltFunc)(HDC, int, int, int, int, 
                                                     HDC, int, int, int, int, UINT);
            TransparentBltFunc pTransparentBlt = (TransparentBltFunc)GetProcAddress(hMsImg, "TransparentBlt");
            
            if (pTransparentBlt) {
                HDC hdcTemp = CreateCompatibleDC(hdc);
                HBITMAP hTempBmp = CreateCompatibleBitmap(hdc, finalWidth, finalHeight);
                HBITMAP hOldTempBmp = (HBITMAP)SelectObject(hdcTemp, hTempBmp);
                
                // Масштабируем во временный bitmap
                StretchBlt(hdcTemp, 0, 0, finalWidth, finalHeight, 
                          hdcMem, 0, 0, origWidth, origHeight, SRCCOPY);
                
                // Рисуем с прозрачностью
                pTransparentBlt(hdc, x, y, finalWidth, finalHeight, 
                               hdcTemp, 0, 0, finalWidth, finalHeight, 
                               transparentColor);
                
                SelectObject(hdcTemp, hOldTempBmp);
                DeleteObject(hTempBmp);
                DeleteDC(hdcTemp);
            }
            
            FreeLibrary(hMsImg);
        }
    }
    else {
        if (finalWidth == origWidth && finalHeight == origHeight) {
            BitBlt(hdc, x, y, finalWidth, finalHeight, hdcMem, 0, 0, SRCCOPY);
        }
        else {
            StretchBlt(hdc, x, y, finalWidth, finalHeight, 
                      hdcMem, 0, 0, origWidth, origHeight, SRCCOPY);
        }
    }
    
    SelectObject(hdcMem, hOldBitmap);
    DeleteDC(hdcMem);
    ReleaseDC(hWnd, hdc);
    DeleteObject(hBitmap);
}
// END LLD layer

// php layer
string strval(int i) {
	char buf[256];
	sprintf(buf, "%d", i);
	string r = buf;
	return r;
}

int intval(string s) {
	return atoi(s.c_str());
}
//END  php layer

enum Tool {
    TOOL_OPEN,
    TOOL_SAVE,
    TOOL_SELECTION,
    TOOL_RECTANGLE,
    TOOL_ELLIPSE,
    TOOL_LINE,
    TOOL_ZOOM_IN,
    TOOL_ZOOM_OUT,
    TOOL_TEXT,
    TOOL_CROP,
    TOOL_CUT,
    TOOL_CANVAS
};

enum FillMode {
    FILL_NONE,
    FILL_SOLID
};

struct Point {
    int x, y;
    Point(int x = 0, int y = 0) : x(x), y(y) {}
};

struct Rect {
    int left, top, right, bottom;
    Rect(int l = 0, int t = 0, int r = 0, int b = 0) : left(l), top(t), right(r), bottom(b) {}
    int width() const { return right - left; }
    int height() const { return bottom - top; }
};


// Структура для хранения настроек
struct Settings {
    LOGFONTA font;
    Settings()
    {
        memset(&font, 0, sizeof(LOGFONTA));
		font.lfCharSet = RUSSIAN_CHARSET; 
    }
};

class ImageEditor {
private:
    HINSTANCE hInstance;
    Tool currentTool;
    Tool storedTool;
    FillMode fillMode;
    COLORREF currentColor;
    float zoomLevel;
    HBITMAP loadedBitmap;
    HDC memoryDC;
    Rect selectionRect;
    bool isSelecting;
    bool isDrawing;
    Point dragStart;
    Point drawStart;
    vector<BYTE> clipboardImage;
    int clipboardWidth, clipboardHeight;
    bool hasClipboard;
    HBITMAP clipBmp;
	HDC clipDC;
	HBITMAP hClipboardBmp;
	HDC hdcMem;
    
    // Элементы управления
    HWND hToolbar;
    HWND hScrollV, hScrollH;
    HWND hColorBoxes[PALETTE_COLORS];
    HWND hSelectedColor;
    HWND hMoreColors;
    HWND bSelect;
    HWND bLine;
	HWND bRect;
	HWND bEllips;
	HWND bCut;
	HWND bText;
	HWND bCrop;
	HWND bZoomIn;
	HWND bZoomOut;
	HWND bSave;
	HWND bOpen;
	HWND bCanvas;
    
    
    COLORREF paletteColors[PALETTE_COLORS];
	int scrollPosX;
    int scrollPosY;
    
    // Insert Selection Mode
    bool insertSelectionMode;
    int  insertSelectionX;
    int  insertSelectionY;
    // drag and drop
    bool isStartDrag;
    int startDragX;
    int startDragY;
    int startDragSelRX;
    int startDragSelRY;
    // /Insert Selection Mode
    
    HWND hTooltip;
	TOOLINFO toolInfo;
	
	bool skipCanvasSizeUpd;
	
	// Control selection from inputs
	bool selectionMode;
	bool inputFocused;
	
	// history
	int historySz;// = 256;
	HDC history[256];
	int historyI;
	int historyC;
	
	Settings g_settings; // LOGFONT[A]
	HFONT g_hFont;
	
	wstring tmpFile;
	wstring file;
	bool fileIsOpen;
	
	bool pngIsSupported;

public:
	HWND hwnd;
	HWND hCanvas;
	HWND hStatusText;
	// Для текстового инструмента
	HWND hTextX, hTextY, hTextW, hTextH, iLineW, hLabelLineW;
	HWND hTextXLabel, hTextYLabel, hTextWLabel, hTextHLabel, hTextControlsTitle;
	
	// Для текстового инструмента
    HWND hTextInput;
    HWND hFontButton;
    HWND hFillNoneBtn, hFillSolidBtn;
    HFONT textFont;
    string textContent;
    Rect textRect;
    bool textBackground;
    bool textControlsVisible;
    HWND focusedEditControl; // Текущее поле ввода с фокусом

    ImageEditor(HWND hwnd, HINSTANCE hInstance) : hwnd(hwnd), hInstance(hInstance),
        currentTool(TOOL_SELECTION), fillMode(FILL_NONE), zoomLevel(1.0f), loadedBitmap(NULL), memoryDC(NULL),
        isSelecting(false), isDrawing(false), hasClipboard(false), textFont(NULL),
        textBackground(true), textControlsVisible(false) {

        scrollPosX = 0;
		scrollPosY = 0;
        currentColor = RGB(0xAA, 0, 0);
        textContent = "New Text";
        textRect = Rect(10, 10, 80, 25);
        focusedEditControl = NULL;
        storedTool = TOOL_SELECTION;
        insertSelectionMode = false;
        insertSelectionX = 0;
        insertSelectionY = 0;
        isStartDrag = false;
        startDragX = 0;
        startDragY = 0;
        startDragSelRX = 0;
        startDragSelRY = 0;

        HDC hdc = GetDC(hwnd);
        memoryDC = CreateCompatibleDC(hdc);
        ReleaseDC(hwnd, hdc);
        defaultEditProc = NULL;
        defaultBtnProc = NULL;
        hTextX = NULL;
        hTextY = NULL;
        hTextW = NULL;
        hTextH = NULL;
        skipCanvasSizeUpd = false;
        selectionMode = true;
        inputFocused = false;
        historyI = 0;
        historyC = 0;
        historySz = 256;
        
        tmpFile = L"";
        file = L"";
		fileIsOpen = false;
		
		pngIsSupported = false;
        
		CreateDefaultCanvas(800, 600);
    }

    ~ImageEditor() {
        if (loadedBitmap) DeleteObject(loadedBitmap);
        if (memoryDC) DeleteDC(memoryDC);
        if (textFont) DeleteObject(textFont);
    }
    
	HWND GetTextX() const { return hTextX; }
	HWND GetTextY() const { return hTextY; }
	HWND GetTextW() const { return hTextW; }
	HWND GetTextH() const { return hTextH; }
	

    void Initialize() {
		InitTooltips();
        CreateToolbar();
        CreateCanvas();
        CreatePalette();
        InitializeColors();
    }
    
    void status(WPARAM wParam, LPARAM lParam){
		unsigned long hiWParam = HIWORD(wParam); 
		unsigned long loWParam = LOWORD(wParam); 
		unsigned long hiLParam = HIWORD(lParam); 
		unsigned long loLParam = LOWORD(lParam); 
		
		char msg[4096];
		sprintf(msg, "hiWParam = %lu, loWParam = %lu, hiLParam = %lu, loLParam = %lu", hiWParam, loWParam, hiLParam, loLParam);
		SetWindowText(hStatusText, msg);
	}

	
	HWND GetFocusedEdit() const {
        HWND hFocus = GetFocus();
        if (hFocus == hTextX || hFocus == hTextY || hFocus == hTextW || hFocus == hTextH) {
            return hFocus;
        }
        return NULL;
    }
	
	
	// 3. Добавим метод проверки фокуса в класс ImageEditor
	bool IsEditFocused(HWND hEdit) const {
		return focusedEditControl == hEdit;
	}


	string GetAppPath() {
		static string appPath;
		if (!appPath.empty()) return appPath;
		
		char path[MAX_PATH];
		GetModuleFileName(NULL, path, MAX_PATH);
		
		// Извлекаем путь к директории
		char* lastSlash = strrchr(path, '\\');
		if (lastSlash) {
			*lastSlash = '\0';
		}
		
		appPath = path;
		return appPath;
	}

	void InitTooltips() {
		// Создаем окно тултипа
		hTooltip = CreateWindowEx(WS_EX_TOPMOST, TOOLTIPS_CLASS, NULL,
								WS_POPUP | TTS_NOPREFIX | TTS_ALWAYSTIP,
								CW_USEDEFAULT, CW_USEDEFAULT, CW_USEDEFAULT, CW_USEDEFAULT,
								hwnd, NULL, GetModuleHandle(NULL), NULL);
		// Самый базовый вызов
		
		
		/*hTooltip = CreateWindow(
			TOOLTIPS_CLASS, 
			NULL, 
			WS_CHILD | WS_VISIBLE| WS_POPUP,  // Минимальные стили
			0, 0, 100, 20, 
			hwnd, 
			NULL, 
			hInstance, 
			NULL);*/
		if (hTooltip) {
			// Настраиваем тултип
			SetWindowPos(hTooltip, HWND_TOPMOST, 0,0,0,0, SWP_NOMOVE|SWP_NOSIZE|SWP_NOACTIVATE);
			//SendMessage(hTooltip, TTM_SETMAXTIPWIDTH, 0, 300);
			SendMessage(hTooltip, TTM_SETDELAYTIME, TTDT_AUTOPOP, 10000); // 10 сек
		}
	}
	
    void CreateToolbar() {
        hToolbar = CreateWindow("STATIC", "", WS_CHILD | WS_VISIBLE,
                               0, 0, TOOLBAR_WIDTH, 600, hwnd, NULL, hInstance, NULL);

        HBRUSH toolbarBrush = CreateSolidBrush(TOOLBAR_BG_COLOR);
        SetClassLong(hToolbar, GCL_HBRBACKGROUND, (LONG)toolbarBrush);

        const wchar_t* toolTips[] = {
            (wchar_t*)"Open", (wchar_t*)"Save", (wchar_t*)"Selection", (wchar_t*)"Rectangle", (wchar_t*)"Ellipse",
            (wchar_t*)"Line", (wchar_t*)"Zoom In", (wchar_t*)"Zoom Out", (wchar_t*)"Text", (wchar_t*)"Crop", (wchar_t*)"Cut", (wchar_t*)"Canvas size"
        };

		string bmpFile;
        for (int i = 0; i < 12; i++) {
            int row = i / BUTTONS_PER_ROW;
            int col = i % BUTTONS_PER_ROW;

            int x = BUTTON_PADDING + col * (TOOLBAR_BUTTON_SIZE + BUTTON_SPACING);
            int y = BUTTON_PADDING + row * (TOOLBAR_BUTTON_SIZE + BUTTON_SPACING);

            char btnText[3] = {0};
            bool doOldBtn = true;
            switch (i) {
                case 0: {
					strcpy(btnText, "O");
					bmpFile = GetAppPath() + "\\i\\Oframe.bmp";
					bOpen = CreateWindow("BUTTON", btnText,
                                   WS_CHILD | WS_VISIBLE | BS_PUSHBUTTON,
                                   x, y,
                                   TOOLBAR_BUTTON_SIZE, TOOLBAR_BUTTON_SIZE,
                                   hwnd, (HMENU)(1000 + i), hInstance, NULL);
                    
                    lldImage(bOpen, bmpFile.c_str(), 5, 5);
                    doOldBtn = false;
					AddTooltip(bOpen, toolTips[i]);
					break;
				}
                case 1: {
					strcpy(btnText, "Z");
					bmpFile = GetAppPath() + "\\i\\Zframe.bmp";
					bSave = CreateWindow("BUTTON", btnText,
                                   WS_CHILD | WS_VISIBLE | BS_PUSHBUTTON,
                                   x, y,
                                   TOOLBAR_BUTTON_SIZE, TOOLBAR_BUTTON_SIZE,
                                   hwnd, (HMENU)(1000 + i), hInstance, NULL);
                    
                    lldImage(bSave, bmpFile.c_str(), 5, 5);
                    doOldBtn = false;
                    AddTooltip(bSave, toolTips[i]);
					break;
				}
                case 2: {
					strcpy(btnText, "S"); 
					bmpFile = GetAppPath() + "\\i\\Sframe.bmp";
					bSelect = CreateWindow("BUTTON", btnText,
                                   WS_CHILD | WS_VISIBLE | BS_PUSHBUTTON,
                                   x, y,
                                   TOOLBAR_BUTTON_SIZE, TOOLBAR_BUTTON_SIZE,
                                   hwnd, (HMENU)(1000 + i), hInstance, NULL);
                    
                    lldImage(bSelect, bmpFile.c_str(), 5, 5);
                    doOldBtn = false;
                    AddTooltip(bSelect, toolTips[i]);
                    break;
				}
                case 3: {
					strcpy(btnText, "R");
					bmpFile = GetAppPath() + "\\i\\Rframe.bmp";
					bRect = CreateWindow("BUTTON", btnText,
                                   WS_CHILD | WS_VISIBLE | BS_PUSHBUTTON,
                                   x, y,
                                   TOOLBAR_BUTTON_SIZE, TOOLBAR_BUTTON_SIZE,
                                   hwnd, (HMENU)(1000 + i), hInstance, NULL);
                    
                    lldImage(bRect, bmpFile.c_str(), 5, 5);
                    doOldBtn = false;
                    AddTooltip(bRect, toolTips[i]);
					break;
				}
                case 4:{
					strcpy(btnText, "E");
					bmpFile = GetAppPath() + "\\i\\Eframe.bmp";
					bEllips = CreateWindow("BUTTON", btnText,
                                   WS_CHILD | WS_VISIBLE | BS_PUSHBUTTON,
                                   x, y,
                                   TOOLBAR_BUTTON_SIZE, TOOLBAR_BUTTON_SIZE,
                                   hwnd, (HMENU)(1000 + i), hInstance, NULL);
                    
                    lldImage(bEllips, bmpFile.c_str(), 5, 5);
                    doOldBtn = false;
                    AddTooltip(bEllips, toolTips[i]);
					break;
				}
                case 5:{
					strcpy(btnText, "L");
					bmpFile = GetAppPath() + "\\i\\Lframe.bmp";
					bLine = CreateWindow("BUTTON", btnText,
                                   WS_CHILD | WS_VISIBLE | BS_PUSHBUTTON,
                                   x, y,
                                   TOOLBAR_BUTTON_SIZE, TOOLBAR_BUTTON_SIZE,
                                   hwnd, (HMENU)(1000 + i), hInstance, NULL);
                    
                    lldImage(bLine, bmpFile.c_str(), 5, 5);
                    doOldBtn = false;
                    AddTooltip(bLine, toolTips[i]);
					break;
				}
                case 6: {
					strcpy(btnText, "+");
					bmpFile = GetAppPath() + "\\i\\+frame.bmp";
					bZoomIn = CreateWindow("BUTTON", btnText,
                                   WS_CHILD | WS_VISIBLE | BS_PUSHBUTTON,
                                   x, y,
                                   TOOLBAR_BUTTON_SIZE, TOOLBAR_BUTTON_SIZE,
                                   hwnd, (HMENU)(1000 + i), hInstance, NULL);
                    
                    lldImage(bZoomIn, bmpFile.c_str(), 5, 5);
                    doOldBtn = false;
                    AddTooltip(bZoomIn, toolTips[i]);
					break;
				}
                case 7: {
					strcpy(btnText, "-");
					bmpFile = GetAppPath() + "\\i\\-frame.bmp";
					bZoomOut = CreateWindow("BUTTON", btnText,
                                   WS_CHILD | WS_VISIBLE | BS_PUSHBUTTON,
                                   x, y,
                                   TOOLBAR_BUTTON_SIZE, TOOLBAR_BUTTON_SIZE,
                                   hwnd, (HMENU)(1000 + i), hInstance, NULL);
                    
                    lldImage(bZoomOut, bmpFile.c_str(), 5, 5);
                    doOldBtn = false;
                    AddTooltip(bZoomOut, toolTips[i]);
					break;
				}
                case 8: {
					strcpy(btnText, "T");
					bmpFile = GetAppPath() + "\\i\\Tframe.bmp";
					bText = CreateWindow("BUTTON", btnText,
                                   WS_CHILD | WS_VISIBLE | BS_PUSHBUTTON,
                                   x, y,
                                   TOOLBAR_BUTTON_SIZE, TOOLBAR_BUTTON_SIZE,
                                   hwnd, (HMENU)(1000 + i), hInstance, NULL);
                    
                    lldImage(bText, bmpFile.c_str(), 5, 5);
                    doOldBtn = false;
                    AddTooltip(bText, toolTips[i]);
					break;
				}
                case 9: {
					strcpy(btnText, "C");
					bmpFile = GetAppPath() + "\\i\\Cframe.bmp";
					bCrop = CreateWindow("BUTTON", btnText,
                                   WS_CHILD | WS_VISIBLE | BS_PUSHBUTTON,
                                   x, y,
                                   TOOLBAR_BUTTON_SIZE, TOOLBAR_BUTTON_SIZE,
                                   hwnd, (HMENU)(1000 + i), hInstance, NULL);
                    
                    lldImage(bCrop, bmpFile.c_str(), 5, 5);
                    doOldBtn = false;
                    AddTooltip(bCrop, toolTips[i]);
					break;
				}
                case 10:{
					strcpy(btnText, "X");
					bmpFile = GetAppPath() + "\\i\\Xframe.bmp";
					bCut = CreateWindow("BUTTON", btnText,
                                   WS_CHILD | WS_VISIBLE | BS_PUSHBUTTON,
                                   x, y,
                                   TOOLBAR_BUTTON_SIZE, TOOLBAR_BUTTON_SIZE,
                                   hwnd, (HMENU)(1000 + i), hInstance, NULL);
                    
                    lldImage(bCut, bmpFile.c_str(), 5, 5);
                    doOldBtn = false;
                    AddTooltip(bCut, toolTips[i]);
					break;
				}
				case 11:{
					strcpy(btnText, "A");
					bmpFile = GetAppPath() + "\\i\\Aframe.bmp";
					bCanvas = CreateWindow("BUTTON", "A",
                                   WS_CHILD | WS_VISIBLE | BS_PUSHBUTTON,
                                   x, y,
                                   TOOLBAR_BUTTON_SIZE, TOOLBAR_BUTTON_SIZE,
                                   hwnd, (HMENU)(1000 + i), hInstance, NULL);
                    
                    lldImage(bCanvas, bmpFile.c_str(), 5, 5);
                    doOldBtn = false;
                    AddTooltip(bCanvas, toolTips[i]);
					break;
				}
            }

			if (doOldBtn) {
				HWND btn = CreateWindow("BUTTON", btnText,
									   WS_CHILD | WS_VISIBLE | BS_PUSHBUTTON,
									   x, y,
									   TOOLBAR_BUTTON_SIZE, TOOLBAR_BUTTON_SIZE,
									   hwnd, (HMENU)(1000 + i), hInstance, NULL);
			}
            
        }

        // Кнопки режима заливки с ASCII символами
        int fillY = BUTTON_PADDING + 4 * (TOOLBAR_BUTTON_SIZE + BUTTON_SPACING);
        hFillNoneBtn = CreateWindow("BUTTON", "O", // Белый кружок
                                   WS_CHILD | WS_VISIBLE | BS_PUSHBUTTON,
                                   BUTTON_PADDING, fillY,
                                   TOOLBAR_BUTTON_SIZE, TOOLBAR_BUTTON_SIZE,
                                   hwnd, (HMENU)5000, hInstance, NULL);
                                   
        bmpFile = GetAppPath() + "\\i\\frame.bmp";
        lldImage(hFillNoneBtn, bmpFile.c_str(), 5, 5);
        AddTooltip(hFillNoneBtn, (wchar_t*)"No fill");

        hFillSolidBtn = CreateWindow("BUTTON", "@", // Черный кружок
                                   WS_CHILD | WS_VISIBLE | BS_PUSHBUTTON,
                                   BUTTON_PADDING + TOOLBAR_BUTTON_SIZE + BUTTON_SPACING, fillY,
                                   TOOLBAR_BUTTON_SIZE, TOOLBAR_BUTTON_SIZE,
                                   hwnd, (HMENU)5001, hInstance, NULL);
		
		bmpFile = GetAppPath() + "\\i\\solid.bmp";
        lldImage(hFillSolidBtn, bmpFile.c_str(), 5, 5);
        AddTooltip(hFillSolidBtn, (wchar_t*)"Fill");
		
		SetWindowLongPtr(bLine, GWLP_USERDATA, (LONG_PTR)this);
		SetWindowLongPtr(bRect, GWLP_USERDATA, (LONG_PTR)this);
		SetWindowLongPtr(bEllips, GWLP_USERDATA, (LONG_PTR)this);
		SetWindowLongPtr(bCut, GWLP_USERDATA, (LONG_PTR)this);
		SetWindowLongPtr(bCrop, GWLP_USERDATA, (LONG_PTR)this);
		SetWindowLongPtr(bZoomIn, GWLP_USERDATA, (LONG_PTR)this);
		SetWindowLongPtr(bZoomOut, GWLP_USERDATA, (LONG_PTR)this);
		SetWindowLongPtr(bSave, GWLP_USERDATA, (LONG_PTR)this);
		SetWindowLongPtr(bOpen, GWLP_USERDATA, (LONG_PTR)this);
		SetWindowLongPtr(bText, GWLP_USERDATA, (LONG_PTR)this);
		SetWindowLongPtr(bCanvas, GWLP_USERDATA, (LONG_PTR)this);
		SetWindowLongPtr(hFillNoneBtn, GWLP_USERDATA, (LONG_PTR)this);
		SetWindowLongPtr(hFillSolidBtn, GWLP_USERDATA, (LONG_PTR)this);
		SetWindowLongPtr(bSelect, GWLP_USERDATA, (LONG_PTR)this);
		if (!defaultBtnProc) {
			defaultBtnProc = (WNDPROC)SetWindowLongPtr(bOpen, GWLP_WNDPROC, (LONG_PTR)ImageBtnProc);
			
			SetWindowLongPtr(bLine, GWLP_WNDPROC, (LONG_PTR)ImageBtnProc);
			SetWindowLongPtr(bRect, GWLP_WNDPROC, (LONG_PTR)ImageBtnProc);
			SetWindowLongPtr(bEllips, GWLP_WNDPROC, (LONG_PTR)ImageBtnProc);
			SetWindowLongPtr(bCut, GWLP_WNDPROC, (LONG_PTR)ImageBtnProc);
			SetWindowLongPtr(bCrop, GWLP_WNDPROC, (LONG_PTR)ImageBtnProc);
			SetWindowLongPtr(bZoomIn, GWLP_WNDPROC, (LONG_PTR)ImageBtnProc);
			SetWindowLongPtr(bZoomOut, GWLP_WNDPROC, (LONG_PTR)ImageBtnProc);
			SetWindowLongPtr(bSave, GWLP_WNDPROC, (LONG_PTR)ImageBtnProc);
			SetWindowLongPtr(bText, GWLP_WNDPROC, (LONG_PTR)ImageBtnProc);
			SetWindowLongPtr(bCanvas, GWLP_WNDPROC, (LONG_PTR)ImageBtnProc);
			SetWindowLongPtr(hFillNoneBtn, GWLP_WNDPROC, (LONG_PTR)ImageBtnProc);
			SetWindowLongPtr(hFillSolidBtn, GWLP_WNDPROC, (LONG_PTR)ImageBtnProc);
			SetWindowLongPtr(bSelect, GWLP_WNDPROC, (LONG_PTR)ImageBtnProc);
		}
	    
    }


	void AddTooltip(HWND hButton, const wchar_t* text) {
		toolInfo.cbSize = sizeof(TOOLINFO);
		toolInfo.uFlags = TTF_SUBCLASS | TTF_IDISHWND;
		toolInfo.hwnd = GetParent(hButton); // Родительское окно
		toolInfo.uId = (UINT_PTR)hButton;   // ID = хендл кнопки
		toolInfo.hinst = GetModuleHandle(NULL);
		toolInfo.lpszText = (LPSTR)text;
		
		SendMessage(hTooltip, TTM_ADDTOOL, 0, (LPARAM)&toolInfo);
		SendMessage(hTooltip, WM_SETFONT, (WPARAM)GetStockObject(DEFAULT_GUI_FONT), TRUE);
		
		
		
		// Минимальная настройка
        //TOOLINFO ti;
        /*memset(&toolInfo, 0, sizeof(TOOLINFO));
        toolInfo.cbSize = sizeof(TOOLINFO);
        toolInfo.hwnd = hwnd;
        toolInfo.uFlags = TTF_IDISHWND;  // Только обязательные флаги
        toolInfo.uId = (UINT_PTR)hButton;
        toolInfo.lpszText = "Open";
        
        SendMessage(hTooltip, TTM_ADDTOOL, 0, (LPARAM)&toolInfo);*/
	}

    void CreateCanvas() {
        RECT clientRect;
        GetClientRect(hwnd, &clientRect);

        hCanvas = CreateWindow("STATIC", "",
                              WS_CHILD | WS_VISIBLE | SS_BLACKFRAME,
                              TOOLBAR_WIDTH, 0,
                              clientRect.right - TOOLBAR_WIDTH - 20,
                              clientRect.bottom - 100,
                              hwnd, NULL, hInstance, NULL);

        hScrollV = CreateWindow("SCROLLBAR", "",
                               WS_CHILD | WS_VISIBLE | SBS_VERT,
                               clientRect.right - 20, 0, 20, clientRect.bottom - 100,
                               hwnd, NULL, hInstance, NULL);

        hScrollH = CreateWindow("SCROLLBAR", "",
                               WS_CHILD | WS_VISIBLE | SBS_HORZ,
                               TOOLBAR_WIDTH, clientRect.bottom - 100,
                               clientRect.right - TOOLBAR_WIDTH - 20, 20,
                               hwnd, NULL, hInstance, NULL);
    }

	int zGetPaletteY(){
		RECT clientRect;
        GetClientRect(hwnd, &clientRect);

        return clientRect.bottom - 80;
	}
	
    void CreatePalette() {
        /*RECT clientRect;
        GetClientRect(hwnd, &clientRect);

        int yPos = clientRect.bottom - 80;*/
        int yPos = zGetPaletteY();

	
        for (int i = 0; i < PALETTE_COLORS; i++) {
            hColorBoxes[i] = CreateWindow("STATIC", "",
                                         WS_CHILD | WS_VISIBLE | SS_BLACKFRAME,
                                         10 + i * COLOR_BOX_SIZE, yPos,
                                         COLOR_BOX_SIZE, COLOR_BOX_SIZE,
                                         hwnd, (HMENU)(2000 + i), hInstance, NULL);
        }

        hSelectedColor = CreateWindow("STATIC", "",
                                    WS_CHILD | WS_VISIBLE | SS_BLACKFRAME,
                                    10 + PALETTE_COLORS * COLOR_BOX_SIZE + 10, yPos,
                                    SELECTED_COLOR_SIZE, SELECTED_COLOR_SIZE,
                                    hwnd, NULL, hInstance, NULL);

        hMoreColors = CreateWindow("BUTTON", "More",
                                  WS_CHILD | WS_VISIBLE,
                                  10 + PALETTE_COLORS * COLOR_BOX_SIZE + 10 + SELECTED_COLOR_SIZE + 10, yPos,
                                  60, SELECTED_COLOR_SIZE,
                                  hwnd, (HMENU)3000, hInstance, NULL);
    }

    void InitializeColors() {
		paletteColors[0] = RGB(0, 0, 0);
		paletteColors[1] = RGB(255, 255, 255);
		paletteColors[2] = RGB(255, 0, 0);
		paletteColors[3] = RGB(0, 255, 0);
		paletteColors[4] = RGB(0, 0, 255);
		paletteColors[5] = RGB(255, 255, 0);
		paletteColors[6] = RGB(255, 0, 255);
		paletteColors[7] = RGB(0, 255, 255);
		paletteColors[8] = RGB(128, 0, 0);
		paletteColors[9] = RGB(0, 128, 0);
		paletteColors[10] = RGB(0, 0, 128);
		paletteColors[11] = RGB(128, 128, 0);
		paletteColors[12] = RGB(128, 0, 128);
		paletteColors[13] = RGB(0, 128, 128);
		paletteColors[14] = RGB(192, 192, 192);
		paletteColors[15] = RGB(128, 128, 128);
		
		//

        for (int i = 0; i < PALETTE_COLORS; i++) {
            lldDrawRect(hColorBoxes[i], 0, 0, COLOR_BOX_SIZE, COLOR_BOX_SIZE, paletteColors[i]);
        }

        SetCurrentColor();
    }
    
    void redrawBtnImages() {
		redrawBtnImg(bLine, "Lframe"); // здесь странный баг, при использовании однобуквенных имен не  работает отрисовка при запуске
		redrawBtnImg(bRect, "Rframe");
		redrawBtnImg(bEllips, "Eframe");
		redrawBtnImg(bCut, "Xframe");
		redrawBtnImg(bCrop, "Cframe");
		redrawBtnImg(bZoomIn, "+frame");
		redrawBtnImg(bZoomOut, "-frame");
		redrawBtnImg(bSave, "Zframe");
		redrawBtnImg(bOpen, "Oframe");
		redrawBtnImg(bText, "Tframe");
		redrawBtnImg(bCanvas, "Aframe");
		redrawBtnImg(bSelect, "Sframe");
		redrawBtnImg(hFillNoneBtn, "frame");
		redrawBtnImg(hFillSolidBtn, "solid");
	}
	
	void redrawBtnImg(HWND hWnd, string name) {
		if (hWnd) {
			string s = GetAppPath() + "\\i\\" + name + ".bmp";
			lldImage(hWnd, s.c_str(), 5, 5);
		}
	}

	void DrawCanvas(HDC hdc) {
		RECT rect;
		GetClientRect(hCanvas, &rect);
		
		// Создаем буфер для двойной буферизации
		HDC memDC = CreateCompatibleDC(hdc);
		HBITMAP memBitmap = CreateCompatibleBitmap(hdc, rect.right, rect.bottom);
		HGDIOBJ oldBitmap = SelectObject(memDC, memBitmap);
		
		// Заливаем фон
		HBRUSH bgBrush = CreateSolidBrush(RGB(128, 128, 128));
		FillRect(memDC, &rect, bgBrush);
		DeleteObject(bgBrush);
		
		if (loadedBitmap) {
			BITMAP bmp;
			GetObject(loadedBitmap, sizeof(BITMAP), &bmp);
			
			// Используем сохраненные позиции скролла
			int destWidth = (int)(bmp.bmWidth * zoomLevel);
			int destHeight = (int)(bmp.bmHeight * zoomLevel);
			
			HDC srcDC = memoryDC;
			StretchBlt(memDC, -scrollPosX, -scrollPosY, destWidth, destHeight,
					  srcDC, 0, 0, bmp.bmWidth, bmp.bmHeight, SRCCOPY);
			
			// Рисуем границу вокруг изображения
			HPEN borderPen = CreatePen(PS_SOLID, 1, RGB(64, 64, 64));
			HGDIOBJ oldPen = SelectObject(memDC, borderPen);
			HGDIOBJ oldBrush = SelectObject(memDC, GetStockObject(NULL_BRUSH));
			
			Rectangle(memDC, -scrollPosX, -scrollPosY, 
					 -scrollPosX + destWidth, -scrollPosY + destHeight);
			
			
			// Рисуем вставляемый фрагмент (внутренний буфер)
			if (hasClipboard && loadedBitmap && clipBmp && insertSelectionMode) {
				drawPastedFromInternalBuffer(memDC);
			}else
			// Рисуем вставляемый фрагмент (системный буфер)
			if (OpenClipboard(hwnd)) {
				// Проверяем наличие bitmap в буфере
				if (IsClipboardFormatAvailable(CF_BITMAP)) {
					HBITMAP hClipboardBmp = (HBITMAP)GetClipboardData(CF_BITMAP);
					if (hClipboardBmp && insertSelectionMode) {
						drawPastedFromSystemBuffer(memDC, hClipboardBmp);
					}
				}
				CloseClipboard();
			}
			
			// Рисуем выделение
			if (isSelecting || (currentTool == TOOL_SELECTION && (selectionRect.width() > 0 && selectionRect.height() > 0) )) {
				HPEN pen = CreatePen(PS_DOT, 1, RGB(255, 0, 0));
				HGDIOBJ oldPen = SelectObject(memDC, pen);
				HGDIOBJ oldBrush = SelectObject(memDC, GetStockObject(NULL_BRUSH));
				
				Rectangle(memDC, 
						 selectionRect.left - scrollPosX, 
						 selectionRect.top - scrollPosY,
						 selectionRect.right - scrollPosX, 
						 selectionRect.bottom - scrollPosY);
				
				SelectObject(memDC, oldBrush);
				SelectObject(memDC, oldPen);
				DeleteObject(pen);
			}
			
			// Рисуем текст
			if (currentTool == TOOL_TEXT && textControlsVisible) {
				DrawTextOverlay(memDC, scrollPosX, scrollPosY);
			}
			
			
			
			if (currentTool == TOOL_LINE) {
				//DrawLine(drawStart, Point(selectionRect.right, selectionRect.bottom));
				HPEN pen = CreatePen(PS_SOLID, intval(v(iLineW)), currentColor);
				HGDIOBJ oldPen = SelectObject(memDC, pen);
				MoveToEx(memDC, selectionRect.left - scrollPosX, selectionRect.top - scrollPosY, NULL);
				LineTo(memDC, selectionRect.right - scrollPosX, selectionRect.bottom - scrollPosY);
				SelectObject(memDC, oldPen);
				DeleteObject(pen);
			} else if (currentTool == TOOL_RECTANGLE) {
				//DrawRectangle(Rect(drawStart.x, drawStart.y, selectionRect.left, selectionRect.top));
				HPEN pen = CreatePen(PS_SOLID, intval(v(iLineW)), currentColor);
				HGDIOBJ oldPen = SelectObject(memDC, pen);

				if (fillMode == FILL_SOLID) {
					HBRUSH brush = CreateSolidBrush(currentColor);
					HGDIOBJ oldBrush = SelectObject(memDC, brush);
					Rectangle(memDC, selectionRect.left - scrollPosX, selectionRect.top - scrollPosY, selectionRect.right - scrollPosX, selectionRect.bottom - scrollPosY);
					SelectObject(memDC, oldBrush);
					DeleteObject(brush);
				} else {
					HGDIOBJ oldBrush = SelectObject(memDC, GetStockObject(NULL_BRUSH));
					Rectangle(memDC, selectionRect.left - scrollPosX, selectionRect.top - scrollPosY, selectionRect.right - scrollPosX, selectionRect.bottom - scrollPosY);
					SelectObject(memDC, oldBrush);
				}
				SelectObject(memDC, oldPen);
				DeleteObject(pen);
			} else if (currentTool == TOOL_ELLIPSE) {
				HPEN pen = CreatePen(PS_SOLID, intval(v(iLineW)), currentColor);
				HGDIOBJ oldPen = SelectObject(memDC, pen);

				if (fillMode == FILL_SOLID) {
					HBRUSH brush = CreateSolidBrush(currentColor);
					HGDIOBJ oldBrush = SelectObject(memDC, brush);
					Ellipse(memDC, selectionRect.left - scrollPosX, selectionRect.top - scrollPosY, selectionRect.right - scrollPosX, selectionRect.bottom - scrollPosY);
					SelectObject(memDC, oldBrush);
					DeleteObject(brush);
				} else {
					HGDIOBJ oldBrush = SelectObject(memDC, GetStockObject(NULL_BRUSH));
					Ellipse(memDC, selectionRect.left - scrollPosX, selectionRect.top - scrollPosY, selectionRect.right - scrollPosX, selectionRect.bottom - scrollPosY);
					SelectObject(memDC, oldBrush);
				}

				SelectObject(memDC, oldPen);
				DeleteObject(pen);
			}
			
		}
		
		// Копируем из буфера на экран
		BitBlt(hdc, 0, 0, rect.right, rect.bottom, memDC, 0, 0, SRCCOPY);
		
		// Очищаем ресурсы
		SelectObject(memDC, oldBitmap);
		DeleteObject(memBitmap);
		DeleteDC(memDC);
	}
    
    void DrawTextOverlay(HDC hdc, int scrollX, int scrollY) {
        if (fillMode == FILL_SOLID) {
            HBRUSH bgBrush = CreateSolidBrush(RGB(255, 255, 255));
            HPEN borderPen = CreatePen(PS_SOLID, 1, RGB(0, 0, 0));

            HGDIOBJ oldPen = SelectObject(hdc, borderPen);
            HGDIOBJ oldBrush = SelectObject(hdc, bgBrush);

            Rectangle(hdc, textRect.left - scrollX, textRect.top - scrollY,
                     textRect.right - scrollX, textRect.bottom - scrollY);

            SelectObject(hdc, oldBrush);
            SelectObject(hdc, oldPen);

            DeleteObject(bgBrush);
            DeleteObject(borderPen);
        }

        SetTextColor(hdc, currentColor);
        SetBkMode(hdc, TRANSPARENT);

        if (textFont) {
            SelectObject(hdc, textFont);
        }

        RECT textRectDraw;
        textRectDraw.left = textRect.left - scrollX;
        textRectDraw.top = textRect.top - scrollY;
        textRectDraw.right = textRect.right - scrollX;
        textRectDraw.bottom = textRect.bottom - scrollY;

        DrawTextA(hdc, textContent.c_str(), -1, &textRectDraw, DT_WORDBREAK | DT_LEFT);
    }

    void SetCurrentColor() {
        lldDrawRect(hSelectedColor, 0, 0, SELECTED_COLOR_SIZE, SELECTED_COLOR_SIZE, currentColor);
    }

    HWND GetTooltipWindow() {
        static HWND hTooltip = NULL;
        if (!hTooltip) {
            hTooltip = CreateWindowEx(0, TOOLTIPS_CLASS, NULL,
                                     WS_POPUP | TTS_ALWAYSTIP,
                                     CW_USEDEFAULT, CW_USEDEFAULT,
                                     CW_USEDEFAULT, CW_USEDEFAULT,
                                     hwnd, NULL, hInstance, NULL);
            SetWindowPos(hTooltip, HWND_TOPMOST, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE);
        }
        return hTooltip;
    }
    
    bool LoadImageFileW(const wstring& filename) {
		if (loadedBitmap) {
			DeleteObject(loadedBitmap);
			loadedBitmap = NULL;
		}
		
		// Используем LoadImageW для Unicode путей
		loadedBitmap = (HBITMAP)LoadImageW(NULL, filename.c_str(), IMAGE_BITMAP, 
										  0, 0, LR_LOADFROMFILE | LR_CREATEDIBSECTION);
		
		if (loadedBitmap) {
			// Кажется, что след. две инструкции ни на что не влияют
			//BITMAP bmp;
			//GetObject(loadedBitmap, sizeof(BITMAP), &bmp);
			SelectObject(memoryDC, loadedBitmap);
			
			UpdateScrollBars();
			InvalidateRect(hCanvas, NULL, TRUE);
			return true;
		}
		
		return false;
	}


    bool LoadImageFile(const string& filename) {
        if (loadedBitmap) {
            DeleteObject(loadedBitmap);
            loadedBitmap = NULL;
        }
        
        loadedBitmap = (HBITMAP)LoadImageA(NULL, filename.c_str(), IMAGE_BITMAP, 
                                          0, 0, LR_LOADFROMFILE | LR_CREATEDIBSECTION);
        
        if (loadedBitmap) {
            BITMAP bmp;
            GetObject(loadedBitmap, sizeof(BITMAP), &bmp);
            SelectObject(memoryDC, loadedBitmap);
            
            UpdateScrollBars();
            InvalidateRect(hCanvas, NULL, TRUE);
            return true;
        }

        return false;
    }

    bool SaveImageFile(const wstring& filename) {
        if (!loadedBitmap) return false;

        BITMAP bmp;
        GetObject(loadedBitmap, sizeof(BITMAP), &bmp);

        BITMAPFILEHEADER bmfHeader;
        BITMAPINFOHEADER bi;

        bi.biSize = sizeof(BITMAPINFOHEADER);
        bi.biWidth = bmp.bmWidth;
        bi.biHeight = bmp.bmHeight;
        bi.biPlanes = 1;
        bi.biBitCount = 24;
        bi.biCompression = BI_RGB;
        bi.biSizeImage = 0;
        bi.biXPelsPerMeter = 0;
        bi.biYPelsPerMeter = 0;
        bi.biClrUsed = 0;
        bi.biClrImportant = 0;

        DWORD dwBmpSize = ((bmp.bmWidth * bi.biBitCount + 31) / 32) * 4 * bmp.bmHeight;

        HANDLE hDIB = GlobalAlloc(GHND, dwBmpSize);
        char* lpbitmap = (char*)GlobalLock(hDIB);

        GetDIBits(memoryDC, loadedBitmap, 0, (UINT)bmp.bmHeight,
                 lpbitmap, (BITMAPINFO*)&bi, DIB_RGB_COLORS);

        DWORD dwSizeofDIB = dwBmpSize + sizeof(BITMAPFILEHEADER) + sizeof(BITMAPINFOHEADER);

        bmfHeader.bfOffBits = (DWORD)sizeof(BITMAPFILEHEADER) + (DWORD)sizeof(BITMAPINFOHEADER);
        bmfHeader.bfSize = dwSizeofDIB;
        bmfHeader.bfType = 0x4D42;

        HANDLE hFile = CreateFileW(filename.c_str(), GENERIC_WRITE, 0, NULL,
                                 CREATE_ALWAYS, FILE_ATTRIBUTE_NORMAL, NULL);

        if (hFile == INVALID_HANDLE_VALUE) return false;

        DWORD dwBytesWritten = 0;
        WriteFile(hFile, (LPSTR)&bmfHeader, sizeof(BITMAPFILEHEADER), &dwBytesWritten, NULL);
        WriteFile(hFile, (LPSTR)&bi, sizeof(BITMAPINFOHEADER), &dwBytesWritten, NULL);
        WriteFile(hFile, (LPSTR)lpbitmap, dwBmpSize, &dwBytesWritten, NULL);

        GlobalUnlock(hDIB);
        GlobalFree(hDIB);
        CloseHandle(hFile);
        
        // Обновляем заголовок окна
		wstring title = L"BMP Editor - " + filename;
		if (fileIsOpen) {
			title = L"BMP Editor - " + file;
		}
		SetWindowTextW(hwnd, title.c_str());
		
		if (pngIsSupported) {
			exec(tmpFile, file);
		}

        return true;
    }

	void UpdateScrollBars() {
		if (!loadedBitmap) {
			// Скрываем скроллбары если нет изображения
			ShowWindow(hScrollV, SW_HIDE);
			ShowWindow(hScrollH, SW_HIDE);
			return;
		}
		
		BITMAP bmp;
		GetObject(loadedBitmap, sizeof(BITMAP), &bmp);
		
		RECT clientRect;
		GetClientRect(hCanvas, &clientRect);
		
		int canvasWidth = clientRect.right;
		int canvasHeight = clientRect.bottom;
		
		int imageWidth = (int)(bmp.bmWidth * zoomLevel);
		int imageHeight = (int)(bmp.bmHeight * zoomLevel);
		
		// Показываем или скрываем скроллбары в зависимости от необходимости
		bool needVScroll = imageHeight > canvasHeight;
		bool needHScroll = imageWidth > canvasWidth;
		
		ShowWindow(hScrollV, needVScroll ? SW_SHOW : SW_HIDE);
		ShowWindow(hScrollH, needHScroll ? SW_SHOW : SW_HIDE);
		
		SCROLLINFO si;
		si.cbSize = sizeof(SCROLLINFO);
		si.fMask = SIF_ALL;
		
		// Вертикальный скроллбар
		if (needVScroll) {
			si.nMin = 0;
			si.nMax = imageHeight - 1;
			si.nPage = canvasHeight;
			si.nPos = scrollPosY;
			SetScrollInfo(hScrollV, SB_CTL, &si, TRUE);
			repaint();
		}
		
		// Горизонтальный скроллбар
		if (needHScroll) {
			si.nMin = 0;
			si.nMax = imageWidth - 1;
			si.nPage = canvasWidth;
			si.nPos = scrollPosX;
			SetScrollInfo(hScrollH, SB_CTL, &si, TRUE);
			repaint();
		}
	}

	void HandleVScroll(int scrollCode, int pos) {
		if (!loadedBitmap) return;
		
		BITMAP bmp;
		GetObject(loadedBitmap, sizeof(BITMAP), &bmp);
		
		RECT clientRect;
		GetClientRect(hCanvas, &clientRect);
		
		int imageHeight = (int)(bmp.bmHeight * zoomLevel);
		int canvasHeight = clientRect.bottom;
		int maxScroll = max(0, imageHeight - canvasHeight);
		
		int newPos = scrollPosY;
		
		switch (scrollCode) {
			case SB_LINEUP:        newPos -= 10; break;
			case SB_LINEDOWN:      newPos += 10; break;
			case SB_PAGEUP:        newPos -= canvasHeight; break;
			case SB_PAGEDOWN:      newPos += canvasHeight; break;
			case SB_THUMBTRACK:    newPos = pos; break;
			case SB_THUMBPOSITION: newPos = pos; break;
			case SB_TOP:           newPos = 0; break;
			case SB_BOTTOM:        newPos = maxScroll; break;
		}
		
		// Ограничиваем позицию
		newPos = max(0, min(newPos, maxScroll));
		
		if (newPos != scrollPosY) {
			scrollPosY = newPos;
			SetScrollPos(hScrollV, SB_CTL, scrollPosY, TRUE);
			InvalidateRect(hCanvas, NULL, TRUE);
		}
		UpdateScrollBars();
	}

	void HandleHScroll(int scrollCode, int pos) {
		if (!loadedBitmap) return;
		
		BITMAP bmp;
		GetObject(loadedBitmap, sizeof(BITMAP), &bmp);
		
		RECT clientRect;
		GetClientRect(hCanvas, &clientRect);
		
		int imageWidth = (int)(bmp.bmWidth * zoomLevel);
		int canvasWidth = clientRect.right;
		int maxScroll = max(0, imageWidth - canvasWidth);
		
		int newPos = scrollPosX;
		
		switch (scrollCode) {
			case SB_LINELEFT:      newPos -= 10; break;
			case SB_LINERIGHT:     newPos += 10; break;
			case SB_PAGELEFT:      newPos -= canvasWidth; break;
			case SB_PAGERIGHT:     newPos += canvasWidth; break;
			case SB_THUMBTRACK:    newPos = pos; break;
			case SB_THUMBPOSITION: newPos = pos; break;
			case SB_LEFT:          newPos = 0; break;
			case SB_RIGHT:         newPos = maxScroll; break;
		}
		
		// Ограничиваем позицию
		newPos = max(0, min(newPos, maxScroll));
		
		if (newPos != scrollPosX) {
			scrollPosX = newPos;
			SetScrollPos(hScrollH, SB_CTL, scrollPosX, TRUE);
			InvalidateRect(hCanvas, NULL, TRUE);
		}
		UpdateScrollBars();
	}

    
    
    void OnColorSelect(int x, int y, int id) {
		if (id == 3000) {
            CHOOSECOLORA cc;
            memset(&cc, 0, sizeof(CHOOSECOLORA));
            static COLORREF customColors[16] = {0};
            
            cc.lStructSize = sizeof(CHOOSECOLORA);
            cc.hwndOwner = hwnd;
            cc.lpCustColors = customColors;
            cc.Flags = CC_FULLOPEN | CC_RGBINIT;
            cc.rgbResult = currentColor;
            
            if (ChooseColorA(&cc)) {
                currentColor = cc.rgbResult;
                SetCurrentColor();
            }
            return;
        }
		
		actualizeXY(x, y);
		x += DEV_X_PALETTE_OFFSET;
		
		Rect r;
		int yPos = zGetPaletteY() + 3;
		for (int i = 0; i < PALETTE_COLORS; i++) {
			r.left = 150 + i * COLOR_BOX_SIZE;
			r.top = yPos;
			r.right = r.left + COLOR_BOX_SIZE;
			r.bottom = r.top + COLOR_BOX_SIZE;
            if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
				currentColor = paletteColors[i];
				SetCurrentColor();
			}
        }
    }
    
    void OnCreate(LPARAM zero)
    {
		ShowWindow(hwnd, SW_MAXIMIZE);
		ShowTextControls();
		HideTextControls();
		v(hTextX, "0");
		v(hTextY, "0");
		v(hTextW, "0");
		v(hTextH, "0");
		//redrawBtnImages();
		ShowSelectionControls();
		LoadSettings();
		ApplyFont();
		IsPngSupport();
	}
	
	
	// В LoadSettings загружаем пиксельное смещение
	void LoadSettings() {
		std::string ini = GetAppPath() + "\\serv.ini";
		std::ifstream file(ini.c_str());
		if (!file.is_open()) {
			ini = GetAppPath() + "\\conf.ini";
			file.open(ini.c_str());
			if (!file.is_open()) return;
		}
		
		std::string line;
		while (std::getline(file, line)) {
			size_t pos = line.find('=');
			if (pos != std::string::npos) {
				std::string key = line.substr(0, pos);
				std::string value = line.substr(pos + 1);
				
				if (key == "fontName") {
					strncpy(g_settings.font.lfFaceName, value.c_str(), LF_FACESIZE);
				} else if (key == "fontSize") {
					g_settings.font.lfHeight = intval(value) + 5;
				}
			}
		}
		file.close();
		// Установка значений по умолчанию если не заданы
		if (g_settings.font.lfHeight == 0) {
			g_settings.font.lfHeight = 14;
			strcpy(g_settings.font.lfFaceName, "Calibri");
		}
		
		/*if (g_settings.lineSpacing == 0) {
			g_settings.lineSpacing = (int)floor(abs(g_settings.font.lfHeight) * 1.5);
		}*/
		
		g_settings.font.lfCharSet = RUSSIAN_CHARSET;
	}

	
	// В SaveSettings сохраняем также пиксельное смещение *
	void SaveSettings() {
		//MessageBoxA(0, "Cap", "Bit", 0);
		std::string ini(GetAppPath() +  "\\serv.ini");
		std::ofstream file(ini.c_str());
		if (!file.is_open()) return;
		file << "fontName=" << g_settings.font.lfFaceName << "\n";
		file << "fontSize=" << abs(g_settings.font.lfHeight + 5) << "\n";
		file.close();
	}

	
	void ApplyFont() {
		// Обновление шрифта
		if (g_hFont) DeleteObject(g_hFont); // TODO stop here
		g_hFont = CreateFontIndirect(&g_settings.font);
		SelectFont(true);		
		
		// Перерисовка окна
		//repaint()
		//InvalidateRect(hwnd, NULL, TRUE);
	}
    
    void onFilePath(LPARAM path)
    {
		wstring* filePath = (wstring*)path;
		if (filePath) {
			OpenImageFile(*filePath);
			delete filePath;
		}
		OnCreate(path);
	}
    
    void onInput(LPARAM lParam){
		HWND hEdit = (HWND)lParam;
		if (hEdit == GetTextX() || 
			hEdit == GetTextY() || 
			hEdit == GetTextW() || 
			hEdit == GetTextH()
		) {
			if (currentTool == TOOL_TEXT) {
				UpdateTextFromControls();
			} else if (currentTool == TOOL_CANVAS) {
				updateCanvasSizeFromControls();
			} else if (insertSelectionMode) {
				updateInsertXYFromControls();
			}
		}
	}
    
    int onWM_COMMAND(WPARAM wParam, LPARAM lParam) {
		//status(wParam, lParam);
		// Обработка изменений в текстовых полях
		if (HIWORD(wParam) == EN_CHANGE) {
			if (HIWORD(wParam) != EN_SETFOCUS && HIWORD(wParam) != EN_KILLFOCUS) {
				onInput(lParam);
				return 0;
			}
			// Обработка фокуса
			if (HIWORD(wParam) == EN_SETFOCUS) {
				HWND hEdit = (HWND)lParam;
				if (hEdit == GetTextX() || 
					hEdit == GetTextY() || 
					hEdit == GetTextW() || 
					hEdit == GetTextH()
				) {
					SetFocusedEdit(hEdit);
				}
			}
			else if (HIWORD(wParam) == EN_KILLFOCUS) {
				ClearFocusedEdit();
				UpdateTextFromControls();
			}
			
			if (LOWORD(wParam) >= 4001 && LOWORD(wParam) <= 4005) {
				UpdateTextFromControls();
				return 0;
			}
		} // end EN_CHANGE
		// Обработка получения фокуса полями ввода
		if (HIWORD(wParam) == EN_SETFOCUS) {
			HWND hEdit = (HWND)lParam;
			// Проверяем, что это наши поля ввода текста
			if (hEdit == GetTextX() || 
				hEdit == GetTextY() || 
				hEdit == GetTextW() || 
				hEdit == GetTextH()
			) {
				SetFocusedEdit(hEdit);
			}
		}
		// Обработка потери фокуса
		else if (HIWORD(wParam) == EN_KILLFOCUS) {
			ClearFocusedEdit();
			// Обновляем текст при потере фокуса
			UpdateTextFromControls();
		}
		
		if (HIWORD(wParam) == 0) {
			if (HandleChildCommand(LOWORD(wParam))) {
				return 0;
			}
		}
		return 0;
	}
    

    void DrawLine(Point start, Point end) {
        if (!loadedBitmap) return;
        
        addHistory();
        
        HPEN pen = CreatePen(PS_SOLID, intval(v(iLineW)), currentColor);
        HGDIOBJ oldPen = SelectObject(memoryDC, pen);
        MoveToEx(memoryDC, (int)(start.x/zoomLevel), (int)(start.y/zoomLevel), NULL);
        LineTo(memoryDC, (int)(end.x/zoomLevel), (int)(end.y/zoomLevel));
        SelectObject(memoryDC, oldPen);
        DeleteObject(pen);
        
        InvalidateRect(hCanvas, NULL, TRUE);
        UpdateWindow(hCanvas);
		
    }
    
    void DrawRectangle(Rect rect) {
        if (!loadedBitmap) return;
        
        addHistory();

        HPEN pen = CreatePen(PS_SOLID, intval(v(iLineW)), currentColor);
        HGDIOBJ oldPen = SelectObject(memoryDC, pen);

        if (fillMode == FILL_SOLID) {
            HBRUSH brush = CreateSolidBrush(currentColor);
            HGDIOBJ oldBrush = SelectObject(memoryDC, brush);
            Rectangle(memoryDC, (int)(rect.left/zoomLevel), (int)(rect.top/zoomLevel), (int)(rect.right/zoomLevel), (int)(rect.bottom/zoomLevel));
            SelectObject(memoryDC, oldBrush);
            DeleteObject(brush);
        } else {
            HGDIOBJ oldBrush = SelectObject(memoryDC, GetStockObject(NULL_BRUSH));
            Rectangle(memoryDC, (int)(rect.left/zoomLevel), (int)(rect.top/zoomLevel), (int)(rect.right/zoomLevel), (int)(rect.bottom/zoomLevel));
            SelectObject(memoryDC, oldBrush);
        }

        SelectObject(memoryDC, oldPen);
        DeleteObject(pen);

        InvalidateRect(hCanvas, NULL, TRUE);
    }
    
    void addHistory(){
		if (!loadedBitmap) {
			return;
		}
		if (historyI > historySz - 1) {
			for (int i = 0; i < historySz; i++) {
				if (i == 0) {
					DeleteDC(history[i]);
					continue;
				}
				history[i - 1] = history[i];
			}
			historyI = historySz - 1;
		}
		
		BITMAP bmp;
		GetObject(loadedBitmap, sizeof(BITMAP), &bmp);
		SelectObject(memoryDC, loadedBitmap);
		
		HDC memDC = CreateCompatibleDC(memoryDC);
		// вот здесь оказалось очень важно создавать битмап из memoryDC а не memDC
		HBITMAP memBitmap = CreateCompatibleBitmap(memoryDC, bmp.bmWidth, bmp.bmHeight);
		// Без этого ещё хуже, даже монохрома нет (а монохром был потому что memDC выше был)
		HGDIOBJ oldBitmap = SelectObject(memDC, memBitmap);
		HDC srcDC = memoryDC;
		BitBlt(memDC, 0, 0, bmp.bmWidth, bmp.bmHeight, srcDC, 0, 0, SRCCOPY);
		
		
		history[historyI] = memDC;
		historyI++;
		if (historyC < historyI) {
			historyC = historyI;
		}
		
		// Обновляем заголовок окна
		if (fileIsOpen) {
			wstring title = L"BMP Editor - " + file + L" *";
			SetWindowTextW(hwnd, title.c_str());
		}
	}
	
	void undoHistory(){
		if (!loadedBitmap) {
			return;
		}
		addHistory();
		historyI -= 2;
		if (historyI < 0) {
			historyI = 0;
			return;
		}
		memoryDC = history[historyI];
		selectionRect.left = selectionRect.top = selectionRect.right = selectionRect.bottom = 0;
		InvalidateRect(hCanvas, NULL, TRUE);
		repaint();
	}
	
	void redoHistory(){
		if (!loadedBitmap) {
			return;
		}
		historyI++;
		
		if (historyI > historyC - 1) {
			historyI = historyC - 1;
		}
		
		if (historyI > historySz - 1) {
			historyI = historySz - 1;
		}
		memoryDC = history[historyI];
		selectionRect.left = selectionRect.top = selectionRect.right = selectionRect.bottom = 0;
		InvalidateRect(hCanvas, NULL, TRUE);
		repaint();
	}

    void DrawEllipse(Rect rect) {
        if (!loadedBitmap) return;
        
        addHistory();

        HPEN pen = CreatePen(PS_SOLID, intval(v(iLineW)), currentColor);
        HGDIOBJ oldPen = SelectObject(memoryDC, pen);

        if (fillMode == FILL_SOLID) {
            HBRUSH brush = CreateSolidBrush(currentColor);
            HGDIOBJ oldBrush = SelectObject(memoryDC, brush);
            Ellipse(memoryDC, (int)(rect.left/zoomLevel), (int)(rect.top/zoomLevel), (int)(rect.right/zoomLevel), (int)(rect.bottom/zoomLevel));
            SelectObject(memoryDC, oldBrush);
            DeleteObject(brush);
        } else {
            HGDIOBJ oldBrush = SelectObject(memoryDC, GetStockObject(NULL_BRUSH));
            Ellipse(memoryDC, (int)(rect.left/zoomLevel), (int)(rect.top/zoomLevel), (int)(rect.right/zoomLevel), (int)(rect.bottom/zoomLevel));
            SelectObject(memoryDC, oldBrush);
        }

        SelectObject(memoryDC, oldPen);
        DeleteObject(pen);

        InvalidateRect(hCanvas, NULL, TRUE);
    }

    void DrawTextOnImage() {
        if (!loadedBitmap || textContent.empty()) return;

        SetBkMode(memoryDC, TRANSPARENT);
        SetTextColor(memoryDC, currentColor);

        if (textFont) {
            SelectObject(memoryDC, textFont);
        }

        RECT textRectDraw = {textRect.left, textRect.top, textRect.right, textRect.bottom};

        if (fillMode == FILL_SOLID) { // if (fillMode == FILL_SOLID) {
            HBRUSH bgBrush = CreateSolidBrush(RGB(255, 255, 255));
            FillRect(memoryDC, &textRectDraw, bgBrush);
            DeleteObject(bgBrush);

            HPEN borderPen = CreatePen(PS_SOLID, 1, RGB(0, 0, 0));
            HGDIOBJ oldPen = SelectObject(memoryDC, borderPen);
            HGDIOBJ oldBrush = SelectObject(memoryDC, GetStockObject(NULL_BRUSH));
            Rectangle(memoryDC, textRect.left, textRect.top, textRect.right, textRect.bottom);
            SelectObject(memoryDC, oldBrush);
            SelectObject(memoryDC, oldPen);
            DeleteObject(borderPen);
        }

        DrawTextA(memoryDC, textContent.c_str(), -1, &textRectDraw, DT_WORDBREAK | DT_LEFT);
        InvalidateRect(hCanvas, NULL, TRUE);
    }

	
	// new 2025-08-26
	void UpdateTextFromControls() {
		if (!textControlsVisible) return;

		char buffer[256];
		
		// Обновляем X
		if (GetWindowTextA(hTextX, buffer, 256) > 0) {
			textRect.left = atoi(buffer);
		}
		
		// Обновляем Y
		if (GetWindowTextA(hTextY, buffer, 256) > 0) {
			textRect.top = atoi(buffer);
		}
		
		// Обновляем Width
		if (GetWindowTextA(hTextW, buffer, 256) > 0) {
			int width = atoi(buffer);
			textRect.right = textRect.left + max(1, width); // Минимальная ширина 1
		}
		
		// Обновляем Height
		if (GetWindowTextA(hTextH, buffer, 256) > 0) {
			int height = atoi(buffer);
			textRect.bottom = textRect.top + max(1, height); // Минимальная высота 1
		}
		
		// Обновляем текст
		if (GetWindowTextA(hTextInput, buffer, 256) > 0) {
			textContent = buffer;
		}
		
		// Немедленное обновление
		InvalidateRect(hCanvas, NULL, TRUE);
		
		// Принудительная перерисовка
		HDC canvasDC = GetDC(hCanvas);
		DrawCanvas(canvasDC);
		ReleaseDC(hCanvas, canvasDC);
	}
    
    void UpdateControlsFromSelection(int actualX, int actualY, int w, int h)
    {
		if (selectionMode) {
			v(hTextX, strval(actualX));
			v(hTextY, strval(actualY));
			v(hTextW, strval(w));
			v(hTextH, strval(h));
		}
	}

    void OnToolbarCommand(int id) {
        int toolId = id - 1000;
        if (toolId >= 0 && toolId < 12) {
			if (toolId != TOOL_CROP && toolId != TOOL_CUT) {
				selectionRect = Rect();
			}
            if (currentTool == TOOL_TEXT && toolId != TOOL_TEXT) {
                DrawTextOnImage();
                HideTextControls();
            }
			storedTool = (Tool)currentTool;
            currentTool = (Tool)toolId;
            
            if (currentTool != TOOL_CUT) {
				offInsertSelectionMode();
			}
			
			if (currentTool != TOOL_SELECTION) {
				offSelectionMode();
			}

            if (currentTool == TOOL_ZOOM_IN) ZoomIn();
            else if (currentTool == TOOL_ZOOM_OUT) ZoomOut();
            else if (currentTool == TOOL_OPEN) OpenImageFile();
            else if (currentTool == TOOL_SAVE) SaveImageFileDialog();
            else if (currentTool == TOOL_TEXT) {
				ShowTextControls();
				fillMode = FILL_SOLID;
				UpdateTextFromControls();
			}else if (currentTool == TOOL_CROP) CropImage();
            else if (currentTool == TOOL_CUT) CutImage();
            else if (currentTool == TOOL_CANVAS) ShowCanvasControls();
            else if (currentTool == TOOL_SELECTION) ShowSelectionControls();
            else HideTextControls();
        }
        else if (id == 5000) {
            fillMode = FILL_NONE;
            UpdateTextFromControls();
        }
        else if (id == 5001) {
            fillMode = FILL_SOLID;
            UpdateTextFromControls();
        }
        InvalidateRect(hCanvas, NULL, TRUE);
        SetFocus(hwnd);
    }

	void ShowCanvasControls()
	{
		skipCanvasSizeUpd = true;
		if (NULL == hTextX) {
			ShowTextControls();
		}
		v(hTextW, prop(loadedBitmap, "width"));
		v(hTextH, prop(loadedBitmap, "height"));
		v(hTextW, prop(loadedBitmap, "width"));
		v(hTextH, prop(loadedBitmap, "height"));
		textControlsVisible = true;
		HideTextControls();
		v(hTextW, prop(loadedBitmap, "width"));
		v(hTextH, prop(loadedBitmap, "height"));
		v(hTextControlsTitle, "Canvas size");
		ShowWindow(hTextWLabel, SW_SHOW);
		ShowWindow(hTextHLabel, SW_SHOW);
		ShowWindow(hTextW, SW_SHOW);
		ShowWindow(hTextH, SW_SHOW);
		ShowWindow(hTextControlsTitle, SW_SHOW);
		skipCanvasSizeUpd = false;
	}
	
	void ShowSelectionControls()
	{
		selectionMode = true;
		skipCanvasSizeUpd = true;
		if (NULL == hTextX) {
			ShowTextControls();
		}
		v(hTextW, strval(selectionRect.width()));
		v(hTextH, strval(selectionRect.height()));
		v(hTextX, strval(selectionRect.left));
		v(hTextY, strval(selectionRect.top));
		textControlsVisible = true;
		HideTextControls();
		v(hTextControlsTitle, "Selection");
		ShowWindow(hTextWLabel, SW_SHOW);
		ShowWindow(hTextHLabel, SW_SHOW);
		ShowWindow(hTextW, SW_SHOW);
		ShowWindow(hTextH, SW_SHOW);
		ShowWindow(hTextXLabel, SW_SHOW);
		ShowWindow(hTextYLabel, SW_SHOW);
		ShowWindow(hTextX, SW_SHOW);
		ShowWindow(hTextY, SW_SHOW);
		ShowWindow(hTextControlsTitle, SW_SHOW);
		skipCanvasSizeUpd = false;
	}
	
	
	void showInsertSelectionTools()
	{
		if (NULL == hTextX) {
			ShowTextControls();
		}
		char chP[100];
		sprintf(chP, "%d", insertSelectionX);
		string sP = chP;
		v(hTextX, sP);
		sprintf(chP, "%d", insertSelectionY);
		sP = chP;
		v(hTextY, sP);
		v(hTextW, prop(loadedBitmap, "width"));
		v(hTextH, prop(loadedBitmap, "height"));
		
		textControlsVisible = true;
		HideTextControls();
		
		
		
		ShowWindow(hTextXLabel, SW_SHOW);
		ShowWindow(hTextYLabel, SW_SHOW);
		ShowWindow(hTextX, SW_SHOW);
		ShowWindow(hTextY, SW_SHOW);
		ShowWindow(hTextControlsTitle, SW_SHOW);
		
		
		v(hTextControlsTitle, "Selection position");
	}

	// 4. Исправляем Crop
	void CropImage() {
		if (!loadedBitmap || selectionRect.width() <= 0 || selectionRect.height() <= 0) return;
		
		HDC hdc = GetDC(hwnd);
		HBITMAP cropped = CreateCompatibleBitmap(hdc, (int)(selectionRect.width()/zoomLevel), (int)(selectionRect.height()/zoomLevel));
		HDC croppedDC = CreateCompatibleDC(hdc);
		SelectObject(croppedDC, cropped);
		//SelectObject(memoryDC, loadedBitmap);
		
		// Копируем именно выделенную область
		BitBlt(croppedDC, 0, 0, (int)(selectionRect.width()/zoomLevel), (int)(selectionRect.height()/zoomLevel),
			  memoryDC, (int)(selectionRect.left/zoomLevel), (int)(selectionRect.top/zoomLevel), SRCCOPY);
		
		DeleteObject(loadedBitmap);
		loadedBitmap = cropped;
		DeleteDC(memoryDC);
		memoryDC = croppedDC;
		//SelectObject(memoryDC, loadedBitmap);
		
		// DeleteDC(croppedDC);
		ReleaseDC(hwnd, hdc);
		
		selectionRect = Rect();
		UpdateScrollBars();
		InvalidateRect(hCanvas, NULL, TRUE);
		
		HDC canvasDC = GetDC(this->GetCanvas());
		this->DrawCanvas(canvasDC);
		ReleaseDC(this->GetCanvas(), canvasDC);
	}
	
	void CutImage() {
		zCopyFragment();
	}
	
	void copyFragment() {
		zCopyFragment(false);
	}
	
	void zCopyFragment(bool cutAction = true) {
		if (!loadedBitmap || selectionRect.width() <= 0 || selectionRect.height() <= 0) return;

		// Очищаем предыдущие ресурсы буфера
		ClearClipboardResources();

		HDC hdc = GetDC(hwnd);
		
		// Создаем новые ресурсы для буфера
		clipBmp = CreateCompatibleBitmap(hdc, (int)(selectionRect.width()/zoomLevel), (int)(selectionRect.height()/zoomLevel));
		if (!clipBmp) {
			ReleaseDC(hwnd, hdc);
			alert("!clipBmp");
			return;
		}
		
		clipDC = CreateCompatibleDC(hdc);
		if (!clipDC) {
			DeleteObject(clipBmp);
			clipBmp = NULL;
			ReleaseDC(hwnd, hdc);
			alert("!clipDC");
			return;
		}

		HBITMAP hOldBmp = (HBITMAP)SelectObject(clipDC, clipBmp);

		// Копируем выделенную область в буфер
		if (!BitBlt(clipDC, 0, 0, (int)(selectionRect.width()/zoomLevel), (int)(selectionRect.height()/zoomLevel),
				   memoryDC, (int)(selectionRect.left/zoomLevel), (int)(selectionRect.top/zoomLevel), SRCCOPY)) {
			// Ошибка копирования
			SelectObject(clipDC, hOldBmp);
			DeleteDC(clipDC);
			DeleteObject(clipBmp);
			clipDC = NULL;
			clipBmp = NULL;
			ReleaseDC(hwnd, hdc);
			return;
		}

		// Сохраняем размеры
		clipboardWidth = (int)(selectionRect.width()/zoomLevel);
		clipboardHeight = (int)(selectionRect.height()/zoomLevel);

		// Копируем в системный буфер обмена
		CopyToSystemClipboard(); // TODO zoom

		// Очищаем область в основном изображении
		if (cutAction) {
			HBRUSH whiteBrush = CreateSolidBrush(RGB(255, 255, 255));
			RECT clearRect = {(int)(selectionRect.left/zoomLevel), (int)(selectionRect.top/zoomLevel), (int)(selectionRect.right/zoomLevel), (int)(selectionRect.bottom/zoomLevel)};
			FillRect(memoryDC, &clearRect, whiteBrush);

			// Очищаем ресурсы
			DeleteObject(whiteBrush);
		}
		
		// Очищаем ресурсы
		//SelectObject(clipDC, hOldBmp);
		ReleaseDC(hwnd, hdc);

		hasClipboard = true;
		if (cutAction) {
			selectionRect = Rect();
		}
		InvalidateRect(hCanvas, NULL, TRUE);
		insertSelectionMode = false;
		insertSelectionX = selectionRect.left - 10;
		insertSelectionY = selectionRect.top - 10;
		insertSelectionX = insertSelectionX < 0 ? 0 : insertSelectionX;
		insertSelectionY = insertSelectionY < 0 ? 0 : insertSelectionY;

		repaint();
	}

	// Функция очистки ресурсов буфера
	void ClearClipboardResources() {
		if (clipDC) {
			DeleteDC(clipDC);
			clipDC = NULL;
		}
		if (clipBmp) {
			DeleteObject(clipBmp);
			clipBmp = NULL;
		}
		hasClipboard = false;
		clipboardWidth = 0;
		clipboardHeight = 0;
	}
	
	

	
	bool IsClipboardAvailable() {
		if (!OpenClipboard(hwnd)) return false;
		bool available = IsClipboardFormatAvailable(CF_BITMAP) || IsClipboardFormatAvailable(CF_DIB);
		CloseClipboard();
		return available;
	}
    
    void repaint(){
		HDC canvasDC = GetDC(GetCanvas());
		DrawCanvas(canvasDC);
		ReleaseDC(GetCanvas(), canvasDC);
	}
    
    void actualizeXY(int &x, int &y){
		// TODO Учитываем скролл
		
		// Учитываем координаты окна
		RECT r;
		GetWindowRect(hwnd, &r);
		
		x = x + r.left + scrollPosX;
		y = y + DEV_Y_OFFSET + r.top + scrollPosY;
		status((WPARAM)x, (LPARAM)y);
	}
	
	void zOnMouseDown(LPARAM lParam){
		int x = LOWORD(lParam);
		int y = HIWORD(lParam);

		//RECT canvasRect;
		//GetClientRect(g_editor->GetCanvas(), &canvasRect);
		POINT pt = {x, y};
		ScreenToClient(GetCanvas(), &pt);
		//if (PtInRect(&canvasRect, pt)) {
		
		OnCanvasMouseDown(pt.x, pt.y);
		OnColorSelect(pt.x, pt.y, 0);
		//redrawBtnImages();
	}

    void OnCanvasMouseDown(int x, int y) {
		actualizeXY(x, y);
		int actualX = x;
		int actualY = y;
		bool skipUpdateControls = false;
		if(insertSelectionMode) {
			if (
					x >= selectionRect.left
					&& x <= selectionRect.left + selectionRect.right
					&& y >= selectionRect.top
					&& y <= selectionRect.top + selectionRect.bottom
			) {
				startDragX = actualX;
				startDragY = actualY;
				startDragSelRX = selectionRect.left;
				startDragSelRY = selectionRect.top;
				insertSelectionX =  startDragSelRX + (actualX - startDragX);
				insertSelectionY =  startDragSelRY + (actualY - startDragY);
				skipUpdateControls = true;
				isStartDrag = true;
			} else {
				offInsertSelectionMode();
			}
		}
		
		if(currentTool == TOOL_TEXT) {
			if (
					x >= textRect.left
					&& x <= textRect.left + textRect.right
					&& y >= textRect.top
					&& y <= textRect.top + textRect.bottom
			) {
				startDragX = actualX;
				startDragY = actualY;
				startDragSelRX = textRect.left;
				startDragSelRY = textRect.top;
				insertSelectionX =  startDragSelRX + (actualX - startDragX);
				insertSelectionY =  startDragSelRY + (actualY - startDragY);
				skipUpdateControls = true;
				isStartDrag = true;
			} else {
				isStartDrag = false;
			}
		}
		
		if (currentTool == TOOL_SELECTION) {
			isSelecting = true;
			dragStart = Point(actualX, actualY);
			selectionRect = Rect(actualX, actualY, actualX, actualY);
			if(skipUpdateControls) {
				UpdateControlsFromSelection(insertSelectionX, insertSelectionY, 0, 0);
			} else {
				UpdateControlsFromSelection(actualX, actualY, 0, 0);
			}
			
			if (OpenClipboard(hwnd)) {
				// Проверяем наличие bitmap в буфере
				if (IsClipboardFormatAvailable(CF_BITMAP) && !insertSelectionMode) {
					ClearClipboardResources();
				}
				CloseClipboard();
			}
			
		} else if (currentTool == TOOL_LINE || currentTool == TOOL_RECTANGLE || currentTool == TOOL_ELLIPSE) {
			isDrawing = true;
			selectionRect = Rect(actualX, actualY, actualX, actualY);
			drawStart = Point(actualX, actualY);
			ClearClipboardResources();
		}
		
		
		InvalidateRect(hCanvas, NULL, TRUE);
	}
	
	void offInsertSelectionMode() {
		if (!insertSelectionMode) {
			return;
		}
		insertSelectionMode = false;

		if (hasClipboard && loadedBitmap && clipBmp) { 
			pasteFromInternalBuffer(memoryDC);
		} else if (OpenClipboard(hwnd)) {
			// Проверяем наличие bitmap в буфере
			if (IsClipboardFormatAvailable(CF_BITMAP)) {
				HBITMAP hClipboardBmp = (HBITMAP)GetClipboardData(CF_BITMAP);
				if (hClipboardBmp) {
					//pasteFromSystemClipboard(hClipboardBmp); 
					pasteFromSystemClipboard(hClipboardBmp);
					insertSelectionX = 0;
					insertSelectionY = 0;
					repaint();
				}
			}
			CloseClipboard();
		}

		insertSelectionX = selectionRect.left = 0;
		insertSelectionY = selectionRect.top = 0;
		selectionRect.right = 0;
		selectionRect.bottom = 0;
		//currentTool = TOOL_SELECTION;
	}
	
	void offSelectionMode(){
		
		if (!selectionMode) {
			return;
		}
		selectionMode = false;


		textControlsVisible = true;
		HideTextControls();
		//currentTool = TOOL_SELECTION;
		if (OpenClipboard(hwnd)) {
			// Проверяем наличие bitmap в буфере
			if (IsClipboardFormatAvailable(CF_BITMAP)) {
				ClearClipboardResources();
			}
			CloseClipboard();
		}
	}
		
	void OnCanvasMouseMove(int x, int y) {
		actualizeXY(x, y);
		int actualX = x;
		int actualY = y;
		
		inputFocused = false;
		
		if (isSelecting && currentTool == TOOL_SELECTION) {
			selectionRect.right = actualX;
			selectionRect.bottom = actualY;
			
			if (insertSelectionMode && isStartDrag) {
				insertSelectionX =  startDragSelRX + (actualX - startDragX);
				insertSelectionY =  startDragSelRY + (actualY - startDragY);
			}
			
			InvalidateRect(hCanvas, NULL, TRUE);
			HDC canvasDC = GetDC(this->GetCanvas());
			this->DrawCanvas(canvasDC);
			ReleaseDC(this->GetCanvas(), canvasDC);
			UpdateControlsFromSelection(selectionRect.left, selectionRect.top, selectionRect.width(), selectionRect.height());
		} else if (isDrawing) {
			// Для предварительного просмотра
			selectionRect.right = actualX;
			selectionRect.bottom = actualY;
			
			InvalidateRect(hCanvas, NULL, TRUE);
			HDC canvasDC = GetDC(this->GetCanvas());
			this->DrawCanvas(canvasDC);
			ReleaseDC(this->GetCanvas(), canvasDC);
		}
		
		if (currentTool == TOOL_TEXT) {
			if (isStartDrag) {
				int dx = textRect.left;
				int tX =  startDragSelRX + (actualX - startDragX);
				dx += tX;
				//textRect.right += dx;

				int dy = textRect.top;
				int tY  =  startDragSelRY + (actualY - startDragY);
				dy += tY;
				//textRect.bottom += dy;
				
				v(hTextX, strval(tX));
				v(hTextY, strval(tY));
				//v(hTextW, strval(textRect.right - textRect.left));
				//v(hTextH, strval(textRect.bottom - textRect.top));
			}
		}
	}
    
    void OnCanvasMouseUp(int x, int y) {
		actualizeXY(x, y);
		int actualX = x;
		int actualY = y;
		
		if (isSelecting && currentTool == TOOL_SELECTION) {
			isSelecting = false;
			selectionRect.right = actualX;
			selectionRect.bottom = actualY;
			UpdateControlsFromSelection(selectionRect.left, selectionRect.top, selectionRect.width(), selectionRect.height());
		} else if (isDrawing) {
			isDrawing = false;
			if (currentTool == TOOL_LINE) {
				DrawLine(drawStart, Point(actualX, actualY));
			} else if (currentTool == TOOL_RECTANGLE) {
				DrawRectangle(Rect(drawStart.x, drawStart.y, actualX, actualY));
			} else if (currentTool == TOOL_ELLIPSE) {
				DrawEllipse(Rect(drawStart.x, drawStart.y, actualX, actualY));
			} else if (insertSelectionMode && isStartDrag) {
				insertSelectionX = startDragSelRX + (actualX - startDragX);
				insertSelectionY = startDragSelRY + (actualY - startDragY);
				isStartDrag = false;
			} else if (currentTool == TOOL_TEXT) {
				if (isStartDrag) {
					int dx = textRect.left;
					int tX =  startDragSelRX + (actualX - startDragX);
					dx += tX;

					int dy = textRect.top;
					int tY  =  startDragSelRY + (actualY - startDragY);
					dy += tY;
					
					v(hTextX, strval(tX));
					v(hTextY, strval(tY));
					
					isStartDrag = false;
				}
			}
		}
		InvalidateRect(hCanvas, NULL, TRUE);
		HDC canvasDC = GetDC(this->GetCanvas());
		this->DrawCanvas(canvasDC);
		ReleaseDC(this->GetCanvas(), canvasDC);

	}
    

    void ZoomIn() {
		zoomLevel *= 1.1f;
		// Сбрасываем скролл при масштабировании
		scrollPosX = 0;
		scrollPosY = 0;
		UpdateScrollBars();
		InvalidateRect(hCanvas, NULL, TRUE);
		repaint();
	}

	void ZoomOut() {
		zoomLevel /= 1.1f;
		if (zoomLevel < 0.1f) zoomLevel = 0.1f;
		// Сбрасываем скролл при масштабировании
		scrollPosX = 0;
		scrollPosY = 0;
		UpdateScrollBars();
		InvalidateRect(hCanvas, NULL, TRUE);
		repaint();
	}

	void OpenImageFile(const wstring& filename = L"") {
		wchar_t filepath[MAX_PATH] = {0};
		
		if (!filename.empty()) {
			// Используем переданный путь
			wcsncpy(filepath, filename.c_str(), MAX_PATH - 1);
		} else {
			// Показываем диалог выбора файла
			OPENFILENAMEW ofn;
			memset(&ofn, 0, sizeof(OPENFILENAMEW));
			ofn.lStructSize = sizeof(OPENFILENAMEW);
			ofn.hwndOwner = hwnd;
			ofn.lpstrFilter = L"BMP Files\0*.bmp\0";
			if (pngIsSupported) {
				ofn.lpstrFilter = L"Image Files\0*.bmp;*.png;*.jpg;*.jpeg\0All Files\0*.*\0";
			}
			ofn.lpstrFile = filepath;
			ofn.nMaxFile = MAX_PATH;
			ofn.Flags = OFN_FILEMUSTEXIST | OFN_PATHMUSTEXIST;
			
			if (!GetOpenFileNameW(&ofn)) {
				return;
			}
		}
		
		// Проверяем существование файла
		DWORD attr = GetFileAttributesW(filepath);
		if (attr == INVALID_FILE_ATTRIBUTES || (attr & FILE_ATTRIBUTE_DIRECTORY)) {
			wchar_t errorMsg[512];
			swprintf(errorMsg, L"Cannot open file:\n%s\n\nFile not found or inaccessible.", filepath);
			MessageBoxW(hwnd, errorMsg, L"Error", MB_ICONERROR);
			return;
		}
		
		// Запоминаем путь
		file = wstring(filepath);
		tmpFile = wstring(filepath);
		fileIsOpen = true;
		if (IsNotBmpFile(file)) {
			tmpFile = CreateTmpFile(file);
			size_t sz =  tmpFile.length();
			for (size_t i = 0; i < MAX_PATH; i++) {
				if (i < sz) {
					filepath[i] = tmpFile[i];
				} else {
					filepath[i] = 0;
				}
			}
		}
		
		// Пробуем загрузить файл
		if (LoadImageFileW(filepath)) {
			// Обновляем заголовок окна
			wstring title = L"BMP Editor - " + file;
			SetWindowTextW(hwnd, title.c_str());
		} else {
			wchar_t errorMsg[512];
			swprintf(errorMsg, L"Failed to load image:\n%s\n\nUnsupported format or corrupted file.", filepath);
			MessageBoxW(hwnd, errorMsg, L"Error", MB_ICONERROR);
		}
		if (storedTool == TOOL_CANVAS) {
			currentTool = storedTool;
			ShowCanvasControls();
		}
		
	}
	
	wstring CreateTmpFile(wstring file) {
		// 1. Генерация случайного имени файла
		wstring randomName = generateRandStr(10) + L".bmp";
		
		// 2. Получение пути к временной директории
		wchar_t tempPath[MAX_PATH];
		DWORD pathLength = GetTempPathW(MAX_PATH, tempPath);
		
		wstring tmpDir;
		if (pathLength == 0 || pathLength > MAX_PATH) {
			// Ошибка получения временной директории
			tmpDir =  L"Z:\\tmp";
		} else {
			tmpDir =  wstring(tempPath);
		}
		
		// 3. Конкатенация пути и возврат результата
		wstring result = tmpDir + randomName;
		//run convert
		exec(file, result);
		Sleep(100);
		return result;
		
		//return wstring(L"F:\\tmp\\pngd\\01211.bmp");
	}
	
	bool fileExists(const wstring& filename) {
		DWORD attrib = GetFileAttributesW(filename.c_str());
		return (attrib != INVALID_FILE_ATTRIBUTES && 
			   !(attrib & FILE_ATTRIBUTE_DIRECTORY));
	}
	
	bool IsPngSupport() {
		string testfile = GetAppPath() + "\\i\\res\\+.png";
		string testbmp = GetAppPath() + "\\i\\res\\+.bmp";
		exec(toWStr(testfile), toWStr(testbmp));
		Sleep(100);
		
		pngIsSupported = fileExists(toWStr(testbmp));
		
	}
	
	bool exec(wstring in, wstring out) {
		string sconv = GetAppPath() + "\\p\\convert_images.py";
		string sconv2 = GetAppPath() + "\\p\\u910\\ci.py";
		
		wstring conv = toWStr(sconv);
		wstring conv2 = toWStr(sconv2);
		
		wstring cmd = L"#!/bin/bash\n";
		wstring nixBmp = toNixPath(out);
		wstring nixFile = toNixPath(in);
		cmd += L"rm -f " + nixBmp + L"\n"; 
		cmd += L"python3  \"" + toNixPath(conv) + L"\" \"" + nixFile + L"\" \"" + nixBmp + L"\"\n"; 
		cmd += L"python  \"" + toNixPath(conv2) + L"\" \"" + nixFile + L"\" \"" + nixBmp + L"\"\n"; 
		
		//writefile
		string shell(GetAppPath() +  "\\p\\u.sh");
		ofstream file(shell.c_str(), ios::binary);
		if (file.is_open()) {
			// Преобразование UTF-16 (wstring) в UTF-8
			int utf8_size = WideCharToMultiByte(CP_UTF8, 0, cmd.c_str(), cmd.length(), NULL, 0, NULL, NULL);
			if (utf8_size > 0) {
				char* utf8_buffer = new char[utf8_size + 1];
				WideCharToMultiByte(CP_UTF8, 0, cmd.c_str(), cmd.length(), utf8_buffer, utf8_size, NULL, NULL);
				utf8_buffer[utf8_size] = '\0';
				
				file << utf8_buffer;
				delete[] utf8_buffer;
			}
			file.close();
		}
		
		
		
		system(shell.c_str());
	}
	
	// Для std::string
	string replaceAll(const string& str, const string& from, const string& to) {
		if (from.empty()) {
			return str;
		}
		
		string result = str;
		size_t start_pos = 0;
		
		while ((start_pos = result.find(from, start_pos)) != string::npos) {
			result.replace(start_pos, from.length(), to);
			start_pos += to.length(); // Чтобы избежать бесконечного цикла при замене на подстроку, содержащую 'from'
		}
		
		return result;
	}

	// Для std::wstring
	wstring replaceAll(const wstring& str, const wstring& from, const wstring& to) {
		if (from.empty()) {
			return str;
		}
		
		wstring result = str;
		size_t start_pos = 0;
		
		while ((start_pos = result.find(from, start_pos)) != wstring::npos) {
			result.replace(start_pos, from.length(), to);
			start_pos += to.length();
		}
		
		return result;
	}
	
	string toNixPath(string s) {
		string r =  replaceAll(s, "\\", "/");
		r = replaceAll(r, "Z:", "");
		r = replaceAll(r, "C:", "");
		r = replaceAll(r, "D:", "");
		r = replaceAll(r, "E:", "");
		r = replaceAll(r, "F:", "");
		r = replaceAll(r, "G:", "");
		return r;
	}
	
	wstring toNixPath(wstring s) {
		wstring r =  replaceAll(s, L"\\", L"/");
		r = replaceAll(r, L"Z:", L"");
		
		TCHAR buffer[256];
		DWORD size = 256;
		
		// Отображаемое имя
		wstring uname = GetUserName();
		r = replaceAll(r, L"C:", L"/home/" + uname + L"/.wine/drive_c");
		r = replaceAll(r, L"D:", L"/media/" + uname + L"/D");
		r = replaceAll(r, L"E:", L"/media/" + uname + L"/E");
		r = replaceAll(r, L"F:", L"/media/" + uname + L"/F");
		r = replaceAll(r, L"G:", L"/media/" + uname + L"/G");
		
		
		
		return r;
	}
	
	wstring GetUserName() {
		return toWStr(GetUserNameS());
	}
	
	string GetUserNameS() {
		int sz = 256;
		char* buf[sz];
		for (int i = 0; i < sz; i++) {
			buf[i] = 0;
		}
		GetEnvironmentVariableA((LPSTR)"HOMEPATH", (LPSTR)buf, sz);
		string s((char*)buf);
		s = replaceAll(s, "\\users\\", "");
		
		return s;
	}
	
	wstring toWStr(string s) {
		wstring r = L"";
		size_t sz = s.length();
		for (size_t i = 0; i < sz; i++) {
			wchar_t wch = (wchar_t)s[i];
			r += wch;
		}
		
		return r;
	}
	
	int prand(int min, int max){
		//srand((long)time(NULL));
		int r = (int)( ((double) rand() / RAND_MAX) * (max - min) + min );
		int tm = (int)time(NULL);
		r += tm;
		if (r > max) {
			r = r % max;
		}
		if (r < min) {
			r += min;
		}
		
		return r;
	}
	
	wstring generateRandStr(int length)
	{
		int L, B;
		wstring chars;
		wstring rate;
		wstring str;
		int limit;
		wchar_t ch;

		L = 0;
		chars = L"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
		chars += L"1234567890";

		str = L"";
		rate = L"";
		limit = chars.length() - 1;
		
		
		B = 0;
		while (L < length) {
			int N = prand(1, limit);
			ch = chars[N];
			wstring wch = L"";
			wch += ch;
			size_t pos = rate.find(wch);
			
			//if (!$rate[$ch] || $rate[$ch] < 1) {
			if (pos == wstring::npos) {
				str += ch;
				//$rate[$ch] = $rate[$ch] ? $rate[$ch] + 1 : 1;
				rate[pos] = (wchar_t)'!';
				rate += ch;
				L++;
			}
			B++;
			if (B > 500) {
				break;
			}
		}
		string s = strval(time(NULL));
		wstring ww = L"";
		for (int k = 0; k < s.length(); k++) {
			ww += (wchar_t)s[k];
		}
		return str + ww;
	}
	
	void UpdateWorkFile() {
		if (tmpFile != file) {
			exec(tmpFile, file);
		}
	}
	
	void DeleteTempFile(){
		if (tmpFile != L"") {
			DeleteFileW(tmpFile.c_str());
		}
	}
	
	bool IsNotBmpFile(const wstring& filepath) {
		if (filepath.length() < 5) { // Минимальная длина: "a.bmp"
			return true;
		}
		
		// Ищем последнюю точку с конца для большей эффективности
		size_t dotPos = filepath.length() - 1;
		while (dotPos > 0 && dotPos != std::wstring::npos) {
			if (filepath[dotPos] == L'.') {
				break;
			}
			--dotPos;
		}
		
		// Проверяем условия
		if (dotPos == 0 || dotPos == std::wstring::npos || 
			filepath.length() - dotPos != 4) { // ".bmp" = 4 символа
			return true;
		}
		
		// Прямое сравнение расширения (без учета регистра)
		const wchar_t* ext = filepath.c_str() + dotPos + 1;
		return !((ext[0] == L'b' || ext[0] == L'B') &&
				 (ext[1] == L'm' || ext[1] == L'M') &&
				 (ext[2] == L'p' || ext[2] == L'P'));
	}

    void SaveImageFileDialog() {
        if (!loadedBitmap) return;
        
        wchar_t filename[MAX_PATH] = {0};
        OPENFILENAMEW ofn;
        memset(&ofn, 0, sizeof(OPENFILENAMEW));
        ofn.lStructSize = sizeof(OPENFILENAMEW);
        ofn.hwndOwner = hwnd;
        ofn.lpstrFilter = L"BMP Files\0*.bmp\0";
        if (pngIsSupported) {
			ofn.lpstrFilter = L"Image Files\0*.bmp;*.png;*.jpg;*.jpeg\0All Files\0*.*\0";
		}
        ofn.lpstrFile = filename;
        ofn.nMaxFile = MAX_PATH;
        ofn.Flags = OFN_OVERWRITEPROMPT;
        

        if (GetSaveFileNameW(&ofn)) {
			fileIsOpen = true;
			wstring dbgs(filename);
			file = dbgs;
			tmpFile = dbgs;
			bool isNotBmp = IsNotBmpFile(file);
			if (isNotBmp) {
				tmpFile = CreateTmpFile(file);
			}
            SaveImageFile(tmpFile);
            if (isNotBmp) {
				UpdateWorkFile();
			}
        }
        if (storedTool == TOOL_CANVAS) {
			currentTool = storedTool;
			ShowCanvasControls();
		}
    }

    void PasteImage() {
        if (hasClipboard && loadedBitmap && clipBmp) {
			if (insertSelectionMode) {
				addHistory();
				pasteFromInternalBuffer(memoryDC);// Был здесь и без аргумента (добавил его вместе с этой затеей)
				insertSelectionX = 0;
				insertSelectionY = 0;
			}
			showInsertSelectionTools();
			insertSelectionMode = true;
			repaint();
			return;
		}
		
		// 2. Если нет внутреннего буфера, пробуем вставить из системного буфера
		if (OpenClipboard(hwnd)) {
			// Проверяем наличие bitmap в буфере
			if (IsClipboardFormatAvailable(CF_BITMAP)) {
				HBITMAP hClipboardBmp = (HBITMAP)GetClipboardData(CF_BITMAP);
				if (hClipboardBmp) {
					//pasteFromSystemClipboard(hClipboardBmp); 
					if (insertSelectionMode) {
						addHistory();
						pasteFromSystemClipboard(hClipboardBmp);
						insertSelectionX = 0;
						insertSelectionY = 0;
					}
					showInsertSelectionTools();
					insertSelectionMode = true;
					repaint();
				}
			}
			CloseClipboard();
			return;
		}

    }

	void pasteFromInternalBuffer(HDC drawingDC) {
		if (!hasClipboard || !loadedBitmap) {
			return;
		}

        HDC hdc = GetDC(hwnd);
        BITMAP bmp;
        GetObject(clipBmp, sizeof(BITMAP), &bmp);
        StretchBlt(/*memoryDC*/drawingDC, (int)(insertSelectionX/zoomLevel) + scrollPosX, (int)(insertSelectionY/zoomLevel) + scrollPosY, clipboardWidth, clipboardHeight,
					  clipDC, 0, 0, bmp.bmWidth, bmp.bmHeight, SRCCOPY);
		// Копируем из буфера на экран
		
        
        ReleaseDC(hwnd, hdc);

        InvalidateRect(hCanvas, NULL, TRUE);
		UpdateWindow(hCanvas);
		repaint();
	}
	
	void drawPastedFromInternalBuffer(HDC drawingDC) {
		if (!hasClipboard || !loadedBitmap) {
			return;
		}

        HDC hdc = GetDC(hwnd);
        BITMAP bmp;
        GetObject(clipBmp, sizeof(BITMAP), &bmp);
        ExpandCanvas(bmp.bmWidth, bmp.bmHeight);
        StretchBlt(drawingDC, insertSelectionX, insertSelectionY, (int)(clipboardWidth*zoomLevel), (int)(clipboardHeight*zoomLevel),
					  clipDC, 0, 0, bmp.bmWidth, bmp.bmHeight, SRCCOPY);
		// Копируем из буфера на экран
		
		
		// Чтобы отобразилось выделение поверх вставки
		setSelectionByBmp(bmp);
        ReleaseDC(hwnd, hdc);
		
	}
	
	
	void setSelectionByBmp(BITMAP bmp) {
		selectionRect.left = insertSelectionX + scrollPosX;
		selectionRect.top = insertSelectionY + scrollPosY;
		selectionRect.right = insertSelectionX + (int)(clipboardWidth*zoomLevel) + scrollPosX;
		selectionRect.bottom = insertSelectionY + (int)(clipboardHeight*zoomLevel) + scrollPosY;
		currentTool = TOOL_SELECTION;
	}


	void CopyToSystemClipboard() {
		if (!clipBmp || !OpenClipboard(hwnd)) return;

		// Очищаем буфер обмена
		EmptyClipboard();

		// Создаем копию bitmap для буфера обмена
		HDC hdc = GetDC(hwnd);
		HDC hdcMem = CreateCompatibleDC(hdc);
		
		// Создаем bitmap такого же размера и формата
		HBITMAP hClipboardBmp = CreateCompatibleBitmap(hdc, clipboardWidth, clipboardHeight);
		HBITMAP hOldBmp = (HBITMAP)SelectObject(hdcMem, hClipboardBmp);

		// Копируем данные из нашего буфера в буфер обмена
		BitBlt(hdcMem, 0, 0, clipboardWidth, clipboardHeight,
			  clipDC, 0, 0, SRCCOPY);

		// Помещаем в буфер обмена
		SetClipboardData(CF_BITMAP, hClipboardBmp);

		// Восстанавливаем и очищаем
		SelectObject(hdcMem, hOldBmp);
		DeleteDC(hdcMem);
		ReleaseDC(hwnd, hdc);
		CloseClipboard();

		// Не удаляем hClipboardBmp - он теперь принадлежит буферу обмена
	}


	
	
	void pasteFromSystemClipboard(HBITMAP hClipboardBmp) {
		if (!hClipboardBmp || !loadedBitmap) return;

		HDC hdc = GetDC(hwnd);
		
		// Получаем информацию о bitmap из буфера
		BITMAP bmp;
		if (GetObject(hClipboardBmp, sizeof(BITMAP), &bmp) == 0) {
			ReleaseDC(hwnd, hdc);
			return;
		}

		// Создаем временный DC для bitmap из буфера
		HDC hdcClipboard = CreateCompatibleDC(hdc);
		HBITMAP hOldClipboardBmp = (HBITMAP)SelectObject(hdcClipboard, hClipboardBmp);

		// Проверяем размеры и создаем совместимый bitmap
		if (bmp.bmWidth > 0 && bmp.bmHeight > 0) {
			// Копируем непосредственно в memoryDC
			BitBlt(memoryDC, (int)(insertSelectionX/zoomLevel) + scrollPosX, (int)(insertSelectionY/zoomLevel) + scrollPosY, (int)(bmp.bmWidth/zoomLevel), (int)(bmp.bmHeight/zoomLevel), hdcClipboard, 0, 0, SRCCOPY);
		}

		// Очищаем ресурсы
		SelectObject(hdcClipboard, hOldClipboardBmp);
		DeleteDC(hdcClipboard);
		ReleaseDC(hwnd, hdc);

		InvalidateRect(hCanvas, NULL, TRUE);
		
		// Принудительная перерисовка
		HDC canvasDC = GetDC(hCanvas);
		DrawCanvas(canvasDC);
		ReleaseDC(hCanvas, canvasDC);
	}
	
	void drawPastedFromSystemBuffer(HDC drawingDC, HBITMAP hClipboardBmp) {
		if (!hClipboardBmp || !loadedBitmap) return;

		HDC hdc = GetDC(hwnd);
		
		// Получаем информацию о bitmap из буфера
		BITMAP bmp;
		if (GetObject(hClipboardBmp, sizeof(BITMAP), &bmp) == 0) {
			ReleaseDC(hwnd, hdc);
			return;
		}

		// Создаем временный DC для bitmap из буфера
		HDC hdcClipboard = CreateCompatibleDC(hdc);
		HBITMAP hOldClipboardBmp = (HBITMAP)SelectObject(hdcClipboard, hClipboardBmp);

		// Проверяем размеры и создаем совместимый bitmap
		if (bmp.bmWidth > 0 && bmp.bmHeight > 0) {
			// Копируем непосредственно в memoryDC
			ExpandCanvas(bmp.bmWidth, bmp.bmHeight);
			BitBlt(drawingDC, (int)(insertSelectionX/zoomLevel), (int)(insertSelectionY/zoomLevel), (int)(bmp.bmWidth/zoomLevel), (int)(bmp.bmHeight/zoomLevel), hdcClipboard, 0, 0, SRCCOPY);
			
			// Чтобы отобразилось выделение поверх вставки
			clipboardWidth = bmp.bmWidth;
			clipboardHeight = bmp.bmHeight;
			setSelectionByBmp(bmp);
		}

		// Очищаем ресурсы
		SelectObject(hdcClipboard, hOldClipboardBmp);
		DeleteDC(hdcClipboard);
		ReleaseDC(hwnd, hdc);

		InvalidateRect(hCanvas, NULL, TRUE);
		
	}
	
	
	// Функция расширения холста
	void ExpandCanvas(int newWidth, int newHeight, bool force = false) {
		HDC hdc = GetDC(hwnd);
		
		int oldW = -1, oldH = -1;
		if (loadedBitmap) {
			BITMAP oldBmpSz;
			GetObject(loadedBitmap, sizeof(BITMAP), &oldBmpSz);
			oldW = oldBmpSz.bmWidth;
			oldH = oldBmpSz.bmHeight;
			if ((newWidth < oldW || newHeight < oldH) && !force) {
				ReleaseDC(hwnd, hdc);
				return;
			}
		}
		
		// Создаем новый bitmap большего размера
		HBITMAP newBitmap = CreateCompatibleBitmap(hdc, newWidth, newHeight);
		HDC newMemoryDC = CreateCompatibleDC(hdc);
		HBITMAP oldNewBmp = (HBITMAP)SelectObject(newMemoryDC, newBitmap);
		
		// Заливаем белым цветом
		HBRUSH whiteBrush = CreateSolidBrush(RGB(255, 255, 255));
		RECT rect = {0, 0, newWidth, newHeight};
		FillRect(newMemoryDC, &rect, whiteBrush);
		DeleteObject(whiteBrush);
		
		// Копируем старое изображение в новый холст
		if (loadedBitmap) {
			BITMAP oldBmp;
			GetObject(loadedBitmap, sizeof(BITMAP), &oldBmp);
			BitBlt(newMemoryDC, 0, 0, oldBmp.bmWidth, oldBmp.bmHeight,
				   memoryDC, 0, 0, SRCCOPY);
		}
		
		// Заменяем старый холст новым
		SelectObject(memoryDC, loadedBitmap);
		DeleteObject(loadedBitmap);
		loadedBitmap = newBitmap;
		DeleteDC(memoryDC);	// Важно. DS пытался очищать ресурсы ниже, а надо вот так.
		memoryDC = newMemoryDC;
		SelectObject(memoryDC, loadedBitmap);
		
		
		// Очищаем ресурсы
		//SelectObject(newMemoryDC, oldNewBmp);
		//DeleteDC(newMemoryDC);
		ReleaseDC(hwnd, hdc);
	}

    void ShowTextControls() {
        if (textControlsVisible) return;
        
        RECT clientRect;
        GetClientRect(hwnd, &clientRect);
        
        int yPos = 360;
        string textParameters = "Text parameters";
        
        if (NULL == hTextX) {
			
			hTextControlsTitle = CreateWindow("STATIC", textParameters.c_str(), WS_CHILD | WS_VISIBLE,
						10, yPos, 120, 20, hwnd, NULL, hInstance, NULL);
			
			yPos += 20;
			// Создаем поля ввода с рамками
			hTextInput = CreateWindow("EDIT", textContent.c_str(),
									 WS_CHILD | WS_VISIBLE | ES_MULTILINE | ES_AUTOVSCROLL | WS_BORDER,
									 10, yPos, TOOLBAR_WIDTH - 20, 60,
									 hwnd, NULL, hInstance, NULL);
			
			yPos += 70;
			hTextXLabel = CreateWindow("STATIC", "x:", WS_CHILD | WS_VISIBLE,
						10, yPos, 20, 20, hwnd, NULL, hInstance, NULL);
			
			hTextX = CreateWindow("EDIT", "10", WS_CHILD | WS_VISIBLE | WS_BORDER,
								30, yPos, 30, 20, hwnd, (HMENU)4001, hInstance, NULL);
			
			hTextYLabel =CreateWindow("STATIC", "y:", WS_CHILD | WS_VISIBLE,
						70, yPos, 20, 20, hwnd, NULL, hInstance, NULL);
			
			hTextY = CreateWindow("EDIT", "10", WS_CHILD | WS_VISIBLE | WS_BORDER,
								90, yPos, 30, 20, hwnd, (HMENU)4002, hInstance, NULL);
			
			yPos += 30;
			hTextWLabel = CreateWindow("STATIC", "w:", WS_CHILD | WS_VISIBLE,
						10, yPos, 20, 20, hwnd, NULL, hInstance, NULL);
			
			hTextW = CreateWindow("EDIT", "170", WS_CHILD | WS_VISIBLE | WS_BORDER,
								30, yPos, 30, 20, hwnd, (HMENU)4003, hInstance, NULL);
			
			hTextHLabel = CreateWindow("STATIC", "h:", WS_CHILD | WS_VISIBLE,
						70, yPos, 20, 20, hwnd, NULL, hInstance, NULL);
			
			hTextH = CreateWindow("EDIT", "20", WS_CHILD | WS_VISIBLE | WS_BORDER,
								90, yPos, 30, 20, hwnd, (HMENU)4004, hInstance, NULL);
			
			yPos += 30;
			hFontButton = CreateWindow("BUTTON", "Font",
									  WS_CHILD | WS_VISIBLE,
									  10, yPos, 80, 25,
									  hwnd, (HMENU)4000, hInstance, NULL);
			
			yPos += 40;
			hLabelLineW = CreateWindow("STATIC", "Line width:", WS_CHILD | WS_VISIBLE,
						10, yPos, 120, 20, hwnd, NULL, hInstance, NULL);
			
			//yPos += 30;			
			iLineW = CreateWindow("EDIT", "2", WS_CHILD | WS_VISIBLE | WS_BORDER,
								90, yPos, 30, 20, hwnd, (HMENU)4005, hInstance, NULL);
			
			// Делаем в оконной функции полей ввода доступным наш класс
			SetWindowLongPtr(hTextX, GWLP_USERDATA, (LONG_PTR)this);
			SetWindowLongPtr(hTextY, GWLP_USERDATA, (LONG_PTR)this);
			SetWindowLongPtr(hTextW, GWLP_USERDATA, (LONG_PTR)this);
			SetWindowLongPtr(hTextH, GWLP_USERDATA, (LONG_PTR)this);
			SetWindowLongPtr(hTextInput, GWLP_USERDATA, (LONG_PTR)this);
			SetWindowLongPtr(iLineW, GWLP_USERDATA, (LONG_PTR)this);
			
			// Устанавливаем новые оконные процедуры
			if (!defaultEditProc) {
				defaultEditProc = (WNDPROC)SetWindowLongPtr(hTextX, GWLP_WNDPROC, (LONG_PTR)EditProc);
				SetWindowLongPtr(hTextY, GWLP_WNDPROC, (LONG_PTR)EditProc);
				SetWindowLongPtr(hTextW, GWLP_WNDPROC, (LONG_PTR)EditProc);
				SetWindowLongPtr(hTextH, GWLP_WNDPROC, (LONG_PTR)EditProc);
				SetWindowLongPtr(hTextInput, GWLP_WNDPROC, (LONG_PTR)EditProc);
				SetWindowLongPtr(iLineW, GWLP_WNDPROC, (LONG_PTR)EditProc);
			}
			
			
			
		} else {// end NULL x
			v(hTextControlsTitle, textParameters);
			v(hTextW, "170");
			v(hTextH, "20");
			v(hTextX, "10");
			v(hTextY, "10");
			ShowWindow(hTextControlsTitle, SW_SHOW);
			ShowWindow(hTextInput, SW_SHOW);
			ShowWindow(hTextX, SW_SHOW);
			ShowWindow(hTextY, SW_SHOW);
			ShowWindow(hTextW, SW_SHOW);
			ShowWindow(hTextH, SW_SHOW);
			ShowWindow(hFontButton, SW_SHOW);
			
			ShowWindow(hTextXLabel, SW_SHOW);
			ShowWindow(hTextYLabel, SW_SHOW);
			ShowWindow(hTextWLabel, SW_SHOW);
			ShowWindow(hTextHLabel, SW_SHOW);
		}
        
        textControlsVisible = true;
    }


    void HideTextControls() {
        if (!textControlsVisible) return;
        
        ShowWindow(hTextInput, SW_HIDE);
        ShowWindow(hTextX, SW_HIDE);
        ShowWindow(hTextY, SW_HIDE);
        ShowWindow(hTextW, SW_HIDE);
        ShowWindow(hTextH, SW_HIDE);
        ShowWindow(hFontButton, SW_HIDE);
        
        ShowWindow(hTextXLabel, SW_HIDE);
		ShowWindow(hTextYLabel, SW_HIDE);
		ShowWindow(hTextWLabel, SW_HIDE);
		ShowWindow(hTextHLabel, SW_HIDE);
		ShowWindow(hTextControlsTitle, SW_HIDE);
        
        textControlsVisible = false;
    }

    void SelectFont(bool fromSetting = false) {
        LOGFONTA lf;
        memset(&lf, 0, sizeof(LOGFONTA));
        if (textFont) {
            GetObjectA(textFont, sizeof(LOGFONTA), &lf);
        } else {
            lf.lfHeight = 14;
            lf.lfCharSet = RUSSIAN_CHARSET;
            strcpy(lf.lfFaceName, "Calibri");
        }

        

		if (!fromSetting) {
			CHOOSEFONTA cf;
			memset(&cf, 0, sizeof(CHOOSEFONTA));
			cf.lStructSize = sizeof(CHOOSEFONTA);
			cf.hwndOwner = hwnd;
			cf.lpLogFont = &lf;
			cf.Flags = CF_INITTOLOGFONTSTRUCT | CF_SCREENFONTS;
			if (ChooseFontA(&cf)) {
				if (textFont) DeleteObject(textFont);
				textFont = CreateFontIndirectA(&lf);
				
				for (int i = 0; i < LF_FACESIZE; i++) {
					g_settings.font.lfFaceName[i] = 0;
				}
				strncpy(g_settings.font.lfFaceName, lf.lfFaceName, LF_FACESIZE);
				g_settings.font.lfHeight = lf.lfHeight;
				SaveSettings();
				
				SendMessageA(hTextInput, WM_SETFONT, (WPARAM)textFont, TRUE);
				InvalidateRect(hCanvas, NULL, TRUE);
				UpdateTextFromControls();
			}
		} else {
			if (textFont) DeleteObject(textFont);
			textFont = CreateFontIndirectA(&g_settings.font);
			
			SendMessageA(hTextInput, WM_SETFONT, (WPARAM)textFont, TRUE);
			InvalidateRect(hCanvas, NULL, TRUE);
		}
    }

    bool HandleChildCommand(int cmd) {
        if (cmd >= 1000 && cmd < 1012) {
            OnToolbarCommand(cmd);
            return true;
        } else if (cmd == 4000) {
            SelectFont();
            return true;
        } else if (cmd == 5000 || cmd == 5001) {
            OnToolbarCommand(cmd);
            return true;
        } else if (cmd == 3000) {
            OnColorSelect(0, 0, cmd);
            return true;
        }
        return false;
    }


    void HandleCommand(int cmd) {
        if (cmd >= 1000 && cmd < 1011) {
            OnToolbarCommand(cmd);
        } else if (cmd == 4000) {
            SelectFont();
        }
    }

    void onKeyDown(HWND hWnd, WPARAM wParam) {
		if ((wParam == VK_UP || wParam == VK_DOWN) && hWnd != hTextInput) {
			onArrowKeys(hWnd, wParam);
		} else if (hWnd == hTextInput) {
			PostMessage(hwnd, WM_USER + 300, 0, (LPARAM)0);
		}
		if (wParam == VK_TAB) {
			handleTextToolTab();
		}
		
		
        if (GetKeyState(VK_CONTROL) & 0x8000) {
            if (wParam == 'O' || wParam == 'o') {
                OpenImageFile();
            } else if (wParam == 'S' || wParam == 's') {
				if (fileIsOpen) {
					SaveImageFile(tmpFile);
					UpdateWorkFile();
					if (storedTool == TOOL_CANVAS) {
						currentTool = storedTool;
						ShowCanvasControls();
					}
					return;
				} else {
					SaveImageFileDialog();
				}
                
            } else if (wParam == 'V' || wParam == 'v') {
                PasteImage();
            } else if (wParam == 'C' || wParam == 'c') {
                copyFragment();
            } else if (wParam == 'X' || wParam == 'x') {
                CutImage();
            } else if (wParam == 'Z' || wParam == 'z') {
                undoHistory();
            } else if (wParam == 'Y' || wParam == 'y') {
                redoHistory();
            }
        }
        
        onEscapeTextTool(wParam);
    }
    
    void onEscapeTextTool(WPARAM wParam){
		if (currentTool == TOOL_TEXT) {
            if (wParam == VK_ESCAPE) {
                currentTool = TOOL_SELECTION;
                HideTextControls();
                InvalidateRect(hCanvas, NULL, TRUE);
            }
        }
        
        if (insertSelectionMode) {
            if (wParam == VK_ESCAPE) {
                currentTool = TOOL_SELECTION;
                insertSelectionMode = false;
                ClearClipboardResources();
                insertSelectionX = selectionRect.left = 0;
				insertSelectionY = selectionRect.top = 0;
				selectionRect.right = 0;
				selectionRect.bottom = 0;
				repaint();
                InvalidateRect(hCanvas, NULL, TRUE);
            }
        }
	}

    void handleTextToolTab() {
		HWND hFocus = GetFocusedEdit();
		if (currentTool == TOOL_TEXT || (currentTool == TOOL_SELECTION && selectionMode) ) {
			if (hFocus == hTextX) {
				SetFocus(hTextY);
			}else if (hFocus == hTextY) {
				SetFocus(hTextW);
			}else if (hFocus == hTextW) {
				SetFocus(hTextH);
			}else if (hFocus == hTextH) {
				SetFocus(hTextX);
			}
		}
		
		if (currentTool == TOOL_CANVAS) {
			if (hFocus == hTextW) {
				SetFocus(hTextH);
			}else if (hFocus == hTextH) {
				SetFocus(hTextW);
			}
		}
		
		if (insertSelectionMode) {
			if (hFocus == hTextX) {
				SetFocus(hTextY);
			}else if (hFocus == hTextY) {
				SetFocus(hTextX);
			}
		}
		
	}
    // 5. Улучшим обработку стрелок
	void onArrowKeys(HWND hEdit, WPARAM wParam) {
		char buffer[256];
		GetWindowTextA(hEdit, buffer, 256);
		
		int value = atoi(buffer);
		int increment = 1;
		
		// Проверяем зажат ли Shift
		if (GetKeyState(VK_SHIFT) & 0x8000) {
			increment = 10;
		}
		
		if (wParam == VK_UP) {
			value += increment;
		} else if (wParam == VK_DOWN) {
			value -= increment;
			value = max(0, value); // Не допускаем отрицательные значения
		}
		
		// Обновляем значение в поле
		char newValue[32];
		sprintf(newValue, "%d", value);
		SetWindowTextA(hEdit, newValue);
		
		// Отправляем сообщение об изменении
		SendMessageA(hEdit, WM_SETTEXT, 0, (LPARAM)newValue);
		
		// Обновляем текст на изображении
		if (currentTool == TOOL_TEXT) {
			UpdateTextFromControls();
		}
		
		if (currentTool == TOOL_CANVAS && !insertSelectionMode) {
			updateCanvasSizeFromControls();
		}
		
		if (insertSelectionMode) {
			updateInsertXYFromControls();
		}
		
		if (selectionMode && inputFocused) {
			updateSelectionFromControls();
		}
	}

	void updateCanvasSizeFromControls() {
		if (skipCanvasSizeUpd) {
			return;
		}
		HDC hdc = GetDC(hwnd);
		int width = atoi(v(hTextW).c_str());
		int height = atoi(v(hTextH).c_str());
		ExpandCanvas(width, height, true);
		// Сбрасываем скролл и обновляем
		scrollPosX = 0;
		scrollPosY = 0;
		UpdateScrollBars();
		InvalidateRect(hCanvas, NULL, TRUE);
		repaint();
	}
	
	void updateInsertXYFromControls(){
		insertSelectionX = atoi(v(hTextX).c_str());
		insertSelectionY = atoi(v(hTextY).c_str());
		repaint();
	}
	
	void updateSelectionFromControls() {
		selectionRect.left = intval(v(hTextX));
		selectionRect.top = intval(v(hTextY));
		selectionRect.right = intval(v(hTextW)) + intval(v(hTextX));
		selectionRect.bottom = intval(v(hTextH)) + intval(v(hTextY));
		repaint();
	}

    // Установка фокуса на поле ввода
    void SetFocusedEdit(HWND hEdit) {
        focusedEditControl = hEdit;
        inputFocused = true;
    }

    // Сброс фокуса
    void ClearFocusedEdit() {
        focusedEditControl = NULL;
        inputFocused = false;
    }
    
    // Функция создания холста по умолчанию
	void CreateDefaultCanvas(int width, int height) {
		if (loadedBitmap) {
			DeleteObject(loadedBitmap);
			loadedBitmap = NULL;
		}
		
		HDC hdc = GetDC(hwnd);
		
		// Создаем bitmap для холста
		loadedBitmap = CreateCompatibleBitmap(hdc, width, height);
		SelectObject(memoryDC, loadedBitmap);
		
		// Заливаем белым цветом
		HBRUSH whiteBrush = CreateSolidBrush(RGB(255, 255, 255));
		RECT rect = {0, 0, width, height};
		FillRect(memoryDC, &rect, whiteBrush);
		DeleteObject(whiteBrush);
		
		ReleaseDC(hwnd, hdc);
		
		// Сбрасываем скролл и обновляем
		scrollPosX = 0;
		scrollPosY = 0;
		UpdateScrollBars();
		InvalidateRect(hCanvas, NULL, TRUE);
	}

    HWND GetToolbar() const { return hToolbar; }
    HWND GetCanvas() const { return hCanvas; }
    HWND GetScrollV() const { return hScrollV; }
    HWND GetScrollH() const { return hScrollH; }
    HWND GetColorBox(int index) const { return hColorBoxes[index]; }
    HWND GetSelectedColor() const { return hSelectedColor; }
    HWND GetMoreColors() const { return hMoreColors; }
};

ImageEditor* g_editor = NULL;

LRESULT CALLBACK WndProc(HWND hwnd, UINT msg, WPARAM wParam, LPARAM lParam) {
    switch (msg) {
        case WM_CREATE: {
            HINSTANCE hInstance = ((LPCREATESTRUCT)lParam)->hInstance;
            g_editor = new ImageEditor(hwnd, hInstance);
            g_editor->Initialize();
            break;
        }

        case WM_PAINT: {
            PAINTSTRUCT ps;
            HDC hdc = BeginPaint(hwnd, &ps);

            HDC canvasDC = GetDC(g_editor->GetCanvas());
            g_editor->DrawCanvas(canvasDC);
            g_editor->InitializeColors();
            //g_editor->redrawBtnImages();
            ReleaseDC(g_editor->GetCanvas(), canvasDC);

            EndPaint(hwnd, &ps);
            //g_editor->redrawBtnImages();
            break;
        }

		case WM_KEYDOWN:{
            g_editor->onKeyDown(hwnd, wParam);
            break;
        }
        
        
        case WM_COMMAND: {
			if (g_editor) {
				g_editor->onWM_COMMAND(wParam, lParam);
			}
            break;
        } // /WM_COMMAND

        
        case WM_LBUTTONDOWN: {
			if (g_editor) {
				g_editor->zOnMouseDown(lParam);
            }
            break;
        }
        
        case WM_MOUSEMOVE: {
            if (wParam & MK_LBUTTON) {
                int x = LOWORD(lParam);
                int y = HIWORD(lParam);

                RECT canvasRect;
                GetClientRect(g_editor->GetCanvas(), &canvasRect);
                POINT pt = {x, y};
                ScreenToClient(g_editor->GetCanvas(), &pt);

                //if (PtInRect(&canvasRect, pt)) {
                    g_editor->OnCanvasMouseMove(pt.x, pt.y);
                    
                //}
            }
            break;
        }

        case WM_LBUTTONUP: {
            int x = LOWORD(lParam);
            int y = HIWORD(lParam);

            RECT canvasRect;
            GetClientRect(g_editor->GetCanvas(), &canvasRect);
            POINT pt = {x, y};
            ScreenToClient(g_editor->GetCanvas(), &pt);

            //if (PtInRect(&canvasRect, pt)) {
                g_editor->OnCanvasMouseUp(pt.x, pt.y);
                //g_editor->redrawBtnImages();
            //}
            break;
        }

        case WM_SIZE: {
            RECT clientRect;
            GetClientRect(hwnd, &clientRect);

            // Немедленное обновление позиций
            MoveWindow(g_editor->GetToolbar(), 0, 0, TOOLBAR_WIDTH, clientRect.bottom - 100, TRUE);
            MoveWindow(g_editor->GetCanvas(), TOOLBAR_WIDTH, 0,
                      clientRect.right - TOOLBAR_WIDTH - 20, clientRect.bottom - 100, TRUE);
            MoveWindow(g_editor->GetScrollV(), clientRect.right - 20, 0,
                      20, clientRect.bottom - 100, TRUE);
            MoveWindow(g_editor->GetScrollH(), TOOLBAR_WIDTH, clientRect.bottom - 100,
                      clientRect.right - TOOLBAR_WIDTH - 20, 20, TRUE);

			int PATELTTE_X = 150;
            for (int i = 0; i < PALETTE_COLORS; i++) {
                MoveWindow(g_editor->GetColorBox(i),
                          PATELTTE_X + i * COLOR_BOX_SIZE, clientRect.bottom - 80,
                          COLOR_BOX_SIZE, COLOR_BOX_SIZE, TRUE);
            }

            MoveWindow(g_editor->GetSelectedColor(),
                      PATELTTE_X + PALETTE_COLORS * COLOR_BOX_SIZE + 10, clientRect.bottom - 80,
                      SELECTED_COLOR_SIZE, SELECTED_COLOR_SIZE, TRUE);

            MoveWindow(g_editor->GetMoreColors(),
                      PATELTTE_X + PALETTE_COLORS * COLOR_BOX_SIZE + 10 + SELECTED_COLOR_SIZE + 10,
                      clientRect.bottom - 80, 60, SELECTED_COLOR_SIZE, TRUE);

            // Немедленное обновление скроллбаров
            g_editor->UpdateScrollBars();
            break;
        }
        
        case WM_VSCROLL: {
			if (g_editor) {
				g_editor->HandleVScroll(LOWORD(wParam), HIWORD(wParam));
			}
			break;
		}

		case WM_HSCROLL: {
			if (g_editor) {
				g_editor->HandleHScroll(LOWORD(wParam), HIWORD(wParam));
			}
			break;
		}


		case WM_USER + 100: {
            // Открываем файл переданный через командную строку
            if (g_editor) {
                g_editor->onFilePath(lParam);
            }
            return 0;
        }
        
        case WM_USER + 200: {
            if (g_editor) {
                g_editor->OnCreate(lParam);
            }
            return 0;
        }
        
        case WM_USER + 300: {
            // Обновляем данные в отображаемом тексте
            if (g_editor) {
                g_editor->UpdateTextFromControls();
            }
            return 0;
        }
		

        case WM_DESTROY: {
			if (g_editor) {
				g_editor->DeleteTempFile();
            }
            delete g_editor;
            PostQuitMessage(0);
            break;
        }

        default:
            return DefWindowProc(hwnd, msg, wParam, lParam);
    }
    return 0;
}

vector<wstring> ParseCommandLineArgsW() {
    vector<wstring> args;
    
    int argc;
    LPWSTR* argv = CommandLineToArgvW(GetCommandLineW(), &argc);
    
    if (argv) {
        for (int i = 1; i < argc; i++) {
            args.push_back(argv[i]);
        }
        LocalFree(argv);
    }
    
    return args;
}

int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance,
                   LPSTR lpCmdLine, int nCmdShow) {
	
	// Парсим аргументы командной строки
	wstring fileToOpen;
	vector<wstring> args = ParseCommandLineArgsW();
	if (!args.empty()) {
		fileToOpen = args[0];
	}
	
    WNDCLASS wc;
    memset(&wc, 0, sizeof(WNDCLASS));
    wc.lpfnWndProc = WndProc;
    wc.hInstance = hInstance;
    wc.hCursor = LoadCursor(NULL, IDC_ARROW);
    wc.hbrBackground = (HBRUSH)(COLOR_WINDOW + 1);
    wc.lpszClassName = "BMPEditor";
    wc.hIcon          = LoadIcon(wc.hInstance, MAKEINTRESOURCE(101));
    

    if (!RegisterClass(&wc)) {
        MessageBox(NULL, "Error registering window class!", "Error", MB_ICONERROR);
        return 1;
    }

    HWND hwnd = CreateWindow("BMPEditor", "BMP Editor",
                            WS_OVERLAPPEDWINDOW | WS_VISIBLE,
                            CW_USEDEFAULT, CW_USEDEFAULT, 800, 600,
                            NULL, NULL, hInstance, NULL);

    if (!hwnd) {
        MessageBox(NULL, "Error creating window!", "Error", MB_ICONERROR);
        return 1;
    }
    
    // Если указан файл для открытия - открываем его после создания окна
    if (!fileToOpen.empty()) {
        // Ждем немного чтобы окно полностью инициализировалось
        // PostMessage(hwnd, WM_USER + 100, 0, (LPARAM)new string(fileToOpen));
        
        // Создаем копию wstring в куче и передаем указатель
        wstring* pFileToOpen = new wstring(fileToOpen);
        PostMessage(hwnd, WM_USER + 100, 0, (LPARAM)pFileToOpen);
    } else {
		PostMessage(hwnd, WM_USER + 200, 0, (LPARAM)0);
	}
    

    MSG msg;
    while (GetMessage(&msg, NULL, 0, 0)) {
        TranslateMessage(&msg);
        DispatchMessage(&msg);
    }

    return (int)msg.wParam;
}

// 3. Новая оконная процедура для полей ввода
LRESULT CALLBACK EditProc(HWND hWnd, UINT uMsg, WPARAM wParam, LPARAM lParam) {
    ImageEditor* editor = (ImageEditor*)GetWindowLongPtr(hWnd, GWLP_USERDATA);
    
    switch (uMsg) {
        case WM_SETFOCUS:
            if (editor) {
                editor->SetFocusedEdit(hWnd);
            }
            break;
            
        case WM_KILLFOCUS:
            if (editor) {
                editor->ClearFocusedEdit();
                editor->UpdateTextFromControls();
            }
            break;
            
        case WM_KEYDOWN:
            if (editor && editor->IsEditFocused(hWnd)) {
				editor->onKeyDown(hWnd, wParam);
            }
            break;
            
        case WM_DESTROY:
            // Восстанавливаем старую процедуру
            //SetWindowLongPtr(hWnd, GWLP_WNDPROC, (LONG_PTR)oldProc);
            break;
    }
    
    // Вызываем оригинальную процедуру
    return CallWindowProc(defaultEditProc, hWnd, uMsg, wParam, lParam);
}

// 4. Новая оконная процедура для кнопок с рисунками
LRESULT CALLBACK ImageBtnProc(HWND hWnd, UINT uMsg, WPARAM wParam, LPARAM lParam) {
    ImageEditor* editor = (ImageEditor*)GetWindowLongPtr(hWnd, GWLP_USERDATA);
    
    switch (uMsg) {
        case WM_PAINT:
        case WM_LBUTTONDOWN:
        case WM_LBUTTONUP:
            if (editor) {
				LRESULT r = CallWindowProc(defaultBtnProc, hWnd, uMsg, wParam, lParam);
				editor->redrawBtnImages();
				return r;
			}
            break;
		
        
        case WM_ERASEBKGND:
			return 1;
            
        case WM_DESTROY:
            // Восстанавливаем старую процедуру
            //SetWindowLongPtr(hWnd, GWLP_WNDPROC, (LONG_PTR)oldProc);
            break;
    }
    
    // Вызываем оригинальную процедуру
    return CallWindowProc(defaultBtnProc, hWnd, uMsg, wParam, lParam);
}
