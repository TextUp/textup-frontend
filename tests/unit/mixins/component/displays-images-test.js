import { getOwner } from '@ember/application';
import Component from '@ember/component';
import ComponentDisplaysImagesMixin from 'textup-frontend/mixins/component/displays-images';
import { mockValidMediaImage } from 'textup-frontend/tests/helpers/utilities';
import { moduleFor, test } from 'ember-qunit';

const componentName = 'displays-images-test-component';

moduleFor('mixin:component/displays-images', 'Unit | Mixin | component/displays images', {
  needs: ['model:media-element', 'model:media-element-version'],
  beforeEach() {
    this.register(
      `component:${componentName}`,
      Component.extend(ComponentDisplaysImagesMixin)
    );
    this.inject.service('store');
  },
});

test('validating input props', function(assert) {
  const ComponentDisplaysImagesFactory = getOwner(this).factoryFor(
    `component:${componentName}`
  );

  assert.ok(ComponentDisplaysImagesFactory.create(), 'images can be null');
  assert.throws(
    () => ComponentDisplaysImagesFactory.create({ images: 'not an array' }),
    'if images specified, must pass in MediaObject in an array'
  );
  assert.throws(
    () => ComponentDisplaysImagesFactory.create({ images: [1, 2, 3] }),
    'if images specified, must pass in MediaObject in an array'
  );
  assert.ok(ComponentDisplaysImagesFactory.create({ images: [] }), 'images array can be empty');
  assert.ok(ComponentDisplaysImagesFactory.create({ images: [mockValidMediaImage(this.store)] }));

  assert.throws(
    () =>
      ComponentDisplaysImagesFactory.create({
        images: [mockValidMediaImage(this.store)],
        onLoadEnd: 'not a function',
      }),
    'onLoadEnd must be a function'
  );
  assert.ok(
    ComponentDisplaysImagesFactory.create({
      images: [mockValidMediaImage(this.store)],
      onLoadEnd: () => {
        return {};
      },
    })
  );
});
