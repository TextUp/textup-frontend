import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import { moduleForModel, test } from 'ember-qunit';

const { run, typeOf } = Ember;

moduleForModel('media/remove', 'Unit | Model | media/remove');

test('properties', function(assert) {
  run(() => {
    const obj = this.subject(),
      randVal1 = Math.random();

    assert.notOk(obj.get(Constants.PROP_NAME.MEDIA_ID));

    obj.set(Constants.PROP_NAME.MEDIA_ID, randVal1);

    assert.equal(obj.get(Constants.PROP_NAME.MEDIA_ID), randVal1);
    assert.equal(typeOf(obj.get('isDirty')), 'boolean');
  });
});
