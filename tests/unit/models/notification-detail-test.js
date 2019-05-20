import { run } from '@ember/runloop';
import Constants from 'textup-frontend/constants';
import OwnsRecordItems from 'textup-frontend/mixins/model/owns-record-items';
import { moduleForModel, test } from 'ember-qunit';

moduleForModel('notification-detail', 'Unit | Model | notification detail', {
  needs: ['model:record-item'],
});

test('it exists', function(assert) {
  run(() => {
    const model = this.subject(),
      thisId = Math.random();
    model.set('id', thisId);

    assert.ok(OwnsRecordItems.detect(model));

    assert.notOk(model.get('isTag'));
    assert.equal(model.get('routeName'), 'main.contacts.contact');
    assert.equal(model.get(Constants.PROP_NAME.URL_IDENT), thisId);

    model.set('isTag', true);
    assert.equal(model.get('routeName'), 'main.tag.details');
    assert.equal(model.get(Constants.PROP_NAME.URL_IDENT), `${Constants.MODEL.TAG}-${thisId}`);
  });
});
