import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import { moduleForModel, test } from 'ember-qunit';

const { run } = Ember;

moduleForModel('media/remove', 'Unit | Serializer | media/remove', {
  needs: ['serializer:media/remove'],
});

test('build remove action', function(assert) {
  run(() => {
    const obj = this.subject(),
      randVal1 = Math.random();

    obj.set(Constants.PROP_NAME.MEDIA_ID, randVal1);

    const serialized = obj.serialize();

    assert.equal(serialized.uid, obj.get(Constants.PROP_NAME.MEDIA_ID));
    assert.equal(serialized.uid, randVal1);
    assert.equal(serialized.action, Constants.ACTION.MEDIA.REMOVE);
  });
});
