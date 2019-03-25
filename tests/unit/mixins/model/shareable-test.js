import Constants from 'textup-frontend/constants';
import DS from 'ember-data';
import Ember from 'ember';
import ModelShareableMixin from 'textup-frontend/mixins/model/shareable';
import { moduleFor, test } from 'ember-qunit';

const { run } = Ember;

moduleFor('mixin:model/shareable', 'Unit | Mixin | model/shareable', {
  beforeEach() {
    this.register('model:shareable-model', DS.Model.extend(ModelShareableMixin));
    this.inject.service('store');
  },
  subject() {
    return run(() => this.store.createRecord('shareable-model'));
  },
});

test('computed properties', function(assert) {
  const subject = this.subject();

  run(() => {
    assert.notOk(subject.get(Constants.PROP_NAME.SHARING_PERMISSION));
    assert.equal(subject.get('isShared'), false);
    assert.equal(subject.get('isDelegatePermission'), false);
    assert.equal(subject.get('isViewPermission'), false);
    assert.equal(subject.get('allowEdits'), true);

    subject.set(Constants.PROP_NAME.SHARING_PERMISSION, 'invalid');
    assert.equal(subject.get('isShared'), true);
    assert.equal(subject.get('isDelegatePermission'), false);
    assert.equal(subject.get('isViewPermission'), false);
    assert.equal(subject.get('allowEdits'), false);

    subject.set(Constants.PROP_NAME.SHARING_PERMISSION, Constants.SHARING_PERMISSION.VIEW);
    assert.equal(subject.get('isShared'), true);
    assert.equal(subject.get('isDelegatePermission'), false);
    assert.equal(subject.get('isViewPermission'), true);
    assert.equal(subject.get('allowEdits'), false);

    subject.set(Constants.PROP_NAME.SHARING_PERMISSION, Constants.SHARING_PERMISSION.DELEGATE);
    assert.equal(subject.get('isShared'), true);
    assert.equal(subject.get('isDelegatePermission'), true);
    assert.equal(subject.get('isViewPermission'), false);
    assert.equal(subject.get('allowEdits'), true);
  });
});
