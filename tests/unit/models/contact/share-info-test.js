import { run } from '@ember/runloop';
import Constants from 'textup-frontend/constants';
import Shareable from 'textup-frontend/mixins/model/shareable';
import { moduleForModel, test } from 'ember-qunit';

moduleForModel('contact/share-info', 'Unit | Model | contact/share info', {
  needs: [],
});

test('it exists', function(assert) {
  run(() => {
    const model = this.subject(),
      phoneId = Math.random();

    assert.ok(Shareable.detect(model));
    assert.throws(() => model.set(Constants.PROP_NAME.SHARING_IDENT, null));

    model.set('phoneId', phoneId);
    assert.equal(model.get(Constants.PROP_NAME.SHARING_IDENT), phoneId);
  });
});
