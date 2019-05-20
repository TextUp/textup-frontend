import { run } from '@ember/runloop';
import Constants from 'textup-frontend/constants';
import HasReadableIdentifier from 'textup-frontend/mixins/model/has-readable-identifier';
import HasUrlIdentifier from 'textup-frontend/mixins/model/has-url-identifier';
import sinon from 'sinon';
import { moduleForModel, test } from 'ember-qunit';

moduleForModel('team', 'Unit | Model | team', {
  needs: [
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
    this.inject.service('store');
  },
});

test('default values', function(assert) {
  const model = this.subject();

  assert.equal(model.get('hexColor'), Constants.COLOR.BRAND);
  assert.deepEqual(model.get('actions'), []);
});

test('rolling back', function(assert) {
  const model = this.subject(),
    rollbackSpy = sinon.spy();

  model.set('location.content', { rollbackAttributes: rollbackSpy });
  model.get('actions').pushObject('hi');

  assert.equal(model.get('actions.length'), 1);

  model.rollbackAttributes();

  assert.equal(model.get('actions.length'), 0);
  assert.ok(rollbackSpy.calledOnce);
});

test('dirty checking', function(assert) {
  const obj = this.subject();

  assert.equal(obj.get('isDirty'), true);
  assert.equal(obj.get('hasManualChanges'), false);

  obj.set('phoneAction', Constants.ACTION.PHONE.DEACTIVATE);

  assert.equal(obj.get('hasManualChanges'), true);

  obj.setProperties({
    phoneAction: null,
    'location.content': { isDirty: true },
  });

  assert.equal(obj.get('hasManualChanges'), true);

  obj.set('location.content.isDirty', false);

  assert.equal(obj.get('hasManualChanges'), false);
});

test('has appropriate identifiers', function(assert) {
  const obj = this.subject();
  assert.ok(HasReadableIdentifier.detect(obj));
  assert.ok(HasUrlIdentifier.detect(obj));
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

test('validation', function(assert) {
  run(() => {
    const model = this.subject(),
      done = assert.async(),
      loc1 = this.store.createRecord('location', { address: 'hi', lat: 0, lng: 0 });

    assert.ok(model.get('validations.attrs.phone'), 'has validation for phone');
    model.setProperties({
      name: null,
      hexColor: null,
      location: null,
      phoneAction: 'invalid',
      transferFilter: null,
    });
    model
      .validate()
      .then(() => {
        assert.equal(model.get('validations.isTruelyValid'), false);
        assert.equal(model.get('validations.attrs.name.isTruelyValid'), false);
        assert.equal(model.get('validations.attrs.hexColor.isTruelyValid'), false);
        assert.equal(model.get('validations.attrs.location.isTruelyValid'), false);
        assert.equal(model.get('validations.attrs.phoneAction.isTruelyValid'), false);
        assert.equal(model.get('validations.attrs.transferFilter.isTruelyValid'), false);

        model.setProperties({
          name: 'hi',
          hexColor: 'hi',
          location: loc1,
          phoneAction: Object.values(Constants.ACTION.PHONE)[0],
          transferFilter: 'ok',
        });
        return model.validate();
      })
      .then(() => {
        assert.equal(model.get('validations.isTruelyValid'), true);

        done();
      });
  });
});
