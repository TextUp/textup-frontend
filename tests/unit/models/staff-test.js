import EmberObject from '@ember/object';
import { run } from '@ember/runloop';
import Constants from 'textup-frontend/constants';
import HasReadableIdentifier from 'textup-frontend/mixins/model/has-readable-identifier';
import HasUrlIdentifier from 'textup-frontend/mixins/model/has-url-identifier';
import NotificationsService from 'ember-cli-notifications/services/notification-messages-service';
import { moduleForModel, test } from 'ember-qunit';

moduleForModel('staff', 'Unit | Model | staff', {
  needs: [
    'model:location',
    'model:media',
    'model:organization',
    'model:phone',
    'model:tag',
    'model:team',
    'service:authService',
    'service:requestService',
    'service:storageService',
    'transform:phone-number',
    'validator:belongs-to',
    'validator:format',
    'validator:inclusion',
    'validator:length',
    'validator:presence',
  ],
  beforeEach() {
    // see https://github.com/stonecircle/ember-cli-notifications/issues/169
    this.register('service:notification-messages-service', NotificationsService);
    this.inject.service('store');
  },
});

test('default values', function(assert) {
  const model = this.subject();

  assert.equal(model.get('password'), '');
  assert.equal(model.get('lockCode'), '');
  assert.equal(model.get('isSelected'), false);
  assert.equal(model.get('shouldAddToGeneralUpdatesList'), false);
});

test('rolling back', function(assert) {
  run(() => {
    const model = this.subject();

    assert.equal(model.get('isSelected'), false);

    model.set('isSelected', true);
    assert.equal(model.get('isSelected'), true);

    model.rollbackAttributes();
    assert.equal(model.get('isSelected'), false);
  });
});

test('dirty checking', function(assert) {
  const obj = this.subject();

  assert.equal(obj.get('isDirty'), true);
  assert.equal(obj.get('hasManualChanges'), false);

  obj.set('phoneAction', Constants.ACTION.PHONE.DEACTIVATE);

  assert.equal(obj.get('hasManualChanges'), true);

  obj.setProperties({ phoneAction: null });

  assert.equal(obj.get('hasManualChanges'), false);
});

test('has identifiers', function(assert) {
  const obj = this.subject();

  assert.ok(HasReadableIdentifier.detect(obj));
  assert.ok(HasUrlIdentifier.detect(obj));
});

test('implements transfer filter', function(assert) {
  run(() => {
    const done = assert.async(),
      obj = this.subject(),
      name = Math.random(),
      username = Math.random(),
      email = Math.random();

    obj.setProperties({ name, username, email });

    obj.validate().then(({ model }) => {
      assert.equal(
        model.get('validations.attrs.transferFilter.isValid'),
        true,
        'transferFilter is specified'
      );

      assert.ok(obj.get('transferFilter').indexOf(name) > -1);
      assert.ok(obj.get('transferFilter').indexOf(username) > -1);
      assert.ok(obj.get('transferFilter').indexOf(email) > -1);

      done();
    });
  });
});

test('determining if is auth user', function(assert) {
  const model = this.subject(),
    thisId = Math.random();

  assert.equal(model.get('isAuthUser'), false);

  model.set('authService', EmberObject.create({ authUser: { id: thisId } }));
  model.set('id', thisId);

  assert.equal(model.get('isAuthUser'), true);
});

test('determining if has teams', function(assert) {
  run(() => {
    const model = this.subject(),
      team1 = this.store.createRecord('team');

    assert.equal(model.get('hasTeams'), false);

    model.get('teams').pushObject(team1);

    assert.equal(model.get('hasTeams'), true);
  });
});

test('determining if has personal number', function(assert) {
  run(() => {
    const model = this.subject();

    assert.equal(model.get('hasPersonalNumber'), false);

    model.set('personalNumber', 'hi');
    assert.equal(model.get('hasPersonalNumber'), true);
  });
});

test('status properties', function(assert) {
  run(() => {
    const model = this.subject();

    assert.notOk(model.get('status'));
    assert.equal(model.get('isBlocked'), false);
    assert.equal(model.get('isPending'), false);
    assert.equal(model.get('isStaff'), false);
    assert.equal(model.get('isAdmin'), false);

    model.set('status', 'invalid');
    assert.equal(model.get('isBlocked'), false);
    assert.equal(model.get('isPending'), false);
    assert.equal(model.get('isStaff'), false);
    assert.equal(model.get('isAdmin'), false);

    model.set('status', Constants.STAFF.STATUS.BLOCKED);
    assert.equal(model.get('isBlocked'), true);
    assert.equal(model.get('isPending'), false);
    assert.equal(model.get('isStaff'), false);
    assert.equal(model.get('isAdmin'), false);

    model.set('status', Constants.STAFF.STATUS.PENDING);
    assert.equal(model.get('isBlocked'), false);
    assert.equal(model.get('isPending'), true);
    assert.equal(model.get('isStaff'), false);
    assert.equal(model.get('isAdmin'), false);

    model.set('status', Constants.STAFF.STATUS.STAFF);
    assert.equal(model.get('isBlocked'), false);
    assert.equal(model.get('isPending'), false);
    assert.equal(model.get('isStaff'), true);
    assert.equal(model.get('isAdmin'), false);

    model.set('status', Constants.STAFF.STATUS.ADMIN);
    assert.equal(model.get('isBlocked'), false);
    assert.equal(model.get('isPending'), false);
    assert.equal(model.get('isStaff'), false);
    assert.equal(model.get('isAdmin'), true);
  });
});

