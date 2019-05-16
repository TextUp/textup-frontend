import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import MediaElement from 'textup-frontend/models/media-element';
import PhotoUtils from 'textup-frontend/utils/photo';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { mockValidMediaImage } from 'textup-frontend/tests/helpers/utilities';
import { moduleForComponent, test } from 'ember-qunit';

const { typeOf, isPresent } = Ember;

moduleForComponent(
  'responsive-image-gallery',
  'Integration | Component | responsive image gallery',
  {
    integration: true,
  }
);

test('inputs + rendering block form', function(assert) {
  const store = Ember.getOwner(this).lookup('service:store'),
    testClass = 'responsive-image-gallery-block-form',
    images = [mockValidMediaImage(store), mockValidMediaImage(store)];

  this.render(hbs`{{responsive-image-gallery}}`);
  assert.ok(Ember.$('.pswp').length, 'has rendered, images being null is acceptable');
  assert.notOk(this.$('.pswp').length, 'not child of component because hoisted to top level');

  this.set('images', []);
  this.render(hbs`{{responsive-image-gallery images=images}}`);

  assert.ok(Ember.$('.pswp').length, 'has rendered, empty images are acceptable');
  assert.notOk(this.$('.pswp').length, 'not child of component because hoisted to top level');

  this.setProperties({ images, testClass });
  this.render(hbs`
    {{#responsive-image-gallery images=images}}
      {{#each images as |image|}}
        <div class="{{testClass}}"></div>
      {{/each}}
    {{/responsive-image-gallery}}
  `);

  assert.ok(Ember.$('.pswp').length, 'has rendered');
  assert.equal(this.$(`.${testClass}`).length, images.length);
});

test('overridden options', function(assert) {
  // see https://discuss.emberjs.com/t/ember-component-creation-error-in-2-10/12087/7
  const component = Ember.getOwner(this)
    .factoryFor('component:responsive-image-gallery')
    .create({ images: [] });

  assert.equal(component.get('showHideOpacity'), true);
  assert.equal(component.get('history'), false);
  assert.equal(component.get('captionEl'), false);
  assert.equal(component.get('shareEl'), false);
  assert.equal(component.get('bgOpacity'), 0.85);
  assert.equal(typeOf(component.get('getThumbBoundsFn')), 'function');
  assert.equal(typeOf(component.get('items')), 'array');
});

test('requires some images to open gallery', function(assert) {
  const store = Ember.getOwner(this).lookup('service:store'),
    testClass = 'responsive-image-gallery-test',
    images = [],
    done = assert.async();

  this.setProperties({ images, testClass });
  this.render(hbs`
    {{#responsive-image-gallery images=images as |gallery|}}
      {{#each images as |image index|}}
        <div class="{{testClass}}" onclick={{action gallery.actions.open (hash index=index)}}></div>
      {{/each}}
    {{/responsive-image-gallery}}
  `);

  assert.ok(Ember.$('.pswp').length, 'has rendered');
  assert.notOk(Ember.$('.pswp--open').length, 'is closed');
  assert.equal(this.$(`.${testClass}`).length, images.length);

  this.$(`.${testClass}`)
    .first()
    .triggerHandler('click');

  wait()
    .then(() => {
      assert.notOk(Ember.$('.pswp--open').length, 'still closed because no images');

      this.set('images', [mockValidMediaImage(store)]);

      this.$(`.${testClass}`)
        .first()
        .triggerHandler('click');

      return wait();
    })
    .then(() => {
      assert.ok(Ember.$('.pswp--open').length, 'opened because now has images');

      done();
    });
});

test('getting thumbnail bounds function for zooming effect', function(assert) {
  const store = Ember.getOwner(this).lookup('service:store'),
    testClass = 'responsive-image-gallery-block-form',
    images = [mockValidMediaImage(store), mockValidMediaImage(store)],
    done = assert.async(),
    boundsFnStub = sinon.stub(PhotoUtils, 'getPreviewBounds');
  boundsFnStub.callsFake(() => null);
  let thumbnailClass = '';

  this.setProperties({ images, testClass, thumbnailClass });
  this.render(hbs`
    {{#responsive-image-gallery images=images thumbnailClass=thumbnailClass as |gallery|}}
      {{#each images as |image index|}}
        <div class="{{testClass}}" onclick={{action gallery.actions.open (hash index=index)}}></div>
      {{/each}}
    {{/responsive-image-gallery}}
  `);

  assert.ok(Ember.$('.pswp').length, 'has rendered');
  assert.equal(this.$(`.${testClass}`).length, images.length);

  this.$(`.${testClass}`)
    .first()
    .triggerHandler('click');

  wait()
    .then(() => {
      assert.ok(boundsFnStub.notCalled, 'not called because no thumbnail class specified');

      this.set('thumbnailClass', 'not a valid class');
      this.$(`.${testClass}`)
        .first()
        .triggerHandler('click');
      return wait();
    })
    .then(() => {
      assert.ok(boundsFnStub.notCalled, 'not called because no thumbnail class is invalid');

      this.set('thumbnailClass', testClass);
      this.$(`.${testClass}`)
        .first()
        .triggerHandler('click');
      return wait();
    })
    .then(() => {
      assert.ok(boundsFnStub.called, 'called because thumbnail class is valid');

      boundsFnStub.restore();
      done();
    });
});

