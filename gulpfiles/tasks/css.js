import gulp from 'gulp';
const sass = require('gulp-sass')(require('sass'));
//エラーでgulpが終了するのを止める
import plumber from 'gulp-plumber';
//デスクトップ通知
import notify from 'gulp-notify';
//小さい画像をbase64に変換
import base64 from 'gulp-base64';
//PostCss
import postcss from 'gulp-postcss';
import cssImport from 'postcss-import';
import autoprefixer from 'autoprefixer';
//flexboxのバグを自動修正
import flexBugsFixes from 'postcss-flexbugs-fixes';
//ファイル名から画像パスやサイズを取得
import assets from 'postcss-assets';
//メディアクエリを整理する
import mqpacker from 'css-mqpacker';
//cssを圧縮する
import csso from 'gulp-csso';
//config
import { paths, globs } from '../config';
import progeny from 'gulp-progeny';
import browserSync from 'browser-sync';
//ファイル削除
import del from 'del';

//出力済みファイルを削除
function deleteCssDir(done) {
  return del([paths.cssDir], done);
}
exports.deleteCssDir = deleteCssDir;

const processors = [
assets({
  baseUrl: `${paths.serverDir}/`,
  basePath: paths.themeDir,
  loadPaths: ['assets/images/'],
  relative: true,
  cachebuster: true,
}),
autoprefixer({
  cascade: false,
  grid: true,
}),
mqpacker({
  sort: true,
}),
flexBugsFixes,
cssImport({
  path: ['node_modules'],
}),
];

function buildCss() {
  return gulp
  .src(globs.sass, {
    allowEmpty: true,
    sourcemaps: true,
  })
  .pipe(
    plumber({
      errorHandler: notify.onError('<%= error.message %>'),
    })
    )
  .pipe(progeny())
  .pipe(
    sass({
      outputStyle: 'expanded',
    })
    )
  .pipe(
    base64({
      baseDir: paths.imageDir,
      extensions: ['svg', 'png', /\.jpg#datauri$/i],
      exclude: [/\.server\.(com|net)\/dynamic\//, '--live.jpg'],
      maxImageSize: 8 * 1024,
      debug: true,
    })
    )
  .pipe(postcss(processors))
  .pipe(
    csso({
      restructure: false,
      sourceMap: false,
      debug: true,
    })
    )
  .pipe(
    gulp.dest(paths.cssDir, {
      sourcemaps: '.',
    })
    )
  .pipe(notify('buildCss finished'))
  .pipe(
    browserSync.reload({
      stream: true,
    })
    );
}
exports.buildCss = buildCss;