test('is any status', function(assert) {
  run(() => {
    const model = this.subject();

    model.set('status', Constants.STAFF.STATUS.ADMIN);

    assert.equal(model.isAnyStatus(), false);
    assert.equal(model.isAnyStatus([null]), false);
    assert.equal(model.isAnyStatus(['blah']), false);
    assert.equal(model.isAnyStatus(Constants.STAFF.STATUS.ADMIN), true);
    assert.equal(model.isAnyStatus([Constants.STAFF.STATUS.ADMIN]), true);
  });
});

test('updating status methods', function(assert) {
  run(() => {
    const model = this.subject();

    model.set('isAuthUser', true);
    assert.notOk(model.get('status'));

    model.makeStaff();
    model.makeAdmin();
    model.block();
    assert.notOk(model.get('status'), 'cannot change status for self');

    model.set('isAuthUser', false);

    model.makeStaff();
    assert.equal(model.get('status'), Constants.STAFF.STATUS.STAFF);

    model.makeAdmin();
    assert.equal(model.get('status'), Constants.STAFF.STATUS.ADMIN);

    model.block();
    assert.equal(model.get('status'), Constants.STAFF.STATUS.BLOCKED);
  });
});

test('determining active phone owners', function(assert) {
  run(() => {
    const model = this.subject(),
      activePhone1 = this.store.createRecord('phone', { isActive: true }),
      inactivePhone1 = this.store.createRecord('phone', { isActive: false }),
      team1 = this.store.createRecord('team', {
        name: 'team1',
        phone: this.store.createRecord('phone', { isActive: true }),
      }),
      team2 = this.store.createRecord('team', {
        name: 'team2',
        phone: this.store.createRecord('phone', { isActive: false }),
      }),
      team3 = this.store.createRecord('team', {
        name: 'team2',
        phone: null,
      });

    assert.equal(model.get('allActivePhoneOwners.length'), 0);

    model.set('phone', inactivePhone1);
    assert.equal(model.get('allActivePhoneOwners.length'), 0);

    model.get('teams').pushObject(team1);
    assert.equal(model.get('allActivePhoneOwners.length'), 1);

    model.get('teams').pushObject(team2);
    assert.equal(model.get('allActivePhoneOwners.length'), 1);

    model.get('teams').pushObject(team3);
    assert.equal(model.get('allActivePhoneOwners.length'), 1);

    model.set('phone', activePhone1);
    assert.equal(model.get('allActivePhoneOwners.length'), 2);
  });
});

test('validation', function(assert) {
  const model = this.subject(),
    done = assert.async();

  assert.ok(model.get('validations.attrs.phone'), 'has validation for phone');
  model.setProperties({
    name: null,
    username: null,
    lockCode: '1',
    email: 'not a real email',
    phoneAction: 'invalid',
    transferFilter: null,
  });
  model
    .validate()
    .then(() => {
      assert.equal(model.get('validations.isTruelyValid'), false);
      assert.equal(model.get('validations.attrs.name.isTruelyValid'), false);
      assert.equal(model.get('validations.attrs.username.isTruelyValid'), false);
      assert.equal(model.get('validations.attrs.lockCode.isTruelyValid'), false);
      assert.equal(model.get('validations.attrs.email.isTruelyValid'), false);
      assert.equal(model.get('validations.attrs.phoneAction.isTruelyValid'), false);
      assert.equal(model.get('validations.attrs.transferFilter.isTruelyValid'), false);

      model.setProperties({
        name: 'hi',
        username: 'username with invalid characters!',
        lockCode: '1234',
        email: 'email@email.com',
        phoneAction: Object.values(Constants.ACTION.PHONE)[0],
        transferFilter: 'ok',
      });
      return model.validate();
    })
    .then(() => {
      assert.equal(model.get('validations.isTruelyValid'), false);
      assert.equal(model.get('validations.attrs.name.isTruelyValid'), true);
      assert.equal(model.get('validations.attrs.username.isTruelyValid'), false);
      assert.equal(model.get('validations.attrs.lockCode.isTruelyValid'), true);
      assert.equal(model.get('validations.attrs.email.isTruelyValid'), true);
      assert.equal(model.get('validations.attrs.phoneAction.isTruelyValid'), true);
      assert.equal(model.get('validations.attrs.transferFilter.isTruelyValid'), true);

      model.setProperties({ username: 'valid-username' });
      return model.validate();
    })
    .then(() => {
      assert.equal(model.get('validations.isTruelyValid'), true);

      done();
    });
});
