import Ember from 'ember';
import { moduleForModel, test } from 'ember-qunit';
import { MEDIA_ID_PROP_NAME } from 'textup-frontend/models/media';

const { run } = Ember;

moduleForModel('media/remove', 'Unit | Serializer | media/remove', {
  needs: ['serializer:media/remove', 'service:constants']
});

test('build remove action', function(assert) {
  run(() => {
    const constants = Ember.getOwner(this).lookup('service:constants'),
      obj = this.subject(),
      randVal1 = Math.random();

    obj.set(MEDIA_ID_PROP_NAME, randVal1);

    const serialized = obj.serialize();

    assert.equal(serialized.uid, obj.get(MEDIA_ID_PROP_NAME));
    assert.equal(serialized.uid, randVal1);
    assert.equal(serialized.action, constants.ACTION.MEDIA.REMOVE);
  });
});
