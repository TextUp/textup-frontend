import { run } from '@ember/runloop';
import Constants from 'textup-frontend/constants';
import moment from 'moment';
import sinon from 'sinon';
import { moduleForModel, test } from 'ember-qunit';

moduleForModel('phone', 'Unit | Model | phone', {
  needs: [
    'model:contact',
    'model:future-message',
    'model:media',
    'model:record-item',
    'model:tag',
    'validator:collection',
    'validator:inclusion',
    'validator:length',
    'validator:presence',
  ],
});

test('default values', function(assert) {
  const obj = this.subject();

  assert.equal(obj.get('contactsFilter'), Constants.CONTACT.FILTER.ALL);
  assert.equal(obj.get('language'), Constants.DEFAULT.LANGUAGE);
  assert.equal(obj.get('awayMessage'), '');
  assert.equal(obj.get('awayMessageMaxLength'), 320);
});

test('dirty checking', function(assert) {
  const obj = this.subject();

  assert.equal(obj.get('isDirty'), true, 'will always be dirty because the model is new');
  assert.equal(obj.get('hasManualChanges'), false);

  obj.set('media.content', { isDirty: true });
  assert.equal(obj.get('hasManualChanges'), true);

  obj.setProperties({ 'media.content.isDirty': false });
  assert.equal(obj.get('hasManualChanges'), false);
});

test('rolling back changes', function(assert) {
  const obj = this.subject(),
    rollbackSpy = sinon.spy();

  obj.setProperties({
    'media.content': { rollbackAttributes: rollbackSpy },
  });

  obj.rollbackAttributes();

  // need to store rollbackSpy separately because all of the association fields
  // are cleared on rollback
  assert.ok(rollbackSpy.calledOnce);
});

test('validation', function(assert) {
  run(() => {
    const done = assert.async(),
      obj = this.subject();

    obj
      .validate()
      .then(({ model, validations }) => {
        assert.equal(validations.get('isTruelyValid'), false, 'away message cannot be blank');

        model.set(
          'awayMessage',
          Array(model.get('awayMessageMaxLength') * 5)
            .fill()
            .map(() => 'hi')
            .join()
        );
        return model.validate();
      })
      .then(({ model, validations }) => {
        assert.equal(validations.get('isTruelyValid'), false, 'away message cannot be too long');

        model.set('awayMessage', 'hello! I am a reasonable length message.');
        return model.validate();
      })
      .then(({ validations }) => {
        assert.equal(validations.get('isTruelyValid'), true);

        done();
      });
  });
});

test('contact filter and statuses', function(assert) {
  run(() => {
    const obj = this.subject(),
      statuses = Constants.CONTACT.STATUS,
      filters = Constants.CONTACT.FILTER;

    assert.throws(() => obj.set('contactStatuses', []));

    assert.equal(obj.get('contactStatuses').length, 2, 'contact status default value');
    assert.ok(obj.get('contactStatuses').includes(statuses.UNREAD));
    assert.ok(obj.get('contactStatuses').includes(statuses.ACTIVE));

    obj.set('contactsFilter', filters.UNREAD);
    assert.equal(obj.get('contactStatuses').length, 1);
    assert.ok(obj.get('contactStatuses').includes(statuses.UNREAD));

    obj.set('contactsFilter', 'invalid value');
    assert.equal(obj.get('contactStatuses').length, 2);
    assert.ok(obj.get('contactStatuses').includes(statuses.UNREAD));
    assert.ok(obj.get('contactStatuses').includes(statuses.ACTIVE));

    obj.set('contactsFilter', filters.ARCHIVED);
    assert.equal(obj.get('contactStatuses').length, 1);
    assert.ok(obj.get('contactStatuses').includes(statuses.ARCHIVED));

    obj.set('contactsFilter', filters.ALL);
    assert.equal(obj.get('contactStatuses').length, 2);
    assert.ok(obj.get('contactStatuses').includes(statuses.UNREAD));
    assert.ok(obj.get('contactStatuses').includes(statuses.ACTIVE));

    obj.set('contactsFilter', filters.BLOCKED);
    assert.equal(obj.get('contactStatuses').length, 1);
    assert.ok(obj.get('contactStatuses').includes(statuses.BLOCKED));
  });
});

test('resetting contacts filter', function(assert) {
  const obj = this.subject();

  obj.set('contactsFilter', Constants.CONTACT.FILTER.BLOCKED);

  obj.resetContactsFilter();

  assert.equal(obj.get('contactsFilter'), Constants.CONTACT.FILTER.ALL);
});

