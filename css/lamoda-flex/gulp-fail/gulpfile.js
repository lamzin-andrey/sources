/*if (process.argv[2] == '--local') {
    process.env.DISABLE_NOTIFIER = true;
}*/
var elixir = require('laravel-elixir');
require("laravel-elixir-webpack");
/*
 |--------------------------------------------------------------------------
 | Elixir Asset Management
 |--------------------------------------------------------------------------
 |
 | Elixir provides a clean, fluent API for defining some basic Gulp tasks
 | for your Laravel application. By default, we are compiling the Sass
 | file for our application, as well as publishing vendor resources.
 |
 */

//elixir.config.sourcemaps = false;

elixir(function(mix) {
    mix.sass(['./assets/sass/main.scss'], 'css/min.css');
   
    //новая тема
    
    /** Склеим несколько уже минимизированых скриптов */
    /*mix.combine([
			'./public/js/jQuery.min.js',
			'./public/js/tether.min.js'
		],
    
	'./public/js/out.js');*/
	
	/** Используем для минимизации и перегона в один файл  */
    /*mix.scripts([
			'./public/js/bootstrap-datepicker.js',
			'./public/js/timepicker.js'
		],
	'./public/js/modern/out2.js');*/
	
	
	
	/** Используем для перегона в es5 */
	/*mix.babel([
		'./public/js/s/ccardpayment.es6.js',
		'./public/js/s/crfi18.es6.js',
		'./public/js/s/cpaybox.es6.js',
		'./public/js/s/ccart18.es6.js'
	],
	'./public/js/s/out3.js'		
	);*/
	
});
