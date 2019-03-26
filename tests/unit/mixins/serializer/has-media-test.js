import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import SerializerHasMediaMixin from 'textup-frontend/mixins/serializer/has-media';
import { moduleForModel, test } from 'ember-qunit';

const { isPresent, typeOf, run } = Ember;

moduleForModel('media', 'Unit | Mixin | serializer/has media', {
  needs: [
    'model:media/add',
    'model:media/remove',
    'serializer:media/add',
    'serializer:media/remove',
  ],
});

test('attributes', function(assert) {
  const SerializerHasMediaObject = Ember.Object.extend(SerializerHasMediaMixin),
    serializer = SerializerHasMediaObject.create();

  assert.equal(serializer.attrs.media.deserialize, 'records');
  assert.equal(serializer.attrs.media.serialize, false);
});

test('serializing with media actions', function(assert) {
  run(() => {
    const SerializerHasMediaObject = Ember.Object.extend(SerializerHasMediaMixin),
      serializer = SerializerHasMediaObject.create(),
      media = this.subject(),
      obj = { record: Ember.Object.create({ media }) };

    let serialized = serializer.serialize(obj);

    assert.notOk(isPresent(serialized.doMediaActions), 'no media actions');

    media.addImage('mimeType', 'base64,data', 88, 99);
    media.removeElement('id to remove');
    serialized = serializer.serialize(obj);

    assert.equal(typeOf(serialized.doMediaActions), 'array');
    assert.equal(serialized.doMediaActions.length, 2);
    serialized.doMediaActions.forEach(mediaAction => {
      assert.ok(
        mediaAction.action === Constants.ACTION.MEDIA.ADD ||
          mediaAction.action === Constants.ACTION.MEDIA.REMOVE,
        'each media action has appropriate action values'
      );
    });
  });
});
