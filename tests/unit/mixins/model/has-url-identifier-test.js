import Constants from 'textup-frontend/constants';
import DS from 'ember-data';
import Ember from 'ember';
import ModelHasUrlIdentifierMixin from 'textup-frontend/mixins/model/has-url-identifier';
import { moduleFor, test } from 'ember-qunit';

const { run } = Ember,
  MODEL_NAME = 'has-url-identifier-model';

moduleFor('mixin:model/has-url-identifier', 'Unit | Mixin | model/has url identifier', {
  beforeEach() {
    this.register(`model:${MODEL_NAME}`, DS.Model.extend(ModelHasUrlIdentifierMixin));
    this.inject.service('store');
  },
  subject() {
    return this.store.createRecord(MODEL_NAME);
  },
});

test('properties', function(assert) {
  run(() => {
    const subject = this.subject(),
      id = Math.random();
    subject.set('id', id);

    assert.equal(subject.get(Constants.PROP_NAME.URL_IDENT), `${MODEL_NAME}-${id}`);
  });
});
