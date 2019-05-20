import { run } from '@ember/runloop';
import * as AliasModelNameInitializer from 'textup-frontend/initializers/alias-model-name';
import Constants from 'textup-frontend/constants';
import DS from 'ember-data';
import ModelHasUrlIdentifierMixin from 'textup-frontend/mixins/model/has-url-identifier';
import { moduleFor, test } from 'ember-qunit';

const MODEL_NAME = 'has-url-identifier-model';

moduleFor('mixin:model/has-url-identifier', 'Unit | Mixin | model/has url identifier', {
  beforeEach() {
    AliasModelNameInitializer.aliasModelName();
    this.register(`model:${MODEL_NAME}`, DS.Model.extend(ModelHasUrlIdentifierMixin));
    this.inject.service('store');
  },
  afterEach() {
    AliasModelNameInitializer.cleanUpModelNameAlias();
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
