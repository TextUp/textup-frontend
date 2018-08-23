import Ember from 'ember';
import SerializerHasMediaMixin from 'textup-frontend/mixins/serializer/has-media';
import { moduleForModel, test } from 'ember-qunit';

const { isPresent, typeOf } = Ember;

moduleForModel('media', 'Unit | Mixin | serializer/has media', {
  needs: ['service:constants']
});

test('attributes', function(assert) {
  const SerializerHasMediaObject = Ember.Object.extend(SerializerHasMediaMixin),
    serializer = SerializerHasMediaObject.create();

  assert.equal(serializer.attrs.media.deserialize, 'records');
  assert.equal(serializer.attrs.media.serialize, false);
});

test('serializing with media actions', function(assert) {
  const SerializerHasMediaObject = Ember.Object.extend(SerializerHasMediaMixin),
    serializer = SerializerHasMediaObject.create(),
    media = this.subject(),
    obj = { record: Ember.Object.create({ media }) };

  let serialized = serializer.serialize(obj);

  assert.notOk(isPresent(serialized.doMediaActions), 'no media actions');

  media.addChange('mimeType', 'data', 88, 99);
  media.removeElement('id to remove');
  serialized = serializer.serialize(obj);

  assert.equal(typeOf(serialized.doMediaActions), 'array');
  assert.equal(serialized.doMediaActions.length, 2);
});
