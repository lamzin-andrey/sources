function onLoadSpinner() {
	window.spinner = new A2Spinner();
	window.spinner.init(100, 255, 10, onChangeSpinner);
}

function onChangeSpinner(v, w) {
	console.log('v = ' + v + ', w = ' + w);
}

window.addEventListener('load', onLoadSpinner);
