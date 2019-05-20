import EmberObject from '@ember/object';
import ModelDirtiableMixin from 'textup-frontend/mixins/model/dirtiable';
import { module, test } from 'qunit';

module('Unit | Mixin | model/dirtiable');

test('it works', function(assert) {
  const ModelDirtiableObject = EmberObject.extend(ModelDirtiableMixin),
    obj = ModelDirtiableObject.create();

  assert.equal(obj.get('isDirty'), false);

  obj.setProperties({
    hasDirtyAttributes: 'a truthy value',
    hasManualChanges: 88
  });
  assert.equal(obj.get('isDirty'), true);

  obj.setProperties({
    hasDirtyAttributes: 0,
    hasManualChanges: 88
  });
  assert.equal(obj.get('isDirty'), true);

  obj.setProperties({
    hasDirtyAttributes: 0,
    hasManualChanges: null
  });
  assert.equal(obj.get('isDirty'), false);
});
