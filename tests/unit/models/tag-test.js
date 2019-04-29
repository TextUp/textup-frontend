import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import { moduleForModel, test } from 'ember-qunit';

const { run } = Ember;

moduleForModel('tag', 'Unit | Model | tag', {
  needs: [
    'model:future-message',
    'model:phone',
    'model:record-item',
    'validator:inclusion',
    'validator:presence',
  ],
});

test('default values', function(assert) {
  const model = this.subject();

  assert.equal(model.get('hexColor'), Constants.COLOR.BRAND);
  assert.deepEqual(model.get('actions'), []);
});

test('filter value', function(assert) {
  const model = this.subject(),
    name = Math.random();

  run(() => model.setProperties({ name }));

  assert.equal(model.get(Constants.PROP_NAME.FILTER_VAL), name);
});

test('number members', function(assert) {
  run(() => {
    const model = this.subject();

    assert.notOk(model.get('numMembers'));
    assert.equal(model.get('isEmpty'), true);

    model.set('numMembers', 'hi');
    assert.equal(model.get('isEmpty'), true);

    model.set('numMembers', -88);
    assert.equal(model.get('isEmpty'), true);

    model.set('numMembers', 0);
    assert.equal(model.get('isEmpty'), true);

    model.set('numMembers', 88);
    assert.equal(model.get('isEmpty'), false);
  });
});

test('clearing membership changes', function(assert) {
  const model = this.subject();

  assert.equal(model.get('actions.length'), 0);

  model.get('actions').pushObject('hi');
  assert.equal(model.get('actions.length'), 1);

  model.clearMembershipChanges();
  assert.equal(model.get('actions.length'), 0);
});

test('rolling back', function(assert) {
  run(() => {
    const model = this.subject();

    assert.equal(model.get('actions.length'), 0);

    model.get('actions').pushObject('hi');
    assert.equal(model.get('actions.length'), 1);

    model.rollbackAttributes();
    assert.equal(model.get('actions.length'), 0);
  });
});

test('validation', function(assert) {
  run(() => {
    const model = this.subject(),
      done = assert.async();

    model.set('name', null);
    model
      .validate()
      .then(() => {
        assert.equal(model.get('validations.isTruelyValid'), false);
        assert.equal(model.get('validations.attrs.name.isTruelyValid'), false);

        model.set('name', 'hi');
        return model.validate();
      })
      .then(() => {
        assert.equal(model.get('validations.isTruelyValid'), true);

        done();
      });
  });
});
