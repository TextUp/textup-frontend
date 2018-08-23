import * as PhotoUtils from 'textup-frontend/utils/photo';
import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { MediaImage } from 'textup-frontend/objects/media-image';
import { mockValidMediaImage } from '../../helpers/utilities';
import { moduleForComponent, test } from 'ember-qunit';

const { run } = Ember;

moduleForComponent('photo-control', 'Integration | Component | photo control', {
  integration: true
});

test('inputs', function(assert) {
  assert.throws(() => this.render(hbs`{{photo-control}}`), 'requires images');

  this.set('images', []);
  this.render(hbs`{{photo-control images=images}}`);

  assert.ok(this.$('.photo-control').length, 'images can be an empty array');

  this.setProperties({ images: [], onAdd: () => {}, onRemove: () => {} });
  this.render(hbs`{{photo-control images=images onAdd=onAdd onRemove=onRemove}}`);

  assert.ok(this.$('.photo-control').length);

  this.setProperties({ images: [], onAdd: 'not a function', onRemove: 'not a function' });

  assert.throws(
    () => this.render(hbs`{{photo-control images=images onAdd=onAdd onRemove=onRemove}}`),
    'add and removing handlers must be functions'
  );
});

test('changing image display type', function(assert) {
  const constants = this.container.lookup('service:constants');

  this.setProperties({ images: [] });
  this.render(hbs`{{photo-control images=images}}`);

  assert.ok(this.$('.photo-control').length);
  assert.ok(this.$('.image-stack').length, 'default is image stack');
  assert.notOk(this.$('.image-grid').length, 'default is image stack');

  this.setProperties({ images: [], display: constants.PHOTO_CONTROL.DISPLAY.GRID });
  this.render(hbs`{{photo-control images=images imageDisplayComponent=display}}`);

  assert.ok(this.$('.photo-control').length);
  assert.notOk(this.$('.image-stack').length, 'can specify image grid');
  assert.ok(this.$('.image-grid').length, 'can specify image grid');

  this.setProperties({ images: [], invalidDisplay: 'not recognized value' });

  assert.throws(
    () => this.render(hbs`{{photo-control images=images imageDisplayComponent=invalidDisplay}}`),
    'throws error when display is an invalid value'
  );
});

test('displaying images', function(assert) {
  const constants = this.container.lookup('service:constants'),
    images = Array(3)
      .fill()
      .map(() => mockValidMediaImage());

  this.setProperties({ images });
  this.render(hbs`{{photo-control images=images}}`);

  assert.ok(this.$('.photo-control').length);
  assert.ok(this.$('.image-stack').length, 'default is image stack');
  assert.equal(this.$('.photo-control__item').length, 1, 'displays only one image');

  this.setProperties({ images, display: constants.PHOTO_CONTROL.DISPLAY.GRID });
  this.render(hbs`{{photo-control images=images imageDisplayComponent=display}}`);

  assert.ok(this.$('.photo-control').length);
  assert.ok(this.$('.image-grid').length, 'switched to grid display');
  assert.equal(this.$('.photo-control__item').length, images.length, 'grid displays all images');
});

test('adding images', function(assert) {
  const images = Array(3)
      .fill()
      .map(() => mockValidMediaImage()),
    done = assert.async(),
    onAdd = sinon.spy(),
    extractStub = sinon.stub(PhotoUtils, 'extractImagesFromEvent'),
    randValue1 = Math.random();
  extractStub.callsFake(() => new Ember.RSVP.Promise(resolve => resolve(randValue1)));

  this.setProperties({ images, onAdd });
  this.render(hbs`{{photo-control images=images onAdd=onAdd}}`);

  assert.ok(this.$('.photo-control').length, 'did render');
  assert.ok(this.$('.photo-control__add').length, 'add control did render');

  run(() => {
    this.$('.photo-control__add input').change();

    wait().then(() => {
      assert.ok(
        extractStub.calledOnce,
        'extract called in add component, stubbed to return success'
      );
      assert.ok(onAdd.calledOnce, 'add handler is called on success');

      extractStub.restore();
      done();
    });
  });
});

test('removing images', function(assert) {
  const constants = this.container.lookup('service:constants'),
    images = Array(3)
      .fill()
      .map(() => mockValidMediaImage()),
    done = assert.async(),
    onRemove = sinon.spy();

  this.setProperties({ images, onRemove, display: constants.PHOTO_CONTROL.DISPLAY.STACK });
  this.render(hbs`{{photo-control images=images onRemove=onRemove imageDisplayComponent=display}}`);

  assert.ok(this.$('.photo-control').length, 'did render');
  assert.ok(this.$('.image-stack').length, 'did render image stack');
  assert.equal(
    this.$('.photo-control__remove').length,
    1,
    'one remove control for the one item displayed by image stack'
  );

  this.$('.photo-control__remove').triggerHandler('click');

  wait()
    .then(() => {
      assert.ok(onRemove.calledOnce, 'remove handler called');
      assert.equal(onRemove.getCall(0).args.length, 3, 'passed three args');
      assert.ok(onRemove.getCall(0).args[0] instanceof MediaImage, 'first arg is media image');
      assert.notOk(
        onRemove.getCall(0).args[1],
        'second arg is supposed to index, but missing for image stack'
      );

      this.set('display', constants.PHOTO_CONTROL.DISPLAY.GRID);

      assert.ok(this.$('.image-grid').length, 'did render image grid');
      assert.equal(
        this.$('.photo-control__remove').length,
        images.length,
        'one remove control for each of the items rendered by image grid'
      );

      this.$('.photo-control__remove')
        .eq(images.length - 1)
        .triggerHandler('click');

      return wait();
    })
    .then(() => {
      assert.ok(onRemove.calledTwice, 'remove handler called');
      assert.equal(onRemove.getCall(1).args.length, 3, 'passed three args');
      assert.ok(onRemove.getCall(1).args[0] instanceof MediaImage, 'first arg is media image');
      assert.equal(
        onRemove.getCall(1).args[1],
        images.length - 1,
        'second arg is index of item to remove'
      );

      done();
    });
});

test('readOnly mode', function(assert) {
  const constants = this.container.lookup('service:constants'),
    images = Array(3)
      .fill()
      .map(() => mockValidMediaImage());

  this.setProperties({ images, readOnly: true, display: constants.PHOTO_CONTROL.DISPLAY.STACK });
  this.render(hbs`{{photo-control images=images readOnly=readOnly imageDisplayComponent=display}}`);

  assert.ok(this.$('.photo-control').length, 'did render');
  assert.ok(this.$('.image-stack').length, 'did render image stack');
  assert.notOk(this.$('.photo-control__remove').length, 'no remove controls rendered');
  assert.notOk(this.$('.photo-control__add').length, 'no add controls rendered');

  this.set('display', constants.PHOTO_CONTROL.DISPLAY.GRID);

  assert.ok(this.$('.image-grid').length, 'did render image grid');
  assert.notOk(this.$('.photo-control__remove').length, 'no remove controls rendered');
  assert.notOk(this.$('.photo-control__add').length, 'no add controls rendered');
});
