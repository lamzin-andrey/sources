let mix = require('laravel-mix');
//let minifier = require('minifier');
/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for the application as well as bundling up all the JS files.
 |
 */
//example js
//mix.js('sources/admin/vue/js/app.js', 'a.js');


//-------

// "gulp": "^3.9.1" cскорее всего лишнее
// "minifier": "^1.0.0" например так

mix.sass('assets/sass/main.scss', 'css/o.css', {
    outputStyle: 'nested'
});
/*
mix.then(() => {
    minifier.minify('css/o.css')
});
*/
