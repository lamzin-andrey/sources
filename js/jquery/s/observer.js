/** @class Subject Класс Субъект */
function Subject() {}
Subject.prototype.observers = [];
Subject.prototype.attach = function(observer) {
  this.observers.push(observer);
}
Subject.prototype.detach = function(observer) {
  var i = this.observers.length, copy = [];
  while (i--) {
    if (this.observers[i] != observer) {
      copy.push(this.observers[i]);
    }
  }
  this.observers = copy;
}
Subject.prototype.notify = function() {
  var i = this.observers.length;
  while (i--) {
    this.observers[i].update();
  }
}

/** @class Observer Класс Наблюдатель */
function Observer() {}
//Обновляет состояние
Observer.prototype.update = function() {}
