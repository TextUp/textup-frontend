import DS from 'ember-data';
import Ember from 'ember';
import ModelHasAuthorMixin from 'textup-frontend/mixins/model/has-author';
import { moduleFor, test } from 'ember-qunit';

// testing DS.attr in mixins from https://stackoverflow.com/a/39860250
moduleFor('mixin:model/has-author', 'Unit | Mixin | model/has-author', {
  subject() {
    // The scope here is the module, so we have access to the registration stuff.
    // Define and register our phony host model.
    const HasAuthorMixinModel = DS.Model.extend(ModelHasAuthorMixin);
    this.register('model:has-author-mixin-model', HasAuthorMixinModel);
    // Once our model is registered, we create it via the store in the
    // usual way and return it. Since createRecord is async, we need
    // an Ember.run.
    return Ember.run(() => {
      const store = Ember.getOwner(this).lookup('service:store');
      return store.createRecord('has-author-mixin-model');
    });
  }
});

test('properties are present', function(assert) {
  const obj1 = this.subject(),
    data = {
      authorName: 'Kiki Bai',
      authorId: 88,
      authorType: 'STAFF'
    };
  assert.equal(obj1.get('authorName'), null);
  assert.equal(obj1.get('authorId'), null);
  assert.equal(obj1.get('authorType'), null);

  Ember.run(() => {
    obj1.setProperties(data);
    assert.equal(obj1.get('authorName'), data.authorName);
    assert.equal(obj1.get('authorId'), data.authorId);
    assert.equal(obj1.get('authorType'), data.authorType);
  });
});
