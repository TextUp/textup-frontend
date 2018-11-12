import { contrastColor } from 'textup-frontend/helpers/contrast-color';
import { module, test } from 'qunit';

module('Unit | Helper | contrast color');

test('getting contrasting color', function(assert) {
  assert.throws(() => contrastColor());

  assert.equal(contrastColor([88]), null);
  assert.equal(contrastColor(['not a valid color']), null);

  assert.equal(contrastColor(['#ffffff']), '#808080');
  assert.equal(contrastColor(['rgb(255, 255, 255)']), 'rgb(128, 128, 128)');
});
