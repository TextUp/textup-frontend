import ComponentDisplaysImagesMixin from 'textup-frontend/mixins/component/displays-images';
import Ember from 'ember';
import { mockValidMediaImage } from '../../../helpers/utilities';
import { module, test } from 'qunit';

module('Unit | Mixin | component/displays images');

test('validating input props', function(assert) {
  const ComponentDisplaysImagesObject = Ember.Component.extend(ComponentDisplaysImagesMixin);

  assert.throws(
    () => ComponentDisplaysImagesObject.create(),
    'must pass in MediaObject in an array'
  );
  assert.throws(
    () => ComponentDisplaysImagesObject.create({ images: 'not an array' }),
    'must pass in MediaObject in an array'
  );
  assert.throws(
    () => ComponentDisplaysImagesObject.create({ images: [1, 2, 3] }),
    'must pass in MediaObject in an array'
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
