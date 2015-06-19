var gulp = require('gulp'),
	shell = require('gulp-shell'),
	pack = require('./package.json'),
	MAIN_FILE = 'JsonSchema',
	BUILD_PATH = 'build';

function browserify(args) {
	args = args || {};
	var getFileName = function(filename) {
		var fName = [filename || "", 'js'].join('.')
			return [__dirname, fName].join('/');
		},
		cmd = 'browserify %path > %dest'
		.replace('%path', getFileName(args.path))
		.replace('%dest', getFileName(args.dest));
	shell.task([cmd])();
}

gulp.task('browserify-angular', function(){
	var sourcePath = [BUILD_PATH, 'adapters/angular'].join('/'),
		destFile = [pack.name, 'angular'].join('.');
	browserify({path: sourcePath, dest: [BUILD_PATH, destFile].join('/')});
});