import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import MediaElement from 'textup-frontend/models/media-element';
import PhotoUtils from 'textup-frontend/utils/photo';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { mockValidMediaImage } from 'textup-frontend/tests/helpers/utilities';
import { moduleForComponent, test } from 'ember-qunit';

const { run } = Ember;

moduleForComponent('photo-control', 'Integration | Component | photo control', {
  integration: true,
});

test('inputs + rendering', function(assert) {
  const addComponentClass = `${Math.random()}`;

  this.render(hbs`{{photo-control}}`);

  assert.ok(this.$('.photo-control').length, 'images can be null');

  this.set('images', []);
  this.render(hbs`{{photo-control images=images}}`);

  assert.ok(this.$('.photo-control').length, 'images can be an empty array');

  this.setProperties({ images: [], onAdd: () => {}, onRemove: () => {}, addComponentClass });
  this.render(hbs`
    {{photo-control images=images
      addComponentClass=addComponentClass
      onAdd=onAdd
      onRemove=onRemove}}
  `);

  assert.ok(this.$('.photo-control').length);
  assert.ok(this.$(`.photo-control .${addComponentClass}`));

  this.setProperties({ images: [], onAdd: 'not a function', onRemove: 'not a function' });

  assert.throws(
    () =>
      this.render(
        hbs`{{photo-control images=images addComponentClass=88 onAdd=onAdd onRemove=onRemove}}`
      ),
    'add and removing handlers must be functions'
  );
});

test('changing image display type', function(assert) {
  this.setProperties({ images: [] });
  this.render(hbs`{{photo-control images=images}}`);

  assert.ok(this.$('.photo-control').length);
  assert.ok(this.$('.image-stack').length, 'default is image stack');
  assert.notOk(this.$('.image-grid').length, 'default is image stack');

  this.setProperties({ images: [], display: Constants.PHOTO_CONTROL.DISPLAY.GRID });
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
  const store = Ember.getOwner(this).lookup('service:store'),
    images = Array(3)
      .fill()
      .map(() => mockValidMediaImage(store));

  this.setProperties({ images });
  this.render(hbs`{{photo-control images=images}}`);

  assert.ok(this.$('.photo-control').length);
  assert.ok(this.$('.image-stack').length, 'default is image stack');
  assert.equal(this.$('.photo-control__item').length, 1, 'displays only one image');

  this.setProperties({ images, display: Constants.PHOTO_CONTROL.DISPLAY.GRID });
  this.render(hbs`{{photo-control images=images imageDisplayComponent=display}}`);

  assert.ok(this.$('.photo-control').length);
  assert.ok(this.$('.image-grid').length, 'switched to grid display');
  assert.equal(this.$('.photo-control__item').length, images.length, 'grid displays all images');
});

test('adding images', function(assert) {
  const store = Ember.getOwner(this).lookup('service:store'),
    images = Array(3)
      .fill()
      .map(() => mockValidMediaImage(store)),
    done = assert.async(),
    onAdd = sinon.spy(),
    hasFilesStub = sinon.stub(PhotoUtils, 'eventHasFiles'),
    extractStub = sinon.stub(PhotoUtils, 'extractImagesFromEvent'),
    randValue1 = Math.random();
  hasFilesStub.callsFake(() => true);
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

      hasFilesStub.restore();
      extractStub.restore();
      done();
    });
  });
});

test('removing images', function(assert) {
  const store = Ember.getOwner(this).lookup('service:store'),
    images = Array(3)
      .fill()
      .map(() => mockValidMediaImage(store)),
    done = assert.async(),
    onRemove = sinon.spy();

  this.setProperties({ images, onRemove, display: Constants.PHOTO_CONTROL.DISPLAY.STACK });
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
      assert.ok(onRemove.getCall(0).args[0] instanceof MediaElement, 'first arg is media image');
      assert.notOk(
        onRemove.getCall(0).args[1],
        'second arg is supposed to index, but missing for image stack'
      );
      assert.ok(
        onRemove.getCall(0).args[2].isPropagationStopped(),
        'stop event propagation so gallery is not triggered to open'
      );

      this.set('display', Constants.PHOTO_CONTROL.DISPLAY.GRID);

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
      assert.ok(onRemove.getCall(1).args[0] instanceof MediaElement, 'first arg is media image');
      assert.equal(
        onRemove.getCall(1).args[1],
        images.length - 1,
        'second arg is index of item to remove'
      );
      assert.ok(
        onRemove.getCall(0).args[2].isPropagationStopped(),
        'stop event propagation so gallery is not triggered to open'
      );

      done();
    });
});

test('readOnly mode', function(assert) {
  const store = Ember.getOwner(this).lookup('service:store'),
    images = Array(3)
      .fill()
      .map(() => mockValidMediaImage(store));

  this.setProperties({ images, readOnly: true, display: Constants.PHOTO_CONTROL.DISPLAY.STACK });
  this.render(hbs`{{photo-control images=images readOnly=readOnly imageDisplayComponent=display}}`);

  assert.ok(this.$('.photo-control').length, 'did render');
  assert.ok(this.$('.image-stack').length, 'did render image stack');
  assert.notOk(this.$('.photo-control__remove').length, 'no remove controls rendered');
  assert.notOk(this.$('.photo-control__add').length, 'no add controls rendered');

  this.set('display', Constants.PHOTO_CONTROL.DISPLAY.GRID);

  assert.ok(this.$('.image-grid').length, 'did render image grid');
  assert.notOk(this.$('.photo-control__remove').length, 'no remove controls rendered');
  assert.notOk(this.$('.photo-control__add').length, 'no add controls rendered');
});
