import * as ImageCompression from 'npm:browser-image-compression';
import Ember from 'ember';
import PhotoUtils from 'textup-frontend/utils/photo';
import sinon from 'sinon';
import { MediaImage, API_ID_PROP_NAME } from 'textup-frontend/objects/media-image';
import { mockValidMediaImage } from '../../helpers/utilities';
import { module, test } from 'qunit';

const { RSVP, typeOf } = Ember;
let overallStub, compressionStub, dataUrlStub, loadImageStub;
let compressionReturnVal, dataUrlReturnVal, loadImageReturnVal;

module('Unit | Utility | photo', {
  beforeEach() {
    compressionStub = sinon.stub();
    dataUrlStub = sinon.stub();
    loadImageStub = sinon.stub();
    compressionStub.callsFake(() => compressionReturnVal);
    dataUrlStub.callsFake(() => new RSVP.Promise(resolve => resolve(dataUrlReturnVal)));
    loadImageStub.callsFake(() => new RSVP.Promise(resolve => resolve(loadImageReturnVal)));

    overallStub = sinon.stub(ImageCompression, 'default').get(() => {
      compressionStub.getDataUrlFromFile = dataUrlStub;
      compressionStub.loadImage = loadImageStub;
      return compressionStub;
    });
  },
  afterEach() {
    overallStub.restore();
  }
});

test('invalid inputs when extracting images from an event', function(assert) {
  const done = assert.async(8);

  PhotoUtils.extractImagesFromEvent().then(null, res => {
    assert.notOk(res, 'short circuits when event not an object');
    done();
  });
  PhotoUtils.extractImagesFromEvent(null).then(null, res => {
    assert.notOk(res, 'short circuits when event not an object');
    done();
  });
  PhotoUtils.extractImagesFromEvent('not an object').then(null, res => {
    assert.notOk(res, 'short circuits when event not an object');
    done();
  });
  PhotoUtils.extractImagesFromEvent(88).then(null, res => {
    assert.notOk(res, 'short circuits when event not an object');
    done();
  });
  PhotoUtils.extractImagesFromEvent([]).then(null, res => {
    assert.notOk(res, 'short circuits when event not an object');
    done();
  });
  PhotoUtils.extractImagesFromEvent({ testing: 'ok' }).then(null, res => {
    assert.notOk(res, 'short circuits when missing target prop');
    done();
  });
  PhotoUtils.extractImagesFromEvent({ target: 'ok' }).then(null, res => {
    assert.notOk(res, 'short circuits when target prop not an object');
    done();
  });
  PhotoUtils.extractImagesFromEvent({ target: {} }).then(null, res => {
    assert.notOk(res, 'short circuits when no files');
    done();
  });
});

test('extracting images from an event', function(assert) {
  const done = assert.async(),
    files = ['valid file object', 'valid file object', 'valid file object'];
  compressionReturnVal = { type: Math.random() };
  dataUrlReturnVal = Math.random();
  loadImageReturnVal = { naturalWidth: Math.random(), naturalHeight: Math.random() };

  PhotoUtils.extractImagesFromEvent({ target: { files } }).then(results => {
    assert.equal(compressionStub.callCount, files.length);
    assert.equal(dataUrlStub.callCount, files.length);
    assert.equal(loadImageStub.callCount, files.length);
    results.forEach(result => {
      assert.equal(typeOf(result), 'object', 'result is an object');
      assert.deepEqual(result.mimeType, compressionReturnVal.type, 'mime type is correct value');
      assert.equal(result.data, dataUrlReturnVal, 'data is correct value');
      assert.equal(result.width, loadImageReturnVal.naturalWidth, 'width is correct value');
      assert.equal(result.height, loadImageReturnVal.naturalHeight, 'height is correct value');
    });

    done();
  });
});

test('ensuring image dimensions with empty array', function(assert) {
  const done = assert.async(6);

  PhotoUtils.ensureImageDimensions().then(null, res => {
    assert.equal(res, undefined, 'invalid inputs pass through');
    done();
  });
  PhotoUtils.ensureImageDimensions(null).then(null, res => {
    assert.equal(res, null, 'invalid inputs pass through');
    done();
  });
  PhotoUtils.ensureImageDimensions('hello').then(null, res => {
    assert.equal(res, 'hello', 'invalid inputs pass through');
    done();
  });
  PhotoUtils.ensureImageDimensions(88).then(null, res => {
    assert.equal(res, 88, 'invalid inputs pass through');
    done();
  });
  PhotoUtils.ensureImageDimensions({}).then(null, res => {
    assert.deepEqual(res, {}, 'invalid inputs pass through');
    done();
  });
  PhotoUtils.ensureImageDimensions([]).then(null, res => {
    assert.deepEqual(res, [], 'empty arrays pass through');
    done();
  });
});

