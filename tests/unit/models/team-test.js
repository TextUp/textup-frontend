import Ember from 'ember';
import { moduleForModel, test } from 'ember-qunit';

// [TODO] finish testing this model, including that validation.attrs isn't shared with team

const { run } = Ember;

moduleForModel('team', 'Unit | Model | team', {
  needs: [
    'service:constants',
    'validator:belongs-to',
    'validator:presence',
    'validator:number',
    'validator:inclusion',
    'model:team',
    'model:organization',
    'model:location',
    'model:phone',
  ],
  beforeEach() {
    this.inject.service('constants');
    this.inject.service('store');
  },
});

test('dirty checking', function(assert) {
  const obj = this.subject();

  assert.equal(obj.get('isDirty'), true);
  assert.equal(obj.get('hasManualChanges'), false);

  obj.set('phoneAction', this.constants.ACTION.PHONE.DEACTIVATE);

  assert.equal(obj.get('hasManualChanges'), true);

  obj.setProperties({
    phoneAction: null,
    'location.content': { isDirty: true },
  });

  assert.equal(obj.get('hasManualChanges'), true);

  obj.set('location.content.isDirty', false);

  assert.equal(obj.get('hasManualChanges'), false);
});

test('has transfer id', function(assert) {
  const obj = this.subject(),
    id = Math.random();
  obj.set('id', id);

  assert.ok(obj.get('transferId').indexOf(this.constants.MODEL.TEAM) > -1);
  assert.ok(obj.get('transferId').indexOf(id) > -1);
});

test('implements transfer filter', function(assert) {
  run(() => {
    const done = assert.async(),
      obj = this.subject(),
      name = Math.random(),
      address = Math.random();

    obj.setProperties({ name, location: this.store.createRecord('location', { address }) });

    obj.validate().then(({ model }) => {
      assert.equal(
        model.get('validations.attrs.transferFilter.isValid'),
        true,
        'transferFilter is specified'
      );

      assert.ok(obj.get('transferFilter').indexOf(name) > -1);
      assert.ok(obj.get('transferFilter').indexOf(address) > -1);

      done();
    });
  });
});
