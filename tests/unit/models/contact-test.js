import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import { moduleForModel, test } from 'ember-qunit';

const { run } = Ember;

moduleForModel('contact', 'Unit | Model | contact', {
  needs: [
    'model:contact/unread-info',
    'model:contact/share-info',
    'model:future-message',
    'model:phone',
    'model:record-item',
    'model:tag',
    'transform:collection',
    'validator:collection',
    'validator:inclusion',
    'validator:length',
    'validator:presence',
  ],
});

test('default values', function(assert) {
  const model = this.subject();

  assert.equal(model.get('name'), '');
  assert.equal(model.get('note'), '');
  assert.equal(model.get('status'), Constants.CONTACT.STATUS.ACTIVE);
  assert.equal(model.get('isSelected'), false);

  assert.deepEqual(model.get('actions'), []);
  assert.deepEqual(model.get('numberDuplicates'), []);
  assert.deepEqual(model.get('numbers'), []);
});

test('filter value', function(assert) {
  const model = this.subject(),
    name = Math.random();

  run(() => model.setProperties({ name }));

  assert.equal(model.get(Constants.PROP_NAME.FILTER_VAL), name);
});

test('rolling back', function(assert) {
  const model = this.subject();
  model.set('isSelected', true);
  model.get('numberDuplicates').pushObject('hi');
  model.get('actions').pushObject('hi');

  assert.equal(model.get('numberDuplicates.length'), 1);
  assert.equal(model.get('actions.length'), 1);

  run(() => {
    model.rollbackAttributes();

    assert.equal(model.get('isSelected'), false);
    assert.deepEqual(model.get('actions'), []);
    assert.deepEqual(model.get('numberDuplicates'), []);
  });
});

test('statuses', function(assert) {
  run(() => {
    const model = this.subject();

    assert.equal(model.get('status'), Constants.CONTACT.STATUS.ACTIVE);
    assert.equal(model.get('isArchived'), false);
    assert.equal(model.get('isBlocked'), false);
    assert.equal(model.get('isActive'), true);
    assert.equal(model.get('isUnread'), false);
    assert.equal(model.get('intStatus'), 1);

    model.set('status', 'invalid');
    assert.equal(model.get('isArchived'), false);
    assert.equal(model.get('isBlocked'), false);
    assert.equal(model.get('isActive'), false);
    assert.equal(model.get('isUnread'), false);
    assert.equal(model.get('intStatus'), 3);

    model.set('status', Constants.CONTACT.STATUS.UNREAD);
    assert.equal(model.get('isArchived'), false);
    assert.equal(model.get('isBlocked'), false);
    assert.equal(model.get('isActive'), false);
    assert.equal(model.get('isUnread'), true);
    assert.equal(model.get('intStatus'), 0);

    model.set('status', Constants.CONTACT.STATUS.ARCHIVED);
    assert.equal(model.get('isArchived'), true);
    assert.equal(model.get('isBlocked'), false);
    assert.equal(model.get('isActive'), false);
    assert.equal(model.get('isUnread'), false);
    assert.equal(model.get('intStatus'), 2);

    model.set('status', Constants.CONTACT.STATUS.BLOCKED);
    assert.equal(model.get('isArchived'), false);
    assert.equal(model.get('isBlocked'), true);
    assert.equal(model.get('isActive'), false);
    assert.equal(model.get('isUnread'), false);
    assert.equal(model.get('intStatus'), 4);
  });
});

test('is any status', function(assert) {
  const model = this.subject();

  assert.equal(model.get('status'), Constants.CONTACT.STATUS.ACTIVE);

  assert.equal(model.isAnyStatus(), false);
  assert.equal(model.isAnyStatus([null]), false);
  assert.equal(model.isAnyStatus('blah'), false);
  assert.equal(model.isAnyStatus(Constants.CONTACT.STATUS.ACTIVE), true);
  assert.equal(model.isAnyStatus([Constants.CONTACT.STATUS.ACTIVE]), true);
});

test('managing number duplicates', function(assert) {
  const model = this.subject(),
    num1 = Math.random(),
    val1 = Math.random();

  assert.equal(model.get('numberDuplicates.length'), 0);

  model.addDuplicatesForNumber();
  model.addDuplicatesForNumber(num1);
  model.addDuplicatesForNumber(num1, []);
  assert.equal(model.get('numberDuplicates.length'), 0);

  model.addDuplicatesForNumber(num1, val1);
  assert.equal(model.get('numberDuplicates.length'), 1);

  model.removeDuplicatesForNumber();
  model.removeDuplicatesForNumber('blah');
  assert.equal(model.get('numberDuplicates.length'), 1);

  model.removeDuplicatesForNumber(num1);
  assert.equal(model.get('numberDuplicates.length'), 0);
});

test('clearing sharing changes', function(assert) {
  const model = this.subject();

  assert.equal(model.get('actions.length'), 0);

  model.get('actions').pushObject('hi');
  assert.equal(model.get('actions.length'), 1);

  model.clearSharingChanges();
  assert.equal(model.get('actions.length'), 0);
});

test('validations', function(assert) {
  run(() => {
    const model = this.subject(),
      done = assert.async(),
      validNum1 = '626 111 2222';

    model.setProperties({
      name: null,
      status: 'invalid',
      note: Array(2000)
        .fill()
        .join('.'),
      numbers: [{ number: 'invalid number' }],
    });

    model
      .validate()
      .then(() => {
        assert.equal(model.get('validations.isTruelyValid'), false);
        assert.equal(model.get('validations.attrs.name.isTruelyValid'), false);
        assert.equal(model.get('validations.attrs.note.isTruelyValid'), false);
        assert.equal(model.get('validations.attrs.status.isTruelyValid'), false);
        assert.equal(model.get('validations.attrs.numbers.isTruelyValid'), false);

        model.setProperties({
          name: 'hi',
          status: Constants.CONTACT.STATUS.ACTIVE,
          note: null,
          numbers: [{ number: validNum1 }],
        });
        return model.validate();
      })
      .then(() => {
        assert.equal(model.get('validations.isTruelyValid'), true);

        done();
      });
  });
});
