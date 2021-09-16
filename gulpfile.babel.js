import gulp from 'gulp';
import { watcher } from './gulpfiles/tasks/watch';
import { deleteCssDir, buildCss } from './gulpfiles/tasks/css';
import { deleteJsDistDir, buildJsAll } from './gulpfiles/tasks/js';
import { browsersync } from './gulpfiles/tasks/browsersync';

//Default
exports.default = gulp.series(watcher, browsersync);
//build CSS&JS
exports.build = gulp.series(
  deleteCssDir,
  deleteJsDistDir,
  buildCss,
  buildJsAll
  );
