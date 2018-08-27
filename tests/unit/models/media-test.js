import * as PhotoUtils from 'textup-frontend/utils/photo';
import Ember from 'ember';
import sinon from 'sinon';
import { MediaImage, API_ID_PROP_NAME } from 'textup-frontend/objects/media-image';
import { moduleForModel, test } from 'ember-qunit';

const { run, RSVP } = Ember;
let ensureDimensionsStub;

moduleForModel('media', 'Unit | Model | media', {
  needs: ['service:constants'],
  subject() {
    return run(() => {
      return this.store().createRecord('media', {
        // `media-collection` transform -- returns an array of `MediaImage`s
        images: [MediaImage.create({ [API_ID_PROP_NAME]: `${Math.random()}` })]
      });
    });
  },
  beforeEach() {
    ensureDimensionsStub = sinon
      .stub(PhotoUtils, 'ensureImageDimensions')
      .callsFake(images => new RSVP.Promise(resolve => resolve(images)));
  },
  afterEach() {
    ensureDimensionsStub.restore();
  }
});

test('adding/removing new media elements + dirty checking', function(assert) {
  const obj = this.subject(),
    mimeType = 'image/jpeg',
    data = 'i am some valid data',
    done = assert.async();
  let tempId;

  assert.equal(obj.get('images.length'), 1);
  assert.equal(obj.get('pendingChanges.length'), 0);
  assert.equal(obj.get('hasManualChanges'), false);
  assert.equal(obj.get('hasElements'), true);
  obj
    .get('displayedImages')
    .then(displayedImages => {
      assert.equal(displayedImages.length, 1);
      assert.ok(displayedImages.every(img => img instanceof MediaImage));
      assert.equal(ensureDimensionsStub.callCount, 1);

      assert.notOk(obj.addChange());
      assert.notOk(obj.addChange(null));
      assert.notOk(obj.addChange(88, 88, 'not a number', 'not a number'));
      tempId = obj.addChange(mimeType, data, '88', '11');

      assert.ok(tempId, 'returns a temporary id');
      assert.equal(obj.get('images.length'), 1);
      assert.equal(
        obj.get('pendingChanges.length'),
        1,
        '+1 add change, add change attempts to convert passed-in dimensions to numbers'
      );
      assert.equal(obj.get('hasManualChanges'), true);
      assert.equal(obj.get('hasElements'), true);
      return obj.get('displayedImages');
    })
    .then(displayedImages => {
      assert.equal(displayedImages.length, 2);
      assert.ok(displayedImages.every(img => img instanceof MediaImage));
      assert.equal(ensureDimensionsStub.callCount, 2);

      assert.notOk(obj.removeElement());
      assert.notOk(obj.removeElement(88));
      assert.ok(obj.removeElement(tempId));

      assert.equal(obj.get('images.length'), 1);
      assert.equal(obj.get('pendingChanges.length'), 0, 'add change is removed');
      assert.equal(obj.get('hasManualChanges'), false);
      assert.equal(obj.get('hasElements'), true);
      return obj.get('displayedImages');
    })
    .then(displayedImages => {
      assert.equal(displayedImages.length, 1);
      assert.ok(displayedImages.every(img => img instanceof MediaImage));
      assert.equal(ensureDimensionsStub.callCount, 3);

      done();
    });
});

test('removing existing media elements', function(assert) {
  const obj = this.subject(),
    existingId = obj.get('images.firstObject.uid'),
    done = assert.async();

  assert.equal(obj.get('images.length'), 1);
  assert.equal(obj.get('pendingChanges.length'), 0);
  assert.equal(obj.get('hasManualChanges'), false);
  assert.equal(obj.get('hasElements'), true);

  obj
    .get('displayedImages')
    .then(displayedImages => {
      assert.equal(displayedImages.length, 1);
      assert.ok(displayedImages.every(img => img instanceof MediaImage));
      assert.equal(ensureDimensionsStub.callCount, 1);

      obj.removeElement(existingId);

      assert.equal(obj.get('images.length'), 1);
      assert.equal(obj.get('pendingChanges.length'), 1, 'added a remove change');
      assert.equal(obj.get('hasManualChanges'), true);
      assert.equal(obj.get('hasElements'), false);
      return obj.get('displayedImages');
    })
    .then(displayedImages => {
      assert.equal(displayedImages.length, 0);
      assert.equal(ensureDimensionsStub.callCount, 2);

      done();
    });
});