test('ensuring image dimensions for all with dimensions', function(assert) {
  const done = assert.async();

  PhotoUtils.ensureImageDimensions([
    mockValidMediaImage(),
    mockValidMediaImage()
  ]).then(mediaImages => {
    assert.equal(mediaImages.length, 2);
    assert.ok(loadImageStub.notCalled, 'load image never called because already have dimensions');

    done();
  });
});

test('ensuring image dimensions for some without dimensions', function(assert) {
  const done = assert.async(),
    withDimensions = [mockValidMediaImage(), mockValidMediaImage()],
    numVersionsPerNoDimension = 3,
    noDimensions = Array(5)
      .fill()
      .map(() => {
        const mediaImage = MediaImage.create({ [API_ID_PROP_NAME]: 'a valid source' });
        Array(numVersionsPerNoDimension)
          .fill()
          .forEach(() => {
            mediaImage.addVersion('https://via.placeholder.com/350x150');
          });
        return mediaImage;
      });
  loadImageReturnVal = { naturalWidth: Math.random(), naturalHeight: Math.random() };

  PhotoUtils.ensureImageDimensions(
    [].pushObjects(withDimensions).pushObjects(noDimensions)
  ).then(mediaImages => {
    assert.equal(mediaImages.length, withDimensions.length + noDimensions.length);
    assert.equal(loadImageStub.callCount, noDimensions.length * numVersionsPerNoDimension);
    noDimensions.forEach(mediaImage => {
      mediaImage.get('versions').forEach(version => {
        assert.equal(version.get('width'), loadImageReturnVal.naturalWidth);
        assert.equal(version.get('height'), loadImageReturnVal.naturalHeight);
      });
    });

    done();
  });
});

test('if should rebuild responsive gallery', function(assert) {
  const fn = PhotoUtils.shouldRebuildResponsiveGallery;

  assert.equal(fn(), false, 'false for invalid input');
  assert.equal(fn('blah'), false, 'false for invalid input');

  assert.equal(fn(200, 1, 400, 2), true, 'mobile/tablet');
  assert.equal(fn(400, 2, 600, 2), true, 'tablet/desktop');
  assert.equal(fn(100, 2, 600, 2), true, 'mobile/desktop');
  assert.equal(fn(200, 1, 400, 1), false, 'both mobile');
  assert.equal(fn(100, 5, 400, 2), false, 'both tablet');
  assert.equal(fn(800, 2, 600, 2), false, 'both desktop');
});

test('selecting appropriate image version for display in gallery', function(assert) {
  const fn = PhotoUtils.formatResponsiveMediaImageForGallery,
    mediaImage = MediaImage.create();

  assert.notOk(fn(), 'short circuits invalid input');
  assert.notOk(fn('not a number', 8), 'short circuits invalid input');
  assert.notOk(fn(3, 8, []), 'short circuits invalid input');

  assert.deepEqual(fn(3, 8, mediaImage), { src: '', w: 0, h: 0 });

  mediaImage.addVersion('test1', 1);
  mediaImage.addVersion('test2', 100);
  mediaImage.addVersion('test3', 1000);
  assert.equal(mediaImage.get('versions.length'), 3);

  assert.deepEqual(fn(3, 8, mediaImage), { src: 'test1', w: 1, h: null });
  assert.deepEqual(fn(33, 3, mediaImage), { src: 'test2', w: 100, h: null });
  assert.deepEqual(fn(33, 1000, mediaImage), { src: 'test3', w: 1000, h: null });
});

test('getting boundary coordinates for preview thumbnail', function(assert) {
  const fn = PhotoUtils.getPreviewBounds,
    windowStub = sinon.stub(window, 'pageYOffset');
  windowStub.value(0);

  assert.notOk(fn(), 'short circuits invalid input');
  assert.notOk(fn(null), 'not an object');
  assert.notOk(fn('blah'), 'not an object');
  assert.notOk(fn(88), 'not an object');
  assert.notOk(fn({}), 'getBoundingClientRect is not a function');
  assert.notOk(fn({ getBoundingClientRect: 'hi' }), 'getBoundingClientRect is not a function');

  const bounds = { left: Math.random(), top: Math.random(), width: Math.random() };
  assert.deepEqual(fn({ getBoundingClientRect: () => bounds }), {
    x: bounds.left,
    y: bounds.top,
    w: bounds.width
  });

  windowStub.restore();
});
