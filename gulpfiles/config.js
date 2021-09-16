import path from 'path';
import fs from 'fs';

//gulpを実行した時のワーキングディレクトリパス
const cd = process.cwd();
//ワーキングディレクトリのファイル一覧
const filenames = fs.readdirSync(cd);

//親ディレクトリ
let serverDirName = path.basename(path.join(__dirname, '../'));

//functions.phpの有無でWordPressか判定
const is_wp =
filenames.indexOf('functions.php') !== -1 &&
filenames.indexOf('style.css') !== -1;
if (is_wp) {
  serverDirName = path.basename(path.join(cd, '../../../'));
}

//各パス設定
export const paths = {
  serverDir: `localhost/${serverDirName}`,
  themeDir: path.join(__dirname, '../'),
  assetsDir: path.join(__dirname, '../assets'),
  jsSrcDir: path.join(__dirname, '../assets/js'),
  jsDistDir: path.join(__dirname, '../assets/dist'),
  sassDir: path.join(__dirname, '../assets/sass'),
  cssDir: path.join(__dirname, '../assets/css'),
  jsEntryFileName: 'entry.js',
};

//ファイルマッチパターン
export const globs = {
  html: `${paths.themeDir}*.html`,
  sass: `${paths.sassDir}/**/*.scss`,
  js: `${paths.jsSrcDir}/**/*.+(js|vue)`,
  entry: `${paths.jsSrcDir}/**/entry.js`,
};

const config = { paths, globs };
export default config;