test('selecting appropriate versions based on viewport width', function(assert) {
  const store = Ember.getOwner(this).lookup('service:store'),
    testClass = 'responsive-image-gallery-block-form',
    images = [mockValidMediaImage(store), mockValidMediaImage(store)],
    done = assert.async(),
    gettingDataStub = sinon.stub(PhotoUtils, 'formatResponsiveMediaImageForGallery');
  gettingDataStub.callsFake(() => null);

  this.setProperties({ images, testClass });
  this.render(hbs`
    {{#responsive-image-gallery images=images as |gallery|}}
      {{#each images as |image index|}}
        <div class="{{testClass}}" onclick={{action gallery.actions.open (hash index=index)}}></div>
      {{/each}}
    {{/responsive-image-gallery}}
  `);

  assert.ok(Ember.$('.pswp').length, 'has rendered');
  assert.equal(this.$(`.${testClass}`).length, images.length);

  this.$(`.${testClass}`)
    .first()
    .triggerHandler('click');

  // wait doesn't want long enough
  Ember.run.later(() => {
    assert.ok(gettingDataStub.called, 'getting data is called on opening');
    gettingDataStub.args.forEach(argList => {
      assert.ok(argList.every(arg => isPresent(arg)), 'all passed-in args are defined');
      assert.ok(argList.length === 3, '3 args passed in per call');
      assert.ok(argList[2] instanceof MediaElement, 'third arg is a MediaElement');
    });

    gettingDataStub.restore();
    done();
  }, 500);
});

test('deciding responsive reload on resize', function(assert) {
  const store = Ember.getOwner(this).lookup('service:store'),
    testClass = 'responsive-image-gallery-block-form',
    images = [mockValidMediaImage(store), mockValidMediaImage(store)],
    done = assert.async(),
    onClickSpy = sinon.spy(),
    shouldRebuildStub = sinon.stub(PhotoUtils, 'shouldRebuildResponsiveGallery');
  let galleryComponent;

  this.setProperties({ images, testClass, onClickSpy });
  this.render(hbs`
    {{#responsive-image-gallery images=images as |gallery|}}
      {{#each images as |image index|}}
        <div class="{{testClass}}" onclick={{action onClickSpy gallery (hash index=index)}}></div>
      {{/each}}
    {{/responsive-image-gallery}}
  `);

  assert.ok(Ember.$('.pswp').length, 'has rendered');
  assert.equal(this.$(`.${testClass}`).length, images.length);

  this.$(`.${testClass}`)
    .first()
    .triggerHandler('click');

  wait()
    .then(() => {
      assert.ok(onClickSpy.calledOnce, 'click handler called after clicking');

      galleryComponent = onClickSpy.firstCall.args[0];
      galleryComponent.get('actions.open')(onClickSpy.firstCall.args[1]);
      return wait();
    })
    .then(() => {
      assert.ok(shouldRebuildStub.notCalled, 'on first resize, do not check if should resize');
      shouldRebuildStub.callsFake(() => false);
      const invalidateSpy = sinon.spy(galleryComponent.get('pswp'), 'invalidateCurrItems');

      galleryComponent.get('pswp').updateSize();

      assert.ok(shouldRebuildStub.calledOnce, 'should rebuild function called AFTER first resize');
      assert.equal(shouldRebuildStub.firstCall.args.length, 4);
      assert.ok(shouldRebuildStub.firstCall.args.every(arg => isPresent(arg)));
      assert.ok(invalidateSpy.notCalled, 'do not invalidate because rebuild returns false');
      shouldRebuildStub.callsFake(() => true);

      galleryComponent.get('pswp').updateSize();

      assert.ok(shouldRebuildStub.calledTwice, 'should rebuild function called AFTER first resize');
      assert.ok(invalidateSpy.calledOnce, 'INVALIDATE because rebuild returns true');

      shouldRebuildStub.restore();
      done();
    });
});
