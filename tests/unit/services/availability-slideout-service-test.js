import Ember from 'ember';
import Media from 'textup-frontend/models/media';
import sinon from 'sinon';
import { moduleFor, test } from 'ember-qunit';

const { typeOf, run, RSVP } = Ember;

moduleFor(
  'service:availability-slideout-service',
  'Unit | Service | availability slideout service',
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
        Ember.Service.extend({
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
    phone = Ember.Object.create(),
    phoneOwnerNoPhone = Ember.Object.create(),
    phoneOwner = Ember.Object.create({ phone: { content: phone } }),
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
