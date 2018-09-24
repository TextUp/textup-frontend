import Ember from 'ember';
import ModelOwnsRecordItemsMixin from 'textup-frontend/mixins/model/owns-record-items';
import { RecordCluster } from 'textup-frontend/objects/record-cluster';
import { moduleFor, test } from 'ember-qunit';

const { run, isPresent } = Ember;

// testing DS.attr in mixins from https://stackoverflow.com/a/39860250
moduleFor('mixin:model/owns-record-items', 'Unit | Mixin | model/owns-record-items', {
  needs: [
    'model:contact',
    'model:location',
    'model:media',
    'model:record-call',
    'model:record-item',
    'model:record-note',
    'model:record-note-revision',
    'model:record-text',
    'model:tag',
    'service:constants',
    'validator:has-any',
    'validator:inclusion',
    'validator:number',
    'validator:presence'
  ],
  subject() {
    // The scope here is the module, so we have access to the registration stuff.
    // Define and register our phony host model.
    const OwnsRecordItemsMixinModel = DS.Model.extend(ModelOwnsRecordItemsMixin);
    this.register('model:owns-record-items-mixin-model', OwnsRecordItemsMixinModel);
    // Once our model is registered, we create it via the store in the
    // usual way and return it. Since createRecord is async, we need
    // an Ember.run.
    return Ember.run(() => {
      const store = Ember.getOwner(this).lookup('service:store');
      return store.createRecord('owns-record-items-mixin-model');
    });
  }
});

test('record items relationship is polymorphic', function(assert) {
  run(() => {
    const store = Ember.getOwner(this).lookup('service:store'),
      obj = this.subject(),
      rItem1 = store.createRecord('record-item', { id: '1' }),
      rText1 = store.createRecord('record-text', { id: '2' }),
      rCall1 = store.createRecord('record-call', { id: '3' }),
      rNote1 = store.createRecord('record-note', { id: '4' }),
      validItems = [rItem1, rText1, rCall1, rNote1],
      rev1 = store.createRecord('record-note-revision');

    assert.equal(obj.get('numRecordItems'), 0);
    assert.deepEqual(obj.get('recordItems'), []);

    assert.ok(obj.addRecordItems(validItems));

    assert.equal(obj.get('numRecordItems'), validItems.length, 'polymorphic items added');
    assert.deepEqual(obj.get('recordItems'), validItems);

    assert.throws(
      () => obj.addRecordItem(rev1),
      Error,
      'cannot add item not in polymorphic hierarchy'
    );
  });
});

test('adding record items ignores duplicate, invalid, and falsy values', function(assert) {
  run(() => {
    const store = Ember.getOwner(this).lookup('service:store'),
      obj = this.subject(),
      rItems1 = Array(8)
        .fill()
        .map(() =>
          store.createRecord('record-item', {
            id: `${Math.random()}`
          })
        );

    assert.equal(obj.get('totalNumRecordItems'), null);
    assert.equal(obj.get('numRecordItems'), 0);
    assert.deepEqual(obj.get('recordItems'), []);
    assert.equal(obj.get('numRecordClusters'), 0);
    assert.deepEqual(obj.get('recordClusters'), []);

    assert.ok(obj.addRecordItems(rItems1));

    assert.equal(obj.get('totalNumRecordItems'), null);
    assert.equal(obj.get('numRecordItems'), rItems1.length);
    assert.equal(obj.get('numRecordClusters'), rItems1.length);

    assert.ok(obj.addRecordItems(rItems1));

    assert.equal(obj.get('totalNumRecordItems'), null);
    assert.equal(obj.get('numRecordItems'), rItems1.length, 'adding the same items is ignored');
    assert.equal(obj.get('numRecordClusters'), rItems1.length);

    assert.notOk(obj.addRecordItems());
    assert.notOk(obj.addRecordItems(null));
    assert.notOk(obj.addRecordItems('not a list'));
    assert.notOk(obj.addRecordItems({}));
    assert.notOk(obj.addRecordItems([null, undefined, null]));

    assert.equal(obj.get('totalNumRecordItems'), null);
    assert.equal(obj.get('numRecordItems'), rItems1.length, 'invalid and falsy inputs ignored');
    assert.equal(obj.get('numRecordClusters'), rItems1.length);
  });
});

