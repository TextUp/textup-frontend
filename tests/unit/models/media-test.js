import { run } from '@ember/runloop';
import RSVP from 'rsvp';
import Constants from 'textup-frontend/constants';
import MediaAddChange from 'textup-frontend/models/media/add';
import MediaElement from 'textup-frontend/models/media-element';
import MediaRemoveChange from 'textup-frontend/models/media/remove';
import PhotoUtils from 'textup-frontend/utils/photo';
import sinon from 'sinon';
import {
  mergeExistingAndChanges,
  removeElementsById
} from 'textup-frontend/models/media';
import { moduleForModel, test } from 'ember-qunit';

let ensureDimensionsStub;

moduleForModel('media', 'Unit | Model | media', {
  needs: [
    'model:media-element',
    'model:media-element-version',
    'model:media/add',
    'model:media/remove',
  ],
  subject() {
    return run(() => {
      const media = this.store().createRecord('media');
      media.get('images').createFragment({ [Constants.PROP_NAME.MEDIA_ID]: `${Math.random()}` });
      return media;
    });
  },
  beforeEach() {
    ensureDimensionsStub = sinon
      .stub(PhotoUtils, 'ensureImageDimensions')
      .callsFake(images => new RSVP.Promise(resolve => resolve(images)));
  },
  afterEach() {
    ensureDimensionsStub.restore();
  },
});

test('removing elementds by id helper function', function(assert) {
  run(() => {
    const store = this.store(),
      array = [],
      idVal = Math.random();

    array.pushObject(store.createFragment('media/add', { [Constants.PROP_NAME.MEDIA_ID]: idVal }));
    array.pushObject(
      store.createFragment('media/add', { [Constants.PROP_NAME.MEDIA_ID]: 'something else' })
    );
    assert.equal(array.length, 2);

    assert.equal(removeElementsById(array, 'nonexistent key'), false);
    assert.equal(array.length, 2);

    assert.equal(removeElementsById(array, idVal), true);
    assert.equal(array.length, 1);
  });
});

test('merging existing and changes helper function', function(assert) {
  run(() => {
    const store = this.store(),
      existing = [],
      toAdd = [],
      toRemove = [],
      existingId1 = Math.random(),
      existingId2 = Math.random(),
      newId1 = Math.random(),
      newId2 = Math.random();

    existing.pushObject(
      store.createFragment('media-element', { [Constants.PROP_NAME.MEDIA_ID]: existingId1 })
    );
    existing.pushObject(
      store.createFragment('media-element', { [Constants.PROP_NAME.MEDIA_ID]: existingId2 })
    );

    toAdd.pushObject(store.createFragment('media/add', { [Constants.PROP_NAME.MEDIA_ID]: newId1 }));
    toAdd.pushObject(store.createFragment('media/add', { [Constants.PROP_NAME.MEDIA_ID]: newId2 }));

    toRemove.pushObject(
      store.createFragment('media/remove', { [Constants.PROP_NAME.MEDIA_ID]: existingId1 })
    );

    assert.equal(existing.length, 2);
    assert.equal(toAdd.length, 2);
    assert.equal(toRemove.length, 1);

    const merged = mergeExistingAndChanges(existing, toAdd, toRemove);

    assert.equal(merged.length, 3); // 1 existing, 2 new
    assert.ok(merged.every(el => el instanceof MediaElement));
    assert.notOk(
      merged.findBy(Constants.PROP_NAME.MEDIA_ID, existingId1),
      'removed by remove action'
    );
    assert.ok(merged.findBy(Constants.PROP_NAME.MEDIA_ID, existingId2));
    assert.ok(merged.findBy(Constants.PROP_NAME.MEDIA_ID, newId1));
    assert.ok(merged.findBy(Constants.PROP_NAME.MEDIA_ID, newId2));
  });
});

test('upload error messages', function(assert) {
  const obj = this.subject(),
    error1 = `${Math.random()}`;

  assert.equal(obj.get('uploadErrors.length'), 0);

  obj.get('uploadErrors').pushObject(error1);

  assert.equal(obj.get('uploadErrors.length'), 1);
  assert.equal(obj.get('uploadErrors.firstObject'), error1);
});

test('adding/removing new images', function(assert) {
  const obj = this.subject(),
    mimeType = 'image/jpeg',
    data = 'base64,i am some valid data',
    done = assert.async();
  let tempId;

  assert.equal(obj.get('images.length'), 1);
  assert.equal(obj.get('pendingChanges.length'), 0);
  assert.equal(obj.get('hasElements'), true);

  obj
    .get('displayedImages')
    .then(displayedImages => {
      assert.equal(displayedImages.length, 1);
      assert.ok(displayedImages.every(img => img instanceof MediaElement));
      assert.equal(ensureDimensionsStub.callCount, 1);
      assert.notOk(obj.addImage());
      assert.notOk(obj.addImage(null));
      assert.notOk(obj.addImage(88, 88, 'not a number', 'not a number'));
      tempId = obj.addImage(mimeType, data, '88', '11');
      assert.ok(tempId, 'returns a temporary id');
      assert.equal(obj.get('images.length'), 1);
      assert.equal(
        obj.get('pendingChanges.length'),
        1,
        '+1 add change, add change attempts to convert passed-in dimensions to numbers'
      );
      assert.equal(obj.get('hasElements'), true);
      return obj.get('displayedImages');
    })
    .then(displayedImages => {
      assert.equal(displayedImages.length, 2);
      assert.ok(displayedImages.every(img => img instanceof MediaElement));
      assert.equal(ensureDimensionsStub.callCount, 2);
      assert.notOk(obj.removeElement());
      assert.notOk(obj.removeElement(88));
      assert.ok(obj.removeElement(tempId));
      assert.equal(obj.get('images.length'), 1);
      assert.equal(obj.get('pendingChanges.length'), 0, 'add change is removed');
      assert.equal(obj.get('hasElements'), true);
      return obj.get('displayedImages');
    })
    .then(displayedImages => {
      assert.equal(displayedImages.length, 1);
      assert.ok(displayedImages.every(img => img instanceof MediaElement));
      assert.equal(ensureDimensionsStub.callCount, 3);
      done();
    });
});

