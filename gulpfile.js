const { series, src, dest } = require('gulp');

// Build icons for node
function buildIcons() {
  return src('./nodes/**/*.svg')
    .pipe(dest('./dist/nodes/'));
}

exports['build:icons'] = buildIcons;
