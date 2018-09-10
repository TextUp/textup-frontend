import ComponentDisplaysImagesMixin from 'textup-frontend/mixins/component/displays-images';
import Ember from 'ember';
import { mockValidMediaImage } from '../../../helpers/utilities';
import { module, test } from 'qunit';

module('Unit | Mixin | component/displays images');

test('validating input props', function(assert) {
  const ComponentDisplaysImagesObject = Ember.Component.extend(ComponentDisplaysImagesMixin);

  assert.ok(ComponentDisplaysImagesObject.create(), 'images can be null');
  assert.throws(
    () => ComponentDisplaysImagesObject.create({ images: 'not an array' }),
    'if images specified, must pass in MediaObject in an array'
  );
  assert.throws(
    () => ComponentDisplaysImagesObject.create({ images: [1, 2, 3] }),
    'if images specified, must pass in MediaObject in an array'
  );
  assert.ok(ComponentDisplaysImagesObject.create({ images: [] }), 'images array can be empty');
  assert.ok(ComponentDisplaysImagesObject.create({ images: [mockValidMediaImage()] }));

  assert.throws(
    () =>
      ComponentDisplaysImagesObject.create({
        images: [mockValidMediaImage()],
        onLoadEnd: 'not a function'
      }),
    'onLoadEnd must be a function'
  );
  assert.ok(
    ComponentDisplaysImagesObject.create({ images: [mockValidMediaImage()], onLoadEnd: () => {} })
  );
});
