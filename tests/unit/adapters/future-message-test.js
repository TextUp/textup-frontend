import Ember from 'ember';
import NotificationsService from 'ember-cli-notifications/services/notification-messages-service';
import { moduleFor, test } from 'ember-qunit';

// Need to use an integration or acceptance test to evaluate if embedded objects are properly
// deserialized because attempting to test this in a unit test results in errors due to
// unidentified parts of the environment not being initialized

const { run } = Ember;

moduleFor('adapter:future-message', 'Unit | Adapter | future message', {
  needs: [
    'serializer:future-message',
    'service:auth-service',
    'service:data-service',
    'service:state',
    'service:storage',
    'service:socket',
    'service:constants',
    'model:future-message',
    'model:contact',
    'model:tag',
    'model:phone',
    'model:shared-contact',
    'model:record-item',
    'model:record-text',
    'model:record-call',
    'model:record-note',
    'model:media',
    'validator:presence',
    'validator:length',
    'validator:inclusion',
    'validator:collection',
    'validator:has-any',
    'validator:number'
  ],
  beforeEach() {
    // see https://github.com/stonecircle/ember-cli-notifications/issues/169
    this.register('service:notifications', NotificationsService);
  }
});

test('building url when creating record', function(assert) {
  run(() => {
    const store = Ember.getOwner(this).lookup('service:store'),
      adapter = this.subject(),
      cId = `${Math.random()}`,
      ctId = `${Math.random()}`,
      fMsg = store.createRecord('future-message', {
        contact: store.createRecord('contact', { id: cId }),
        tag: store.createRecord('tag', { id: ctId })
      }),
      snapshot = { record: fMsg };

    assert.equal(
      adapter.buildURL('future-message', 8, snapshot, 'valid type'),
      '/v1/future-messages/8'
    );
    assert.equal(
      adapter.buildURL('future-message', null, snapshot, 'createRecord'),
      `/v1/future-messages?contactId=${cId}&tagId=${ctId}`,
      'added all specified owner ids when saving this future-message'
    );
  });
});
