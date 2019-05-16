import TestUtils from 'textup-frontend/tests/helpers/utilities';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent(
  'record-actions-control/media-drawer',
  'Unit | Component | record actions control/media drawer',
  {
    unit: true,
  }
);

test('invalid inputs', function(assert) {
  const invalidMedia = ['not a MediaImage'];

  assert.throws(
    () =>
      this.subject({
        images: invalidMedia,
        audio: invalidMedia,
        doRegister: 88,
        onAddAudio: 88,
        onRemoveMedia: 88,
      }),
    TestUtils.ERROR_PROP_WRONG_TYPE,
    'images must be an array of MediaImages'
  );
});
