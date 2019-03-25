import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import SerializerShareableMixin from 'textup-frontend/mixins/serializer/shareable';
import { module, test } from 'qunit';

module('Unit | Mixin | serializer/shareable');

test('it works', function(assert) {
  let SerializerShareableObject = Ember.Object.extend(SerializerShareableMixin);
  let subject = SerializerShareableObject.create();

  assert.equal(subject.attrs[Constants.PROP_NAME.SHARING_PERMISSION].key, 'permission');
});