test('displaying contacts based on set filter', function(assert) {
  const obj = this.subject(),
    statuses = Constants.CONTACT.STATUS,
    filters = Constants.CONTACT.FILTER,
    c1 = run(() => this.store().createRecord('contact', { id: 1, status: 'invalid' })),
    c2 = run(() => this.store().createRecord('contact', { id: 2, status: statuses.UNREAD })),
    c3 = run(() => this.store().createRecord('contact', { id: 3, status: statuses.ACTIVE })),
    c4 = run(() => this.store().createRecord('contact', { id: 4, status: statuses.ARCHIVED })),
    c5 = run(() => this.store().createRecord('contact', { id: 5, status: statuses.BLOCKED }));

  obj.addContacts([c1, c2, c3, c4, c5]);

  assert.equal(obj.get('contacts.length'), 2);
  assert.deepEqual(obj.get('contacts').mapBy('status'), [statuses.UNREAD, statuses.ACTIVE]);

  obj.set('contactsFilter', filters.UNREAD);
  assert.equal(obj.get('contacts.length'), 1);
  assert.deepEqual(obj.get('contacts').mapBy('status'), [statuses.UNREAD]);

  obj.set('contactsFilter', filters.ARCHIVED);
  assert.equal(obj.get('contacts.length'), 1);
  assert.deepEqual(obj.get('contacts').mapBy('status'), [statuses.ARCHIVED]);

  obj.set('contactsFilter', filters.BLOCKED);
  assert.equal(obj.get('contacts.length'), 1);
  assert.deepEqual(obj.get('contacts').mapBy('status'), [statuses.BLOCKED]);

  obj.set('contactsFilter', filters.ALL);
  assert.equal(obj.get('contacts.length'), 2);
  assert.deepEqual(obj.get('contacts').mapBy('status'), [statuses.UNREAD, statuses.ACTIVE]);
});

test('maintaining contact order', function(assert) {
  run(() => {
    const obj = this.subject(),
      statuses = Constants.CONTACT.STATUS,
      c1 = this.store().createRecord('contact', {
        id: 1,
        status: statuses.ACTIVE,
        lastRecordActivity: moment().toDate(),
      }),
      c2 = this.store().createRecord('contact', {
        id: 2,
        status: statuses.ACTIVE,
        lastRecordActivity: moment()
          .subtract(1, 'day')
          .toDate(),
      }),
      c3 = this.store().createRecord('contact', { id: 3, status: statuses.UNREAD }),
      c4 = this.store().createRecord('contact', {
        id: 4,
        status: statuses.ACTIVE,
        lastRecordActivity: moment()
          .add(1, 'day')
          .toDate(),
      });

    assert.equal(obj.get('contacts.length'), 0, 'starts out empty');

    assert.throws(() => obj.set('contacts', ['hi']));

    obj.addContacts(c1);
    assert.deepEqual(obj.get('contacts').mapBy('id'), [c1].mapBy('id'), 'can add a single contact');

    obj.addContacts([c2]);
    assert.deepEqual(
      obj.get('contacts').mapBy('id'),
      [c1, c2].mapBy('id'),
      'can also add as an array'
    );

    obj.addContacts([c3]);
    assert.deepEqual(obj.get('contacts').mapBy('id'), [c3, c1, c2].mapBy('id'));

    obj.addContacts([c4]);
    assert.deepEqual(
      obj.get('contacts').mapBy('id'),
      [c3, c4, c1, c2].mapBy('id'),
      'if same status, more recent comes first'
    );

    obj.clearContacts();
    assert.deepEqual(obj.get('contacts'), []);
  });
});

test('total number of contacts and clearing contacts', function(assert) {
  const obj = this.subject(),
    statuses = Constants.CONTACT.STATUS,
    c1 = run(() => this.store().createRecord('contact', { status: statuses.ACTIVE })),
    totalNum = 88;

  assert.equal(obj.get('totalNumContacts'), null);
  assert.equal(obj.get('contacts.length'), 0);

  obj.set('totalNumContacts', totalNum);
  assert.equal(obj.get('totalNumContacts'), totalNum);

  obj.addContacts(null);
  assert.equal(obj.get('contacts.length'), 0);

  obj.addContacts([]);
  assert.equal(obj.get('contacts.length'), 0);

  obj.addContacts({});
  assert.equal(obj.get('contacts.length'), 0);

  obj.addContacts(c1);
  assert.equal(obj.get('contacts.length'), 1);

  obj.clearContacts();
  assert.equal(obj.get('totalNumContacts'), null);
  assert.equal(obj.get('contacts.length'), 0);
});

test('ignores duplicate contacts (based on id)', function(assert) {
  const obj = this.subject(),
    statuses = Constants.CONTACT.STATUS,
    c1 = run(() => this.store().createRecord('contact', { id: 1, status: statuses.ACTIVE })),
    c2 = run(() => this.store().createRecord('contact', { id: 2, status: statuses.ACTIVE }));

  obj.addContacts(c1);
  assert.equal(obj.get('contacts.length'), 1);

  obj.addContacts(c1);
  assert.equal(obj.get('contacts.length'), 1);

  obj.addContacts(c2);
  assert.equal(obj.get('contacts.length'), 2);
});
