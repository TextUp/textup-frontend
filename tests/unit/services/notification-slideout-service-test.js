import EmberObject from '@ember/object';
import Media from 'textup-frontend/models/media';
import RSVP from 'rsvp';
import Service from '@ember/service';
import sinon from 'sinon';
import { moduleFor, test } from 'ember-qunit';
import { run } from '@ember/runloop';
import { typeOf } from '@ember/utils';

moduleFor(
  'service:notification-slideout-service',
  'Unit | Service | notification slideout service',
  {
    needs: [
      'model:media',
      'model:media-element',
      'model:media/add',
      'model:media/remove',
      'model:phone',
      'model:schedule',
      'model:tag',
      'transform:interval-string',
      'transform:phone-number',
      'validator:length',
    ],
    beforeEach() {
      this.register(
        'service:data-service',
        Service.extend({
          persist: sinon.stub().returns(new RSVP.Promise(resolve => resolve())),
        })
      );
      this.inject.service('data-service', { as: 'dataService' });
      this.inject.service('store');
    },
  }
);

test('adding processed audio to media', function(assert) {
  run(() => {
    const done = assert.async(),
      service = this.subject(),
      phone = this.store.createRecord('phone', { shouldRedoVoicemailGreeting: true }),
      mBaseline = this.store.peekAll('media').get('length');

    service
      .onAddAudio()
      .catch(msg => {
        assert.equal(typeOf(msg), 'string');
        assert.equal(this.store.peekAll('media').get('length'), mBaseline);

        return service.onAddAudio(phone, 'audio/mpeg', 'base64;validdatahere');
      })
      .then(() => {
        assert.equal(this.store.peekAll('media').get('length'), mBaseline + 1);
        assert.ok(phone.get('media.content') instanceof Media);
        assert.equal(phone.get('media.content.pendingChanges.length'), 1);

        return service.onAddAudio(phone, 'audio/mpeg', 'base64;valid-data-here');
      })
      .then(() => {
        assert.equal(
          this.store.peekAll('media').get('length'),
          mBaseline + 0,
          'found media is rolled back to avoid sending all prior attempts -- in this test rolling back deletes the unsaved media'
        );

        assert.ok(phone.get('media.content') instanceof Media);
        assert.equal(phone.get('media.content.pendingChanges.length'), 1);

        done();
      });
  });
});

test('requesting to record voicemail greeting via phone call', function(assert) {
  const done = assert.async(),
    service = this.subject(),
    phone = EmberObject.create(),
    phoneOwnerNoPhone = EmberObject.create(),
    phoneOwner = EmberObject.create({ phone: { content: phone } }),
    numToCall = Math.random();

  service
    .onRequestVoicemailGreetingCall()
    .catch(msg => {
      assert.equal(typeOf(msg), 'string');
      assert.notOk(phone.get('requestVoicemailGreetingCall'));
      assert.ok(this.dataService.persist.notCalled);

      return service.onRequestVoicemailGreetingCall(phoneOwnerNoPhone, numToCall);
    })
    .catch(msg => {
      assert.equal(typeOf(msg), 'string');
      assert.notOk(phone.get('requestVoicemailGreetingCall'));
      assert.ok(this.dataService.persist.notCalled);

      return service.onRequestVoicemailGreetingCall(phoneOwner, numToCall);
    })
    .then(() => {
      assert.equal(phone.get('requestVoicemailGreetingCall'), numToCall);
      assert.ok(this.dataService.persist.calledOnce);
      assert.ok(this.dataService.persist.calledWith(phoneOwner));

      done();
    });
});
