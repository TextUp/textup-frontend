import { getOwner } from '@ember/application';
import { run } from '@ember/runloop';
import DS from 'ember-data';
import ModelOwnsFutureMessagesMixin from 'textup-frontend/mixins/model/owns-future-messages';
import { moduleFor, test } from 'ember-qunit';

// testing DS.attr in mixins from https://stackoverflow.com/a/39860250
moduleFor('mixin:model/owns-future-messages', 'Unit | Mixin | model/owns-future-messages', {
  needs: [
    'model:future-message',
    'model:contact',
    'model:media',
    'model:tag',
    'validator:length',
    'validator:presence',
    'validator:number',
    'validator:inclusion',
    'validator:has-any',
  ],
  subject() {
    // The scope here is the module, so we have access to the registration stuff.
    // Define and register our phony host model.
    const OwnsFutureMessagesMixinModel = DS.Model.extend(ModelOwnsFutureMessagesMixin);
    this.register('model:owns-future-messages-mixin-model', OwnsFutureMessagesMixinModel);
    // Once our model is registered, we create it via the store in the
    // usual way and return it. Since createRecord is async, we need
    // an Ember.run.
    return run(() => {
      const store = getOwner(this).lookup('service:store');
      return store.createRecord('owns-future-messages-mixin-model');
    });
  },
});

test('adding future messages', function(assert) {
  run(() => {
    const store = getOwner(this).lookup('service:store'),
      obj = this.subject(),
      fMsgs = Array(8)
        .fill()
        .map(() => store.createRecord('future-message', { id: `${Math.random()}` }));

    assert.notOk(obj.addFutureMessages());
    assert.notOk(obj.addFutureMessages(null));
    assert.notOk(obj.addFutureMessages('not a list'));
    assert.notOk(obj.addFutureMessages({}));
    assert.notOk(obj.addFutureMessages([null, undefined]));

    assert.equal(obj.get('numFutureMessages'), 0, 'invalid inputs ignored');
    assert.deepEqual(obj.get('futureMessages'), []);
    assert.equal(obj.get('nextFutureFire'), null);

    assert.ok(obj.addFutureMessages(fMsgs));

    assert.equal(obj.get('numFutureMessages'), fMsgs.length);
    assert.equal(obj.get('nextFutureFire'), null);

    assert.ok(obj.addFutureMessages(fMsgs));

    assert.equal(obj.get('numFutureMessages'), fMsgs.length, 'duplicate items are ignored');
    assert.equal(obj.get('nextFutureFire'), null);
  });
});

test('calculating next fire date', function(assert) {
  run(() => {
    const store = getOwner(this).lookup('service:store'),
      obj = this.subject(),
      date1 = new Date(Date.now() + 1000),
      date2 = new Date(Date.now() - 100),
      date3 = new Date(Date.now() + 500),
      fMsg1 = store.createRecord('future-message', { id: `${Math.random()}` }),
      fMsg2 = store.createRecord('future-message', {
        id: `${Math.random()}`,
        nextFireDate: date1,
      }),
      fMsg3 = store.createRecord('future-message', {
        id: `${Math.random()}`,
        nextFireDate: date2,
      }),
      fMsg4 = store.createRecord('future-message', {
        id: `${Math.random()}`,
        nextFireDate: date3,
      });

    assert.equal(obj.get('numFutureMessages'), 0);
    assert.equal(obj.get('nextFutureFire'), null);

    assert.ok(obj.addFutureMessage(fMsg1));

    assert.equal(obj.get('numFutureMessages'), 1);
    assert.equal(
      obj.get('nextFutureFire'),
      null,
      'still null because single item has no fire date'
    );

    assert.ok(obj.addFutureMessage(fMsg2));

    assert.equal(obj.get('numFutureMessages'), 2);
    assert.equal(obj.get('nextFutureFire'), date1);

    assert.ok(obj.addFutureMessage(fMsg3));

    assert.equal(obj.get('numFutureMessages'), 3);
    assert.equal(
      obj.get('nextFutureFire'),
      date1,
      'still the first date because the just-added date is in the past'
    );

    assert.ok(obj.addFutureMessage(fMsg4));

    assert.equal(obj.get('numFutureMessages'), 4);
    assert.equal(obj.get('nextFutureFire'), date3);
  });
});
