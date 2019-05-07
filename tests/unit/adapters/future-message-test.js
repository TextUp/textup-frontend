import Ember from 'ember';
import NotificationsService from 'ember-cli-notifications/services/notification-messages-service';
import { moduleFor, test } from 'ember-qunit';

// Need to use an integration or acceptance test to evaluate if embedded objects are properly
// deserialized because attempting to test this in a unit test results in errors due to
// unidentified parts of the environment not being initialized

const { run } = Ember;

moduleFor('adapter:future-message', 'Unit | Adapter | future message', {
  needs: [
    'model:contact',
    'model:future-message',
    'model:media',
    'model:phone',
    'model:record-call',
    'model:record-item',
    'model:record-note',
    'model:record-text',
    'model:tag',
    'serializer:future-message',
    'service:analytics',
    'service:authService',
    'service:dataService',
    'service:requestService',
    'service:stateService',
    'service:storageService',
    'validator:collection',
    'validator:has-any',
    'validator:inclusion',
    'validator:length',
    'validator:number',
    'validator:presence',
  ],
  beforeEach() {
    // see https://github.com/stonecircle/ember-cli-notifications/issues/169
    this.register('service:notifications', NotificationsService);
    this.inject.service('store');
  },
});

test('building url when creating record', function(assert) {
  run(() => {
    const adapter = this.subject(),
      cId = `${Math.random()}`,
      ctId = `${Math.random()}`,
      fMsg = this.store.createRecord('future-message', {
        contact: this.store.createRecord('contact', { id: cId }),
        tag: this.store.createRecord('tag', { id: ctId }),
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
