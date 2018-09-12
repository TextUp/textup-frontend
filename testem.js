/*jshint node:true*/
module.exports = {
  framework: 'qunit',
  test_page: 'tests/index.html',
  disable_watching: true,
  launch_in_ci: ['Chrome'],
  launch_in_dev: ['Chrome'],
  // from https://embermap.com/notes/59-ember-tests-with-headless-chrome
  // and https://github.com/testem/testem/blob/master/docs/browser_args.md
  browser_args: {
    Chrome: {
      all: ['--no-default-browser-check'],
      dev: ['--auto-open-devtools-for-tabs'],
      ci: ['--headless', '--disable-gpu', '--remote-debugging-port=9222', '--window-size=1440,900']
    }
  }
};
