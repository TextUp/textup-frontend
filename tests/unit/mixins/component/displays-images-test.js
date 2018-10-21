import ComponentDisplaysImagesMixin from 'textup-frontend/mixins/component/displays-images';
import Ember from 'ember';
import { mockValidMediaImage } from 'textup-frontend/tests/helpers/utilities';
import { moduleFor, test } from 'ember-qunit';

moduleFor('mixin:component/displays-images', 'Unit | Mixin | component/displays images', {
  needs: ['model:media-element', 'model:media-element-version']
});

test('validating input props', function(assert) {
  const store = Ember.getOwner(this).lookup('service:store'),
    ComponentDisplaysImagesObject = Ember.Component.extend(ComponentDisplaysImagesMixin);

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
  assert.ok(ComponentDisplaysImagesObject.create({ images: [mockValidMediaImage(store)] }));

  assert.throws(
    () =>
      ComponentDisplaysImagesObject.create({
        images: [mockValidMediaImage(store)],
        onLoadEnd: 'not a function'
      }),
    'onLoadEnd must be a function'
  );
  assert.ok(
    ComponentDisplaysImagesObject.create({
      images: [mockValidMediaImage(store)],
      onLoadEnd: () => {}
    })
  );
});
