import Ember from 'ember';
import Media from 'textup-frontend/models/media';
import sinon from 'sinon';
import { moduleFor, test } from 'ember-qunit';

const { run, RSVP } = Ember;

moduleFor('service:media-service', 'Unit | Service | media service', {
  needs: [
    'model:media',
    'model:media-element',
    'model:media-element-version',
    'model:media/add',
    'model:media/remove'
  ],
  beforeEach() {
    this.inject.service('store');
  }
});

test('adding image for existing media', function(assert) {
  run(() => {
    const done = assert.async(),
      service = this.subject(),
      mInfo = this.store.createRecord('media'),
      mBaseline = this.store.peekAll('media').get('length');

    assert.notOk(service.addImage());
    assert.notOk(service.addImage('not instance', 'not array'));
    assert.equal(mInfo.get('hasElements'), false);

    const mOwner = Ember.Object.create({ media: new RSVP.Promise(resolve => resolve(mInfo)) }),
      imgInfo = { mimeType: 'image/jpeg', data: 'base64;valid', width: 88, height: 88 };
    service.addImage(mOwner, [imgInfo]).then(() => {
      assert.equal(mInfo.get('hasElements'), true);
      assert.equal(this.store.peekAll('media').get('length'), mBaseline);

      done();
    });
  });
});

test('adding image for new media', function(assert) {
  run(() => {
    const done = assert.async(),
      service = this.subject(),
      mBaseline = this.store.peekAll('media').get('length');

    const mOwner = Ember.Object.create({ media: new RSVP.Promise(resolve => resolve()) }),
      imgInfo = { mimeType: 'image/jpeg', data: 'base64;valid', width: 88, height: 88 };
    service.addImage(mOwner, [imgInfo]).then(() => {
      assert.ok(mOwner.get('media') instanceof Media);
      assert.equal(mOwner.get('media.hasElements'), true);
      assert.equal(this.store.peekAll('media').get('length'), mBaseline + 1);

      done();
    });
  });
});

test('adding audio for existing media', function(assert) {
  run(() => {
    const done = assert.async(),
      service = this.subject(),
      mInfo = this.store.createRecord('media'),
      mBaseline = this.store.peekAll('media').get('length');

    assert.notOk(service.addAudio());
    assert.notOk(service.addAudio('not instance', null, null));
    assert.equal(mInfo.get('hasElements'), false);

    const mOwner = Ember.Object.create({ media: new RSVP.Promise(resolve => resolve(mInfo)) });
    service.addAudio(mOwner, 'audio/mpeg', 'base64;valid').then(() => {
      assert.equal(mInfo.get('hasElements'), true);
      assert.equal(this.store.peekAll('media').get('length'), mBaseline);

      done();
    });
  });
});

test('adding audio for new media', function(assert) {
  run(() => {
    const done = assert.async(),
      service = this.subject(),
      mBaseline = this.store.peekAll('media').get('length');

    assert.notOk(service.addAudio());
    assert.notOk(service.addAudio('not instance', null, null));

    const mOwner = Ember.Object.create({ media: new RSVP.Promise(resolve => resolve()) });
    service.addAudio(mOwner, 'audio/mpeg', 'base64;valid').then(() => {
      assert.ok(mOwner.get('media') instanceof Media);
      assert.equal(mOwner.get('media.hasElements'), true);
      assert.equal(this.store.peekAll('media').get('length'), mBaseline + 1);

      done();
    });
  });
});

test('removing media for owner with media', function(assert) {
  run(() => {
    const done = assert.async(),
      service = this.subject(),
      mInfo = this.store.createRecord('media'),
      mBaseline = this.store.peekAll('media').get('length'),
      removeStub = sinon.stub(mInfo, 'removeElement');

    assert.notOk(service.removeMedia());
    assert.notOk(service.removeMedia('not instance', 'not instance'));

    const mOwner = Ember.Object.create({ media: new RSVP.Promise(resolve => resolve(mInfo)) });
    service.removeMedia(mOwner, Ember.Object.create()).then(() => {
      assert.ok(removeStub.calledOnce);
      assert.equal(this.store.peekAll('media').get('length'), mBaseline);

      removeStub.restore();
      done();
    });
  });
});
