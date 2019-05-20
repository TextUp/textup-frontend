import EmberObject from '@ember/object';
import Constants from 'textup-frontend/constants';
import SerializerShareableMixin from 'textup-frontend/mixins/serializer/shareable';
import { module, test } from 'qunit';

module('Unit | Mixin | serializer/shareable');

test('it works', function(assert) {
  let SerializerShareableObject = EmberObject.extend(SerializerShareableMixin);
  let subject = SerializerShareableObject.create();

  assert.equal(subject.attrs[Constants.PROP_NAME.SHARING_PERMISSION].key, 'permission');
});
