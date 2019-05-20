import { getOwner } from '@ember/application';
import RSVP from 'rsvp';
import { typeOf } from '@ember/utils';
import { run } from '@ember/runloop';
import Constants from 'textup-frontend/constants';
import PhotoUtils from 'textup-frontend/utils/photo';
import PhotoCompressionUtils from 'textup-frontend/utils/photo/compression';
import sinon from 'sinon';
import { mockValidMediaImage } from 'textup-frontend/tests/helpers/utilities';
import { moduleFor, test } from 'ember-qunit';

let compressionStub, dataUrlStub, loadImageStub;
let compressionReturnVal, dataUrlReturnVal, loadImageReturnVal;

moduleFor('util:photo', 'Unit | Utility | photo', {
  needs: ['model:media-element', 'model:media-element-version'],
  beforeEach() {
    compressionStub = sinon
      .stub(PhotoCompressionUtils, 'startImageCompression')
      .callsFake(() => compressionReturnVal);
    dataUrlStub = sinon
      .stub(PhotoCompressionUtils, 'getDataUrlFromFile')
      .callsFake(() => new RSVP.Promise(resolve => resolve(dataUrlReturnVal)));
    loadImageStub = sinon
      .stub(PhotoCompressionUtils, 'loadImage')
      .callsFake(() => new RSVP.Promise(resolve => resolve(loadImageReturnVal)));
  },
  afterEach() {
    compressionStub.restore();
    dataUrlStub.restore();
    loadImageStub.restore();
  },
});

test('whether or not an event has files', function(assert) {
  assert.notOk(PhotoUtils.eventHasFiles());
  assert.notOk(PhotoUtils.eventHasFiles(null));
  assert.notOk(PhotoUtils.eventHasFiles([]));
  assert.notOk(PhotoUtils.eventHasFiles('hi'));
  assert.notOk(PhotoUtils.eventHasFiles({}));
  assert.notOk(PhotoUtils.eventHasFiles({ target: 'hi' }));
  assert.notOk(PhotoUtils.eventHasFiles({ target: {} }));
  assert.notOk(PhotoUtils.eventHasFiles({ target: { files: 88 } }));

  assert.equal(PhotoUtils.eventHasFiles({ target: { files: [] } }), 0);
  assert.equal(PhotoUtils.eventHasFiles({ target: { files: ['hi'] } }), 1);
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

test('ensuring image dimensions a variety of inputs', function(assert) {
  const done = assert.async(6);

  PhotoUtils.ensureImageDimensions().then(null, res => {
    assert.equal(res, undefined, 'invalid inputs are rejected');
    done();
  });
  PhotoUtils.ensureImageDimensions(null).then(null, res => {
    assert.equal(res, null, 'invalid inputs are rejected');
    done();
  });
  PhotoUtils.ensureImageDimensions('hello').then(null, res => {
    assert.equal(res, 'hello', 'invalid inputs are rejected');
    done();
  });
  PhotoUtils.ensureImageDimensions(88).then(null, res => {
    assert.equal(res, 88, 'invalid inputs are rejected');
    done();
  });
  PhotoUtils.ensureImageDimensions({}).then(null, res => {
    assert.deepEqual(res, {}, 'invalid inputs are rejected');
    done();
  });
  PhotoUtils.ensureImageDimensions([]).then(res => {
    assert.deepEqual(res, [], 'empty arrays pass through, NOT REJECTED');
    done();
  });
});

test('ensuring image dimensions for all with dimensions', function(assert) {
  const store = getOwner(this).lookup('service:store'),
    done = assert.async();

  PhotoUtils.ensureImageDimensions([mockValidMediaImage(store), mockValidMediaImage(store)]).then(
    mediaImages => {
      assert.equal(mediaImages.length, 2);
      assert.ok(loadImageStub.notCalled, 'load image never called because already have dimensions');

      done();
    }
  );
});

test('ensuring image dimensions for some without dimensions', function(assert) {
  run(() => {
    const store = getOwner(this).lookup('service:store'),
      done = assert.async(),
      withDimensions = [mockValidMediaImage(store), mockValidMediaImage(store)],
      numVersionsPerNoDimension = 3,
      noDimensions = Array(5)
        .fill()
        .map(() => {
          const el = store.createFragment('media-element', {
            [Constants.PROP_NAME.MEDIA_ID]: 'id',
          });
          Array(numVersionsPerNoDimension)
            .fill()
            .forEach(() => {
              el.addVersion('image/jpeg', 'https://via.placeholder.com/350x150');
            });
          return el;
        });
    loadImageReturnVal = { naturalWidth: Math.random(), naturalHeight: Math.random() };

    PhotoUtils.ensureImageDimensions([].pushObjects(withDimensions).pushObjects(noDimensions)).then(
      mediaImages => {
        assert.equal(mediaImages.length, withDimensions.length + noDimensions.length);
        assert.equal(loadImageStub.callCount, noDimensions.length * numVersionsPerNoDimension);
        noDimensions.forEach(mElements => {
          mElements.get('versions').forEach(version => {
            assert.equal(version.get('width'), loadImageReturnVal.naturalWidth);
            assert.equal(version.get('height'), loadImageReturnVal.naturalHeight);
          });
        });

        done();
      }
    );
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
  run(() => {
    const store = getOwner(this).lookup('service:store'),
      fn = PhotoUtils.formatResponsiveMediaImageForGallery,
      el = store.createFragment('media-element', { [Constants.PROP_NAME.MEDIA_ID]: 'id' });

    assert.notOk(fn(), 'short circuits invalid input');
    assert.notOk(fn('not a number', 8), 'short circuits invalid input');
    assert.notOk(fn(3, 8, []), 'short circuits invalid input');

    assert.deepEqual(fn(3, 8, el), { src: '', w: 0, h: 0 });

    el.addVersion('image/jpeg', 'test1', 1);
    el.addVersion('image/jpeg', 'test2', 100);
    el.addVersion('image/jpeg', 'test3', 1000);
    assert.equal(el.get('versions.length'), 3);

    assert.deepEqual(fn(3, 8, el), { src: 'test1', w: 1, h: null });
    assert.deepEqual(fn(33, 3, el), { src: 'test2', w: 100, h: null });
    assert.deepEqual(fn(33, 1000, el), { src: 'test3', w: 1000, h: null });
  });
});

test('getting boundary coordinates for preview thumbnail', function(assert) {
  const fn = PhotoUtils.getPreviewBounds,
    windowStub = sinon.stub(window, 'pageYOffset').value(0);

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
    w: bounds.width,
  });

  windowStub.restore();
});
