import Ember from 'ember';
import { moduleForModel, test } from 'ember-qunit';

// [TODO] finish testing this model

const { run } = Ember;

moduleForModel('staff', 'Unit | Model | staff', {
  needs: [
    'service:constants',
    'service:auth-service',
    'validator:belongs-to',
    'validator:format',
    'validator:length',
    'validator:presence',
    'validator:inclusion',
    'model:team',
    'model:organization',
    'model:schedule',
    'model:phone',
    'transform:phone-number'
  ],
  beforeEach() {
    this.inject.service('constants');
  }
});

test('dirty checking', function(assert) {
  const obj = this.subject();

  assert.equal(obj.get('isDirty'), true);
  assert.equal(obj.get('hasManualChanges'), false);

  obj.set('phoneAction', this.constants.ACTION.PHONE.DEACTIVATE);

  assert.equal(obj.get('hasManualChanges'), true);

  obj.setProperties({
    phoneAction: null,
    'schedule.content': { isDirty: true }
  });

  assert.equal(obj.get('hasManualChanges'), true);

  obj.set('schedule.content.isDirty', false);

  assert.equal(obj.get('hasManualChanges'), false);
});

test('has transfer id', function(assert) {
  const obj = this.subject(),
    id = Math.random();
  obj.set('id', id);

  assert.ok(obj.get('transferId').indexOf(this.constants.MODEL.STAFF) > -1);
  assert.ok(obj.get('transferId').indexOf(id) > -1);
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
