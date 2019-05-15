/* eslint-env node */
module.exports = {
  framework: 'qunit',
  test_page: 'tests/index.html?hidepassed',
  disable_watching: true,
  launch_in_ci: ['Chrome'],
  launch_in_dev: ['Chrome'],
  // from https://embermap.com/notes/64-our-testem-config
  browser_args: {
    Chrome: [
      '--headless',
      '--disable-gpu',
      '--remote-debugging-port=9222',
      '--window-size=1440,900',
      // see https://stackoverflow.com/a/28268629
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
    ],
  },
};
