import Ember from 'ember';
import SerializerOwnsFutureMessagesMixin from 'textup-frontend/mixins/serializer/owns-future-messages';
import { module, test } from 'qunit';

module('Unit | Mixin | serializer/owns future messages');

test('future messages key is renamed and not serialized', function(assert) {
  const SerializerOwnsFutureMessagesObject = Ember.Object.extend(SerializerOwnsFutureMessagesMixin);
  const obj = SerializerOwnsFutureMessagesObject.create();

  assert.equal(obj.attrs._futureMessages.key, 'futureMessages', 'api sends without the underscore');
  assert.equal(obj.attrs._futureMessages.serialize, false);
});