test('getting record items and record clusters', function(assert) {
  run(() => {
    const store = Ember.getOwner(this).lookup('service:store'),
      obj = this.subject(),
      numItems = 4,
      rItems1 = Array(numItems)
        .fill()
        .map(() =>
          store.createRecord('record-item', {
            id: `${Math.random()}`,
            whenCreated: new Date(Date.now() - 1000)
          })
        ),
      rItems2 = Array(numItems)
        .fill()
        .map(() =>
          store.createRecord('record-item', {
            id: `${Math.random()}`,
            whenCreated: new Date(Date.now() + 1000)
          })
        ),
      numNotes = 8,
      rNotes = Array(numNotes)
        .fill()
        .map(() =>
          store.createRecord('record-note', { id: `${Math.random()}`, whenCreated: new Date() })
        );

    assert.equal(obj.get('totalNumRecordItems'), null);
    assert.equal(obj.get('numRecordItems'), 0);
    assert.deepEqual(obj.get('recordItems'), []);
    assert.equal(obj.get('numRecordClusters'), 0);
    assert.deepEqual(obj.get('recordClusters'), []);

    obj.addRecordItems(rItems1);
    obj.addRecordItems(rNotes);
    obj.addRecordItems(rItems2);

    assert.equal(obj.get('totalNumRecordItems'), null);
    assert.equal(obj.get('numRecordItems'), numItems + numNotes + numItems);
    assert.equal(obj.get('numRecordClusters'), numItems + numNotes + numItems);
    assert.ok(obj.get('recordClusters').every(cl1 => cl1 instanceof RecordCluster));
    assert.ok(obj.get('recordClusters').every(cl1 => isPresent(cl1.get('label'))));
    assert.ok(obj.get('recordClusters').every(cl1 => cl1.get('numItems') === 1));
    assert.ok(obj.get('recordClusters').every(cl1 => cl1.get('items.length') === 1));

    rNotes.objectAt(0).set('hasBeenDeleted', true);

    assert.equal(obj.get('totalNumRecordItems'), null);
    assert.equal(obj.get('numRecordItems'), numItems + numNotes + numItems);
    assert.equal(obj.get('numRecordClusters'), numItems + numNotes + numItems);
    assert.ok(obj.get('recordClusters').every(cl1 => cl1 instanceof RecordCluster));
    assert.ok(obj.get('recordClusters').every(cl1 => isPresent(cl1.get('label'))));
    assert.ok(obj.get('recordClusters').every(cl1 => cl1.get('numItems') === 1));
    assert.ok(obj.get('recordClusters').every(cl1 => cl1.get('items.length') === 1));
    assert.ok(obj.get('recordClusters').any(cl1 => cl1.get('label').includes('delete')));
    obj.get('recordClusters').forEach(cl1 => {
      if (cl1.get('label').includes('delete')) {
        assert.ok(cl1.get('alwaysCluster'));
      }
    });

    rNotes.objectAt(numNotes - 1).set('hasBeenDeleted', true);

    assert.equal(obj.get('totalNumRecordItems'), null);
    assert.equal(obj.get('numRecordItems'), numItems + numNotes + numItems);
    assert.equal(obj.get('numRecordClusters'), numItems + numNotes + numItems);
    assert.ok(obj.get('recordClusters').every(cl1 => cl1 instanceof RecordCluster));
    assert.ok(obj.get('recordClusters').every(cl1 => isPresent(cl1.get('label'))));
    assert.ok(obj.get('recordClusters').every(cl1 => cl1.get('numItems') === 1));
    assert.ok(obj.get('recordClusters').every(cl1 => cl1.get('items.length') === 1));
    assert.ok(obj.get('recordClusters').any(cl1 => cl1.get('label').includes('delete')));
    obj.get('recordClusters').forEach(cl1 => {
      if (cl1.get('label').includes('delete')) {
        assert.ok(cl1.get('alwaysCluster'));
      }
    });

    rNotes.forEach(rNote1 => rNote1.set('hasBeenDeleted', true));

    assert.equal(obj.get('totalNumRecordItems'), null);
    assert.equal(obj.get('numRecordItems'), numItems + numNotes + numItems);
    assert.equal(
      obj.get('numRecordClusters'),
      numItems + 1 + numItems,
      'deleted items are clustered'
    );
    assert.ok(obj.get('recordClusters').every(cl1 => cl1 instanceof RecordCluster));
    assert.ok(obj.get('recordClusters').every(cl1 => isPresent(cl1.get('label'))));
    assert.notOk(obj.get('recordClusters').every(cl1 => cl1.get('numItems') === 1));
    assert.notOk(obj.get('recordClusters').every(cl1 => cl1.get('items.length') === 1));
    assert.ok(obj.get('recordClusters').any(cl1 => cl1.get('numItems') === numNotes));
    assert.ok(obj.get('recordClusters').any(cl1 => cl1.get('items.length') === numNotes));
    assert.ok(obj.get('recordClusters').any(cl1 => cl1.get('label').includes('delete')));
    obj.get('recordClusters').forEach(cl1 => {
      if (cl1.get('label').includes('delete')) {
        assert.ok(cl1.get('alwaysCluster'));
      }
    });
  });
});
