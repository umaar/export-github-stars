const path = require('path');
const gulp = require('gulp');
const nodemon = require('gulp-nodemon');
const server = require('tiny-lr')();
const sass = require('gulp-sass');
const del = require('del');
const vinylPaths = require('vinyl-paths');
const sourcemaps = require('gulp-sourcemaps');
const rollup = require('rollup');
const rollupResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const revdel = require('gulp-rev-delete-original');
const rev = require('gulp-rev');
const {terser} = require('rollup-plugin-terser');

const paths = {
	copy: {
		input: [
			'src/client/*.*'
		],
		output: 'dist/'
	},
	copyVids: {
		input: [
			'src/client/vid/*.mp4'
		],
		output: 'dist/vid'
	},
	scripts: {
		input: [
			'src/client/js/*.js'
		],
		output: 'dist/js/'
	},
	styles: {
		input: [
			'src/client/css/*.scss'
		],
		output: 'dist/css/'
	},
	images: {
		input: [
			'src/client/img/**/*.jpg',
			'src/client/img/**/*.png',
			'src/client/img/**/*.svg'
		],
		output: 'dist/img/'
	},
	server: path.join('src', 'server', 'server.js')
};

const lrPort = 35729;

const nodemonConfig = {
	script: paths.server,
	ext: 'html js css md',
	ignore: [
		'node_modules',
		'src/client'
	],
	env: {
		NODE_ENV: 'development'
	},
	execMap: {
		js: 'node'
	}
};

gulp.task('clean', () => {
	return gulp.src('dist')
		.pipe(vinylPaths(del));
});

function watchFiles() {
	gulp.watch(paths.scripts.input);
	gulp.watch('src/client/css/**/*.scss', gulp.series(['clean:css', 'styles']));
	gulp.watch('src/client/js/**/*.js', gulp.series(['clean:js', 'scripts']));
	gulp.watch(paths.scripts.input, gulp.series(['scripts']));
}

gulp.task('styles', () => {
	return gulp.src(paths.styles.input, {base: './src/client'})
		.pipe(sourcemaps.init())
		.pipe(sass({
			outputStyle: 'compressed'
		}).on('error', sass.logError))
		.pipe(rev())
		.pipe(sourcemaps.write('./'))
	    .pipe(gulp.dest('./dist'))
	    .pipe(rev.manifest('dist/rev-manifest.json', {
	    	merge: true
	    }))
	    .pipe(gulp.dest('.'));
});

gulp.task('scripts', async () => {
	/*
		Warning: The numWorkers property in the code below stops this failing on my Linode
			- By default, rollup-plugin-terser spawns workers...
				... Defaults to the number of CPUs minus 1.
			- As a result, the bundle promise.write call would never resolve
	*/
	const bundle = await rollup.rollup({
		input: 'src/client/js/main.js',
		plugins: [
			rollupResolve(),
			commonjs(),
			// terser({
			// 	sourcemap: true,
			// 	numWorkers: 1
			// })
		]
	});

	await bundle.write({
		file: paths.scripts.output + '/main.js',
		format: 'iife',
		name: 'library',
		sourcemap: true
	});

	await new Promise(resolve => {
		 gulp.src(paths.scripts.output + '*', {
			base: 'dist'
		}).pipe(rev())
			.pipe(revdel())
			.pipe(gulp.dest('dist'))
			.pipe(rev.manifest('dist' + '/rev-manifest.json', {
				merge: true
			}))
			.pipe(gulp.dest('.'))
			.on('end', resolve);
	});
});

gulp.task('images', () => {
	return gulp.src(paths.images.input, {base: './src/client'})
		.pipe(rev())
	    .pipe(gulp.dest('./dist'))
	    .pipe(rev.manifest('dist/rev-manifest.json', {
	    	merge: true
	    }))
	    .pipe(gulp.dest('.'));
});

gulp.task('copy', () => {
	return gulp.src(paths.copy.input)
		.pipe(gulp.dest(paths.copy.output));
});

gulp.task('copy:vids', () => {
	return gulp.src(paths.copyVids.input)
		.pipe(gulp.dest(paths.copyVids.output));
});

gulp.task('clean:css', () => {
	return gulp.src('dist/css')
		.pipe(vinylPaths(del));
});

gulp.task('clean:js', () => {
	return gulp.src('dist/js')
		.pipe(vinylPaths(del));
});

gulp.task('lr', done => {
	server.listen(lrPort, err => {
		if (err) {
			console.error(err);
			throw new Error('Error with the Live Reload Task ', err);
		} else {
			done();
		}
	});
});

gulp.task('nodemon', done => {
	return nodemon({
		...nodemonConfig,
		done
	});
});

gulp.task('watch', gulp.parallel([watchFiles]))

gulp.task('default', gulp.series([
	'clean',
	'styles',
	'scripts',
	'images',
	'copy',
	'copy:vids',
	'lr',
	'nodemon',
	'watch'
]));

gulp.task('build', gulp.series([
	'clean',
	'styles',
	'scripts',
	'images',
	'copy',
	'copy:vids'
]));
