import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import MediaElement from 'textup-frontend/models/media-element';
import wait from 'ember-test-helpers/wait';
import { moduleForComponent, test } from 'ember-qunit';
import {
  mockInvalidMediaImage,
  mockValidMediaImage,
  mockValidMediaAudio,
} from 'textup-frontend/tests/helpers/utilities';

const { typeOf } = Ember;

moduleForComponent('image-stack', 'Integration | Component | image stack', {
  integration: true,
  beforeEach() {
    this.inject.service('store');
  },
});

test('inputs', function(assert) {
  const itemClass = 'image-stack-test-inputs';

  this.render(hbs`{{image-stack}}`);

  assert.ok(this.$('.image-stack').length, 'images can be null');

  this.setProperties({ images: [], itemClass });
  this.render(hbs`{{image-stack images=images itemClass=itemClass}}`);

  const $el = this.$('.image-stack');
  assert.ok($el.length, 'has rendered');
  assert.notOk($el.hasClass('image-stack--multiple'), 'does NOT have multiple images');
  assert.equal(this.$(`.${itemClass}`).length, 1);

  this.set('images', [mockValidMediaImage(this.store), mockValidMediaImage(this.store)]);

  assert.ok($el.hasClass('image-stack'));
  assert.ok($el.hasClass('image-stack--multiple'), 'DOES have multiple images');
  assert.equal(this.$(`.${itemClass}`).length, 1);
});

test('ignoring non-image media elements', function(assert) {
  const image = mockValidMediaImage(this.store),
    audio = mockValidMediaAudio(this.store);
  this.setProperties({ onlyImage: [image], bothTypes: [audio, image] });

  this.render(hbs`{{image-stack images=onlyImage}}`);

  assert.ok(this.$('.image-stack').length, 'did render');
  assert.notOk(this.$('.image-stack--multiple').length);

  this.render(hbs`{{image-stack images=bothTypes}}`);

  assert.ok(this.$('.image-stack').length, 'did render');
  assert.notOk(this.$('.image-stack--multiple').length);
});

test('successfully loading an image', function(assert) {
  const done = assert.async(1),
    mockImage = mockValidMediaImage(this.store),
    onLoadEnd = results => {
      assert.equal(typeOf(results), 'object');
      assert.equal(Object.keys(results).length, 1);
      assert.equal(results[mockImage.get(Constants.PROP_NAME.MEDIA_ID)], true);

      assert.ok(this.$('.image-stack__preview__count').length);
      assert.ok(
        this.$('.image-stack__preview__count')
          .text()
          .indexOf(this.get('images.length')) > -1
      );

      done();
    };

  this.setProperties({ images: [mockImage], onLoadEnd });

  this.render(hbs`{{image-stack images=images onLoadEnd=onLoadEnd}}`);
});

test('failing to load image', function(assert) {
  const done = assert.async(1),
    mockImage = mockInvalidMediaImage(this.store),
    onLoadEnd = results => {
      assert.equal(typeOf(results), 'object');
      assert.equal(Object.keys(results).length, 1, 'only try the first image');
      assert.equal(results[mockImage.get(Constants.PROP_NAME.MEDIA_ID)], false);

      assert.ok(this.$('.image-stack__preview__count').length);
      assert.ok(
        this.$('.image-stack__preview__count')
          .text()
          .indexOf(this.get('images.length')) > -1
      );

      done();
    };

  this.setProperties({
    images: [mockImage, mockValidMediaImage(this.store), mockValidMediaImage(this.store)],
    onLoadEnd,
  });

  this.render(hbs`{{image-stack images=images onLoadEnd=onLoadEnd}}`);
});

test('rendering block form', function(assert) {
  const testClassName = 'image-stack-block-form',
    images = Array(3)
      .fill()
      .map(() => mockValidMediaImage(this.store)),
    done = assert.async(),
    onClick = clickedImage => {
      assert.ok(clickedImage instanceof MediaElement);
      assert.deepEqual(clickedImage, images.get('firstObject'));
      done();
    };

  this.setProperties({ images, testClassName, onClick });

  this.render(hbs`
    {{#image-stack images=images as |image|}}
      <span class="{{testClassName}}" onclick={{action onClick image}}></span>
    {{/image-stack}}
  `);

  assert.equal(
    this.$(`.${testClassName}`).length,
    1,
    'image stack only renders one image as the cover'
  );

  this.$(`.${testClassName}`)
    .first()
    .triggerHandler('click');
});

test('opening gallery when selecting item on top of stack', function(assert) {
  const itemClass = 'image-stack-test-inputs',
    done = assert.async();

  this.setProperties({ images: [mockValidMediaImage(this.store)], itemClass });
  this.render(hbs`{{image-stack images=images itemClass=itemClass}}`);

  assert.ok(this.$('.image-stack').length, 'component did render');
  assert.equal(this.$(`.${itemClass}`).length, 1, 'nested item did render');
  assert.equal(Ember.$('.pswp').length, 1, 'gallery did render');
  assert.notOk(Ember.$('.pswp--open').length, 'gallery is not open');

  this.$(`.${itemClass}`)
    .first()
    .triggerHandler('click');

  wait().then(() => {
    assert.equal(Ember.$('.pswp--open').length, 1, 'gallery is open');

    done();
  });
});
