import Ember from 'ember';
import { moduleForModel, test } from 'ember-qunit';

const { run } = Ember;

moduleForModel('media', 'Unit | Model | media', {
  needs: ['service:constants'],
  subject() {
    return run(() => {
      return this.store().createRecord('media', {
        images: [{ uid: `${Math.random()}` }]
      });
    });
  }
});

test('adding/removing new media elements + dirty checking', function(assert) {
  const obj = this.subject(),
    mimeType = 'image/jpeg',
    data = 'i am some valid data';

  assert.equal(obj.get('images.length'), 1);
  assert.equal(obj.get('pendingChanges.length'), 0);
  assert.equal(obj.get('hasManualChanges'), false);
  assert.equal(obj.get('displayedImages.length'), 1);
  assert.equal(obj.get('hasElements'), true);

  const tempId = obj.addChange(mimeType, data);

  assert.equal(obj.get('images.length'), 1);
  assert.equal(obj.get('pendingChanges.length'), 1, '+1 add change');
  assert.equal(obj.get('hasManualChanges'), true);
  assert.equal(obj.get('displayedImages.length'), 2);
  assert.equal(obj.get('hasElements'), true);

  obj.removeElement(tempId);

  assert.equal(obj.get('images.length'), 1);
  assert.equal(obj.get('pendingChanges.length'), 0, 'add change is removed');
  assert.equal(obj.get('hasManualChanges'), false);
  assert.equal(obj.get('displayedImages.length'), 1);
  assert.equal(obj.get('hasElements'), true);
});

test('removing existing media elements', function(assert) {
  const obj = this.subject(),
    existingId = obj.get('images.firstObject.uid');

  assert.equal(obj.get('images.length'), 1);
  assert.equal(obj.get('pendingChanges.length'), 0);
  assert.equal(obj.get('hasManualChanges'), false);
  assert.equal(obj.get('displayedImages.length'), 1);
  assert.equal(obj.get('hasElements'), true);

  obj.removeElement(existingId);

  assert.equal(obj.get('images.length'), 1);
  assert.equal(obj.get('pendingChanges.length'), 1, 'added a remove change');
  assert.equal(obj.get('hasManualChanges'), true);
  assert.equal(obj.get('displayedImages.length'), 0);
  assert.equal(obj.get('hasElements'), false);
});

test('rolling back changes', function(assert) {
  const obj = this.subject(),
    mimeType = 'image/jpeg',
    data = 'i am some valid data';

  assert.equal(obj.get('images.length'), 1);
  assert.equal(obj.get('pendingChanges.length'), 0);
  assert.equal(obj.get('hasManualChanges'), false);
  assert.equal(obj.get('displayedImages.length'), 1);
  assert.equal(obj.get('hasElements'), true);

  obj.addChange(mimeType, data);

  assert.equal(obj.get('images.length'), 1);
  assert.equal(obj.get('pendingChanges.length'), 1, '+1 add change');
  assert.equal(obj.get('hasManualChanges'), true);
  assert.equal(obj.get('displayedImages.length'), 2);
  assert.equal(obj.get('hasElements'), true);

  run(() => {
    obj.rollbackAttributes();

    assert.equal(
      obj.get('images.length'),
      undefined,
      'rolling back new model removes it from store'
    );
    assert.equal(obj.get('pendingChanges.length'), 0, 'all changes are cleared on rollback');
    assert.equal(obj.get('hasManualChanges'), false);
    assert.equal(obj.get('displayedImages.length'), 0);
    assert.equal(obj.get('hasElements'), false);
  });
});

test('building changes for API', function(assert) {
  const constants = this.container.lookup('service:constants'),
    obj = this.subject(),
    mimeType = 'image/jpeg',
    data = 'i am some valid data';
  obj.addChange(mimeType, data);
  obj.addChange(mimeType, data);
  obj.addChange(mimeType, data);
  obj.removeElement('testing1');
  obj.removeElement('testing2');

  assert.equal(obj.get('images.length'), 1);
  assert.equal(obj.get('displayedImages.length'), 4, 'one existing + 3 newly added');
  assert.equal(obj.get('hasManualChanges'), true);
  assert.equal(obj.get('hasElements'), true);

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
});
