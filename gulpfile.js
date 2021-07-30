// let distFolder = require('path').basename(__dirname);
let distFolder = "dist";
let srcFolder = "#src";

let fs = require('fs');

let path = {
	dist: {
		html: distFolder + "/",
		css: distFolder + "/css/",
		js: distFolder + "/js/",
		img: distFolder + "/img/",
		fonts: distFolder + "/fonts/",
	},
	src: {
		html: srcFolder + "/*.html",
		scss: srcFolder + "/scss/#style.scss",
		js: srcFolder + "/**/*.js",
		img: srcFolder + "/img/*.{jpg,jpeg,png,svg,gif,ico,webp}",
		fonts: srcFolder + "/fonts/*.ttf",
	},
	watch: {
		html: srcFolder + "/**/*.html",
		scss: srcFolder + "/**/*.scss",
		js: srcFolder + "/**/*.js",
		img: srcFolder + "/**/*.{jpg,jpeg,png,svg,gif,ico,webp}",
	},
	del: "./" + distFolder + "/**"
}

const { src, dest, series, watch } = require('gulp');
const gulp = require('gulp');
const rename = require('gulp-rename');
const sync = require('browser-sync').create();
const sass = require('gulp-sass');
const groupmedia = require('gulp-group-css-media-queries');
const csso = require('gulp-csso');
const autoprefixer = require('gulp-autoprefixer');
const concat = require('gulp-concat');
const include = require('gulp-file-include');
const htmlmin = require('gulp-htmlmin');
const jsmin = require('gulp-uglify-es').default;
const imagemin = require('gulp-imagemin');
const ttf2woff = require('gulp-ttf2woff');
const ttf2woff2 = require('gulp-ttf2woff2');
const fonter = require('gulp-fonter');
const del = require('del');



function fonts() {
	del('./' + path.dist.fonts + '**')
	src(path.src.fonts)
		.pipe(ttf2woff())
		.pipe(dest(path.dist.fonts))
	return src(path.src.fonts)
		.pipe(ttf2woff2())
		.pipe(dest(path.dist.fonts))
}

gulp.task('otf2ttf', function () {
	return src([srcFolder + '/fonts/*.otf'])
		.pipe(fonter({
			formats: ['ttf']
		}))
		.pipe(dest([srcFolder + '/fonts/']))
})

function html() {
	return src(path.src.html)
		.pipe(include())
		.pipe(dest(path.dist.html))
}

function htmlMin() {
	return src(path.src.html)
		.pipe(include())
		.pipe(htmlmin({
			collapseWhitespace: true
		}))
		.pipe(rename({ suffix: '.min' }))
		.pipe(dest(path.dist.html))
}

function scss() {
	return src(path.src.scss)
		.pipe(rename(function (path) {
			path.basename = "style";
		}))
		.pipe(sass())
		.pipe(groupmedia())
		.pipe(autoprefixer({
			overrideBrowserslist: ['last 5 versions'],
			cascade: true
		}))
		.pipe(dest(path.dist.css))
}

function scssMin() {
	return src(path.src.scss)
		.pipe(rename(function (path) {
			path.basename = "style";
		}))
		.pipe(sass())
		.pipe(groupmedia())
		.pipe(autoprefixer({
			overrideBrowserslist: ['last 5 versions'],
			cascade: true
		}))
		.pipe(csso())
		.pipe(rename({ suffix: '.min' }))
		.pipe(dest(path.dist.css))
}

function js() {
	return src(path.src.js)
		.pipe(concat('script.js'))
		.pipe(dest(path.dist.js))
}

function jsMin() {
	return src(path.src.js)
		.pipe(concat('script.js'))
		.pipe(jsmin())
		.pipe(rename({ suffix: '.min' }))
		.pipe(dest(path.dist.js))
}

function img() {
	return src(path.src.img)
		.pipe(imagemin({
			progressive: true,
			svgoPlugins: [{ removeViewBox: false }],
			inerlaced: true,
			optimizationLevel: 3 // 0 to 7
		}))
		.pipe(dest(path.dist.img))
}

function clear() {
	// return del([distFolder + '/index.html', distFolder + '/index.min.html', path.dist.css, path.dist.img, path.dist.js])
	return del([path.dist.html + '*.html', path.dist.css, path.dist.img, path.dist.js])
}

function serve() {
	sync.init({
		server: "./" + distFolder
	})
	watch(path.watch.html, series(html)).on('change', sync.reload)
	watch(path.watch.scss, series(scss)).on('change', sync.reload)
	watch(path.watch.js, series(js)).on('change', sync.reload)
	watch(path.watch.img, series(img)).on('change', sync.reload)
}


let build = gulp.parallel(html, scss, img, js);
let min = gulp.parallel(htmlMin, scssMin, jsMin);

exports.html = html;
exports.scss = scss;
exports.fonts = fonts;
exports.img = img;
exports.build = series(clear, build, min, fonts);
exports.default = series(clear, build);
exports.serve = series(serve);
exports.clear = clear;