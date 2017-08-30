var gulp = require('gulp');
var concat = require('gulp-concat');
var cleanCSS = require('gulp-clean-css');
var minifyJS = require('gulp-minify');

gulp.task('scripts',function(){
	return gulp.src(['./public/scripts/jquery-3.2.1.js','./public/scripts/angular.min.js','./public/scripts/angular-ui-router.min.js','./public/app.js','./public/app/app.controller.js','./public/scripts/test-offline.js','./public/scripts/signature.js']).pipe(concat('app.js')).pipe(gulp.dest('./public/dist'));
});

gulp.task('styles',function(){
	return gulp.src(['./public/styles/bootstrap.min.css','./public/styles/app.styles.css','./public/styles/animate.min.css']).pipe(concat('app.css')).pipe(gulp.dest('./public/dist'));
});

gulp.task('minifyCSS',function(){
	return gulp.src('./public/dist/app.css').pipe(cleanCSS()).pipe(gulp.dest('./public/dist'));
});

gulp.task('minifyJS',function(){
	return gulp.src('./public/dist/app.js').pipe(minifyJS()).pipe(gulp.dest('./public/dest'));
});


gulp.task('default',['scripts','styles','minifyCSS','minifyJS'],function(){
	console.log('Defaut Task');
});