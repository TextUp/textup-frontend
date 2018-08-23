import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import PhotoUtils from 'textup-frontend/utils/photo';
import ResponsiveImageGallery from 'textup-frontend/components/responsive-image-gallery';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { MediaImage } from 'textup-frontend/objects/media-image';
import { mockValidMediaImage } from 'textup-frontend/tests/helpers/utilities';
import { moduleForComponent, test } from 'ember-qunit';

const { typeOf, isPresent } = Ember;

moduleForComponent(
  'responsive-image-gallery',
  'Integration | Component | responsive image gallery',
  {
    integration: true
  }
);

test('inputs + rendering block form', function(assert) {
  const testClass = 'responsive-image-gallery-block-form',
    images = [mockValidMediaImage(), mockValidMediaImage()];

  assert.throws(() => this.render(hbs`{{responsive-image-gallery}}`), 'must pass in images');

  this.set('images', []);
  this.render(hbs`{{responsive-image-gallery images=images}}`);

  assert.ok(this.$('.pswp').length, 'has rendered, empty images are acceptable');

  this.setProperties({ images, testClass });
  this.render(hbs`
    {{#responsive-image-gallery images=images}}
      {{#each images as |image|}}
        <div class="{{testClass}}"></div>
      {{/each}}
    {{/responsive-image-gallery}}
  `);

  assert.ok(this.$('.pswp').length, 'has rendered');
  assert.equal(this.$(`.${testClass}`).length, images.length);
});

test('overriden options', function(assert) {
  const component = ResponsiveImageGallery.create({ images: [] });

  assert.equal(component.get('showHideOpacity'), true);
  assert.equal(component.get('history'), false);
  assert.equal(component.get('captionEl'), false);
  assert.equal(component.get('shareEl'), false);
  assert.equal(component.get('bgOpacity'), 0.85);
  assert.equal(typeOf(component.get('getThumbBoundsFn')), 'function');
  assert.equal(typeOf(component.get('items')), 'array');
});

test('requires some images to open gallery', function(assert) {
  const testClass = 'responsive-image-gallery-test',
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

  assert.ok(this.$('.pswp').length, 'has rendered');
  assert.notOk(this.$('.pswp--open').length, 'is closed');
  assert.equal(this.$(`.${testClass}`).length, images.length);

  this.$(`.${testClass}`)
    .first()
    .triggerHandler('click');

  wait()
    .then(() => {
      assert.notOk(this.$('.pswp--open').length, 'still closed because no images');

      this.set('images', [mockValidMediaImage()]);

      this.$(`.${testClass}`)
        .first()
        .triggerHandler('click');

      return wait();
    })
    .then(() => {
      assert.ok(this.$('.pswp--open').length, 'opened because now has images');

      done();
    });
});

test('getting thumbnail bounds function for zooming effect', function(assert) {
  const testClass = 'responsive-image-gallery-block-form',
    images = [mockValidMediaImage(), mockValidMediaImage()],
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

  assert.ok(this.$('.pswp').length, 'has rendered');
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
  const testClass = 'responsive-image-gallery-block-form',
    images = [mockValidMediaImage(), mockValidMediaImage()],
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

  assert.ok(this.$('.pswp').length, 'has rendered');
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
      assert.ok(argList[2] instanceof MediaImage, 'third arg is a MediaImage');
    });

    gettingDataStub.restore();
    done();
  }, 500);
});

test('deciding responsive reload on resize', function(assert) {
  const testClass = 'responsive-image-gallery-block-form',
    images = [mockValidMediaImage(), mockValidMediaImage()],
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

  assert.ok(this.$('.pswp').length, 'has rendered');
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
      assert.ok(
        shouldRebuildStub.notCalled,
        'beforeResize event not fired yet until we manually trigger a resize'
      );
      shouldRebuildStub.callsFake(() => false);
      const invalidateSpy = sinon.spy(galleryComponent.get('pswp'), 'invalidateCurrItems');

      galleryComponent.get('pswp').updateSize();

      assert.ok(shouldRebuildStub.notCalled, 'should rebuild function not called on FIRST resize');
      assert.ok(invalidateSpy.notCalled, 'do not invalidate');

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
