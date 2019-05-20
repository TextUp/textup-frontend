import { run } from '@ember/runloop';
import Constants from 'textup-frontend/constants';
import DS from 'ember-data';
import ModelHasReadableIdentifierMixin from 'textup-frontend/mixins/model/has-readable-identifier';
import { moduleFor, test } from 'ember-qunit';

moduleFor('mixin:model/has-readable-identifier', 'Unit | Mixin | model/has readable identifier', {
  beforeEach() {
    this.register(
      'model:has-readable-identifier-model',
      DS.Model.extend(ModelHasReadableIdentifierMixin)
    );
    this.inject.service('store');
  },
  subject() {
    return this.store.createRecord('has-readable-identifier-model');
  },
});

test('properties', function(assert) {
  run(() => {
    const subject = this.subject(),
      name = Math.random();
    subject.set('name', name);

    assert.equal(subject.get(Constants.PROP_NAME.READABLE_IDENT), name);

    assert.throws(() => subject.set(Constants.PROP_NAME.READABLE_IDENT, null));
  });
});