test('rolling back changes', function(assert) {
  const obj = this.subject(),
    mimeType = 'image/jpeg',
    data = 'i am some valid data',
    done = assert.async();

  run(() => {
    assert.equal(obj.get('images.length'), 1);
    assert.equal(obj.get('pendingChanges.length'), 0);
    assert.equal(obj.get('hasManualChanges'), false);
    assert.equal(obj.get('hasElements'), true);
    obj
      .get('displayedImages')
      .then(displayedImages => {
        assert.equal(displayedImages.length, 1);
        assert.ok(displayedImages.every(img => img instanceof MediaImage));
        assert.equal(ensureDimensionsStub.callCount, 1);

        obj.addChange(mimeType, data, 77, 88);

        assert.equal(obj.get('images.length'), 1);
        assert.equal(obj.get('pendingChanges.length'), 1, '+1 add change');
        assert.equal(obj.get('hasManualChanges'), true);
        assert.equal(obj.get('hasElements'), true);
        return obj.get('displayedImages');
      })
      .then(displayedImages => {
        assert.equal(displayedImages.length, 2);
        assert.ok(displayedImages.every(img => img instanceof MediaImage));
        assert.equal(ensureDimensionsStub.callCount, 2);

        obj.rollbackAttributes();

        assert.equal(
          obj.get('images.length'),
          undefined,
          'rolling back new model removes it from store'
        );
        assert.equal(obj.get('pendingChanges.length'), 0, 'all changes are cleared on rollback');
        assert.equal(obj.get('hasManualChanges'), false);
        assert.equal(obj.get('hasElements'), false);
        return obj.get('displayedImages');
      })
      .then(displayedImages => {
        assert.equal(displayedImages.length, 0);
        assert.equal(ensureDimensionsStub.callCount, 3);

        done();
      });
  });
});

test('building changes for API', function(assert) {
  const constants = Ember.getOwner(this).lookup('service:constants'),
    obj = this.subject(),
    mimeType = 'image/jpeg',
    data = 'i am some valid data',
    done = assert.async();
  obj.addChange(mimeType, data, 88, 888);
  obj.addChange(mimeType, data, 88, 888);
  obj.addChange(mimeType, data, 88, 888);
  obj.removeElement('testing1');
  obj.removeElement('testing2');

  assert.equal(obj.get('images.length'), 1);
  assert.equal(obj.get('hasManualChanges'), true);
  assert.equal(obj.get('hasElements'), true);
  obj.get('displayedImages').then(displayedImages => {
    assert.equal(displayedImages.length, 4, 'one existing + 3 newly added');
    assert.ok(displayedImages.every(img => img instanceof MediaImage));
    assert.equal(ensureDimensionsStub.callCount, 1);

    const pendingChanges = obj.get('pendingChanges');

    assert.equal(pendingChanges.length, 5, 'three to add, two to remove');
    pendingChanges.forEach(pChange => {
      assert.ok(
        pChange.action === constants.ACTION.MEDIA.REMOVE ||
          pChange.action === constants.ACTION.MEDIA.ADD,
        'media action must be one of two valid types'
      );
      if (pChange.action === constants.ACTION.MEDIA.REMOVE) {
        assert.ok(pChange.key);
      } else {
        // adding media
        assert.ok(pChange.mimeType);
        assert.ok(pChange.data);
        assert.ok(pChange.checksum);
      }
    });
    done();
  });
});
