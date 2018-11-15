import Ember from 'ember';
import { MEDIA_ID_PROP_NAME } from 'textup-frontend/models/media';
import { moduleForModel, test } from 'ember-qunit';

const { run, typeOf } = Ember;

moduleForModel('media/remove', 'Unit | Model | media/remove', {});

test('properties', function(assert) {
  run(() => {
    const obj = this.subject(),
      randVal1 = Math.random();

    assert.notOk(obj.get(MEDIA_ID_PROP_NAME));

    obj.set(MEDIA_ID_PROP_NAME, randVal1);

    assert.equal(obj.get(MEDIA_ID_PROP_NAME), randVal1);
    assert.equal(typeOf(obj.get('isDirty')), 'boolean');
  });
});
