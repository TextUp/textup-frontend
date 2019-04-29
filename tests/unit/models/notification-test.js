import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import { moduleForModel, test } from 'ember-qunit';

const { run } = Ember;

moduleForModel('notification', 'Unit | Model | notification', {
  needs: ['model:notification-detail'],
});

test('getting counts', function(assert) {
  run(() => {
    const model = this.subject();

    assert.equal(model.get('numIncoming'), 0);
    assert.equal(model.get('numVoicemail'), 0);
    assert.equal(model.get('numIncomingText'), 0);
    assert.equal(model.get('numIncomingCall'), 0);

    assert.equal(model.get('numOutgoing'), 0);
    assert.equal(model.get('numOutgoingText'), 0);
    assert.equal(model.get('numOutgoingCall'), 0);

    model.setProperties({
      numVoicemail: 1,
      numIncomingText: 1,
      numIncomingCall: 1,
      numOutgoingText: 1,
      numOutgoingCall: 1,
    });

    assert.equal(model.get('numIncoming'), 3);
    assert.equal(model.get('numOutgoing'), 2);
  });
});

test('getting url identifier', function(assert) {
  run(() => {
    const model = this.subject(),
      thisId = Math.random();
    model.set('id', thisId);

    assert.notOk(model.get('type'));
    assert.equal(model.get(Constants.PROP_NAME.URL_IDENT), `${Constants.MODEL.STAFF}-${thisId}`);

    model.set('type', 'GROUP');
    assert.equal(model.get(Constants.PROP_NAME.URL_IDENT), `${Constants.MODEL.TEAM}-${thisId}`);
  });
});
