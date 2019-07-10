/**
 * @class iParserTool
 * 
 * Это такая штука, чтобы понять позиции чисел в картинке. Да, пытаюсь парсить каптчу, прикольно мне.
 * 
 * 
 * Определена ширина цифры- 21 покамест самый простой пример, цифры без искажений.
 * 
 * Далее добавить 8 ректов разноцветных и для всех определить иксы
 * 
 * Далее вырезать примеры циферок (возможно, не используя se2d)
 * 
 * Далее, пилить алгоритм распознавания
 * 
 * @var {Number} areaW - ширина "стакана"
 * @var {Array}  workGrid - массив i, j, представляющий собой сетку тетриса i - строки, j - столюбцы
 * @var {Object x, y}  workGridCellSz - размеры ячейки workGrid
 * @var {Number}  workGridNumRow      - количество строк в сетке
 * @var {Number}  workGridNumCell     - количество столбцов в сетке
 * @var {iParserToolFigure}  figure        - активная на данный момент фигура
*/
function iParserTool() {
	var o = this;
	SE2D.app = SE2D.canvas.app = this;// SE2D.setApp(this);
	SE2D.gridCell = 10; //для оптимизации расчета столкновений, 8 взято как сторона "кирпича"
	SE2D.onLoadImages = this.onInit;
	SE2D.addGraphResources(["example.png", "subject"
	]);
	SE2D.onEnterFrame = function(){
		o.onEnterFrame();
	};
}
/**
 * @description this is SE2D
*/
iParserTool.prototype.onInit = function() {
	//Сделаем изображение видимым
	var mc = this.app.subject = SE2D._root.subject;
	mc.x = 0;
	mc.y = 0;
	mc.visible = 1;
	
	//добавим цветной квадратик
	var redSq = new Sprite();
	redSq.visible = 1;
	redSq.graphics.lineStyle(1, 0xFF0000);
	//redSq.graphics._color = 0xFF0000;
	redSq.graphics.drawRect(0, 0, 50, 50);
	SE2D._root.addChild(redSq);
	this.app.redSq = redSq;
	return;
	//Тут млжно заюниттестить при желании
	if (window.runUnittest && runUnittest instanceof Function) {
		runUnittest();
	}
	
}
/**
 * @description this is App
*/
iParserTool.prototype.onEnterFrame = function(e) {
	var redSqX = parseFloat(iRedSqX.value),
		redSqW = parseInt(iRedSqW.value);
	if (redSqX) {
		this.redSq.go(redSqX, 0);
	}
	if (redSqW) {
		this.redSq.graphics.clear();
		this.redSq.graphics.setLineStyle(1, 0xFF0000);
		this.redSq.graphics.drawRect(0, 0, redSqW, 50);
	}
}