test('add/remove new audio', function(assert) {
  run(() => {
    const obj = this.subject(),
      mimeType = 'audio/webm;codec=opus',
      data = 'base64i am some valid data',
      existingId = `${Math.random()}`;

    assert.equal(obj.get('audio.length'), 0);
    assert.equal(obj.get('displayedAudio.length'), 0);
    assert.equal(obj.get('pendingChanges.length'), 0);

    obj.get('audio').createFragment({ [Constants.PROP_NAME.MEDIA_ID]: existingId });

    assert.equal(obj.get('audio.length'), 1);
    assert.equal(obj.get('displayedAudio.length'), 1);
    assert.equal(obj.get('pendingChanges.length'), 0);

    const tempId = obj.addAudio(mimeType, data);

    assert.ok(tempId, 'adding audio returns temporary id');
    assert.equal(obj.get('audio.length'), 1);
    assert.equal(obj.get('displayedAudio.length'), 2);
    assert.equal(obj.get('pendingChanges.length'), 1);

    obj.removeElement(tempId);

    assert.equal(obj.get('audio.length'), 1);
    assert.equal(obj.get('displayedAudio.length'), 1);
    assert.equal(obj.get('pendingChanges.length'), 0);

    obj.removeElement(existingId);

    assert.equal(
      obj.get('audio.length'),
      1,
      'when removing existing audio, array is not modified but remove change is added'
    );
    assert.equal(obj.get('displayedAudio.length'), 0);
    assert.equal(
      obj.get('pendingChanges.length'),
      1,
      'remove change is added to remove the existing audio'
    );
  });
});

test('removing existing media elements', function(assert) {
  const obj = this.subject(),
    existingId = obj.get('images.firstObject.uid'),
    done = assert.async();

  assert.equal(obj.get('images.length'), 1);
  assert.equal(obj.get('pendingChanges.length'), 0);
  assert.equal(obj.get('hasElements'), true);

  obj
    .get('displayedImages')
    .then(displayedImages => {
      assert.equal(displayedImages.length, 1);
      assert.ok(displayedImages.every(img => img instanceof MediaElement));
      assert.equal(ensureDimensionsStub.callCount, 1);

      obj.removeElement(existingId);

      assert.equal(obj.get('images.length'), 1);
      assert.equal(obj.get('pendingChanges.length'), 1, 'added a remove change');
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
    assert.equal(obj.get('hasElements'), true);
    assert.equal(obj.get('isDirty'), true);
    obj
      .get('displayedImages')
      .then(displayedImages => {
        assert.equal(displayedImages.length, 1);
        assert.ok(displayedImages.every(img => img instanceof MediaElement));
        assert.equal(ensureDimensionsStub.callCount, 1);

        obj.addImage(mimeType, data, 77, 88);

        assert.equal(obj.get('images.length'), 1);
        assert.equal(obj.get('pendingChanges.length'), 1, '+1 add change');
        assert.equal(obj.get('hasElements'), true);
        assert.equal(obj.get('isDirty'), true);
        return obj.get('displayedImages');
      })
      .then(displayedImages => {
        assert.equal(displayedImages.length, 2);
        assert.ok(displayedImages.every(img => img instanceof MediaElement));
        assert.equal(ensureDimensionsStub.callCount, 2);

        obj.rollbackAttributes();

        assert.notOk(obj.get('images.length'), 0, 'rolling back new model removes it from store');
        assert.equal(obj.get('pendingChanges.length'), 0, 'all changes are cleared on rollback');
        assert.equal(obj.get('hasElements'), false);
        assert.equal(obj.get('isDirty'), false);
        return obj.get('displayedImages');
      })
      .then(displayedImages => {
        assert.equal(displayedImages.length, 0);
        assert.equal(ensureDimensionsStub.callCount, 3);

        done();
      });
  });
});

test('collecting pending changes', function(assert) {
  run(() => {
    const obj = this.subject(),
      imageType = 'image/jpeg',
      audioType = 'image/mpeg',
      data = 'i am some valid data,what is this',
      done = assert.async();
    obj.addImage(imageType, data, 88, 888);
    obj.addImage(imageType, data, 88, 888);
    obj.addImage(imageType, data, 88, 888);
    obj.addAudio(audioType, data);
    obj.addAudio(audioType, data);
    obj.removeElement('testing1');
    obj.removeElement('testing2');

    assert.equal(obj.get('hasElements'), true);

    assert.equal(obj.get('displayedAudio.length'), 2);

    assert.equal(obj.get('images.length'), 1);
    obj.get('displayedImages').then(displayedImages => {
      assert.equal(displayedImages.length, 4, 'one existing + 3 newly added');
      assert.ok(displayedImages.every(img => img instanceof MediaElement));
      assert.equal(ensureDimensionsStub.callCount, 1);

      const pendingChanges = obj.get('pendingChanges');

      assert.equal(pendingChanges.length, 7, 'three images and 2 audio to add, two to remove');
      // shape of the changes once serialized will be tested in their respective serializers
      pendingChanges.forEach(pChange => {
        assert.ok(pChange instanceof MediaAddChange || pChange instanceof MediaRemoveChange);
      });
      done();
    });
  });
});
