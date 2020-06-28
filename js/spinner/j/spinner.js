function A2Spinner() {
}
/**
 * @param {Number} val
 * @param {Number} max
 * @param {Number} min
 * @param {Function} listener
 * @param {Object} context
*/
A2Spinner.prototype.init = function(val, max, min, listener, context) {
	var bMinus, bPlus, self = this;
	this.v = val;
	this.max = max;
	this.min = min;
	this.listener = listener;
	this.context = context;
	
	this.isTimerRun = false;
	this.ival = null;
	
	bMinus = this.bMinus = document.getElementById('bMinus');
	bPlus = this.bPlus  = document.getElementById('bPlus');
	this.hSpinnerPbar  = document.getElementById('hSpinnerPbar');
	this.setView(val);
	
	bMinus.addEventListener('touchstart', function(e) { return self.onDownMinus(e) });
	bMinus.addEventListener('touchend', function(e) { return self.onUpKey(e) });
	
	bPlus.addEventListener('touchstart', function(e) { return self.onDownPlus(e) });
	bPlus.addEventListener('touchend', function(e) { return self.onUpKey(e) });
}

A2Spinner.prototype.onDownPlus = function(evt) {
	this.clearInterval();
	this.direct = 3;
	this.onDownKey(evt);
}

A2Spinner.prototype.onDownMinus = function(evt) {
	this.clearInterval();
	this.direct = -3;
	this.onDownKey(evt);
}

A2Spinner.prototype.onDownKey = function(evt) {
	evt.preventDefault();
	this.startTimerValue = this.v;
	var self = this;
	this.isTimerRun = true;
	this.ival = setInterval(function () {
		self.onTick();
	}, 10);
}

A2Spinner.prototype.onUpKey = function(evt) {
	this.clearInterval();
	if (this.startTimerValue == this.v) {
		this.doChange();
	}
}
A2Spinner.prototype.clearInterval = function() {
	clearInterval(this.ival);
	this.isTimerRun = false;
}
A2Spinner.prototype.onTick = function() {
	this.doChange();
}

A2Spinner.prototype.doChange = function() {
	var prev = this.v,
		v = prev;
	v += this.direct;
	if (v > this.max) {
		v = this.max;
	}
	if (v < this.min) {
		v = this.min;
	}
	this.v = v;
	this.setView(v);
}

A2Spinner.prototype.setView = function(v) {
	var total = this.max - this.min,
		p1 = total / 100,
		curr = v - this.min,
		w = curr / p1;
	this.hSpinnerPbar.style.width = w + 'px';
	
	if (this.context) {
		this.listener.call(this.context, v, w);
	} else {
		this.listener(v, w);
	}
}
