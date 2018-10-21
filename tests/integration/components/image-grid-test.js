import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import MediaElement from 'textup-frontend/models/media-element';
import wait from 'ember-test-helpers/wait';
import { MEDIA_ID_PROP_NAME } from 'textup-frontend/models/media';
import { moduleForComponent, test } from 'ember-qunit';
import {
  mockInvalidMediaImage,
  mockValidMediaImage
} from 'textup-frontend/tests/helpers/utilities';

const { typeOf } = Ember;

moduleForComponent('image-grid', 'Integration | Component | image grid', {
  integration: true
});

test('inputs', function(assert) {
  this.render(hbs`{{image-grid}}`);

  assert.ok(this.$('.image-grid').length, 'has rendered, images can be null');

  this.set('images', []);
  this.render(hbs`{{image-grid images=images}}`);

  assert.ok(this.$('.image-grid').length, 'has rendered, images can be an empty array');
  assert.ok(this.$('.image-grid--none').length, 'no items has none class applied');
});

test('loading and reloading several images', function(assert) {
  const store = Ember.getOwner(this).lookup('service:store'),
    done = assert.async(1),
    validImages = Array(8)
      .fill()
      .map(() => mockValidMediaImage(store)),
    validImages2 = Array(2)
      .fill()
      .map(() => mockValidMediaImage(store)),
    invalidImages = Array(3)
      .fill()
      .map(() => mockInvalidMediaImage(store)),
    onLoadEnd = results => {
      assert.equal(typeOf(results), 'object');
      assert.equal(
        Object.keys(results).length,
        validImages.length + invalidImages.length,
        'try all images'
      );
      validImages.forEach(img => assert.equal(results[img.get(MEDIA_ID_PROP_NAME)], true));
      invalidImages.forEach(img => assert.equal(results[img.get(MEDIA_ID_PROP_NAME)], false));

      // load 2
      this.setProperties({
        images: [].pushObjects(validImages2).pushObjects(invalidImages),
        onLoadEnd: onLoadEnd2
      });
      this.render(hbs`{{image-grid images=images onLoadEnd=onLoadEnd}}`);
    },
    onLoadEnd2 = results => {
      assert.equal(typeOf(results), 'object');
      assert.equal(
        Object.keys(results).length,
        validImages2.length + invalidImages.length,
        'return results for all images, even ones that were already tried'
      );
      validImages2.forEach(img => assert.equal(results[img.get(MEDIA_ID_PROP_NAME)], true));
      invalidImages.forEach(img => assert.equal(results[img.get(MEDIA_ID_PROP_NAME)], false));

      done();
    };

  // load 1
  this.setProperties({ images: [].pushObjects(validImages).pushObjects(invalidImages), onLoadEnd });
  this.render(hbs`{{image-grid images=images onLoadEnd=onLoadEnd}}`);
});

test('rendering block form', function(assert) {
  const store = Ember.getOwner(this).lookup('service:store'),
    testClassName = 'image-grid-block-form',
    itemClassName = 'image-grid-item-class-test',
    images = Array(5)
      .fill()
      .map(() => mockValidMediaImage(store)),
    done = assert.async(images.length),
    onClick = (clickedImage, index) => {
      assert.ok(clickedImage instanceof MediaElement);
      assert.deepEqual(clickedImage, images.objectAt(index));
      done();
    };

  this.setProperties({ images, testClassName, itemClassName, onClick });

  this.render(hbs`
    {{#image-grid images=images itemClass=itemClassName as |image index|}}
      <span class="{{testClassName}}" onclick={{action onClick image index}}></span>
    {{/image-grid}}
  `);

  assert.equal(
    this.$(`.${testClassName}`).length,
    images.length,
    'image grid renders all images and renders nested block for each image'
  );
  assert.equal(this.$(`.${itemClassName}`).length, images.length, 'item class is properly applied');

  this.$(`.${testClassName}`).click();
});

test('opening gallery when selecting any of the items in the grid', function(assert) {
  const store = Ember.getOwner(this).lookup('service:store'),
    itemClass = 'image-grid-test-inputs',
    images = Array(8)
      .fill()
      .map(() => mockValidMediaImage(store)),
    done = assert.async();

  this.setProperties({ images, itemClass });
  this.render(hbs`{{image-grid images=images itemClass=itemClass}}`);

  assert.ok(this.$('.image-grid').length, 'component did render');
  assert.equal(this.$(`.${itemClass}`).length, images.length);
  assert.equal(Ember.$('.pswp').length, 1, 'gallery did render');
  assert.notOk(Ember.$('.pswp--open').length, 'gallery is not open');

  this.$(`.${itemClass}`)
    .eq(images.length - 1) // click on last object
    .triggerHandler('click');

  wait().then(() => {
    assert.equal(Ember.$('.pswp--open').length, 1, 'gallery is open');

    done();
  });
});
