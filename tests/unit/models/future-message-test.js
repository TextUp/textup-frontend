import Ember from 'ember';
import sinon from 'sinon';
import { moduleForModel, test } from 'ember-qunit';

const { run, typeOf } = Ember;

moduleForModel('future-message', 'Unit | Model | future message', {
  needs: [
    'service:constants',
    'model:media',
    'model:contact',
    'model:tag',
    'model:phone',
    'model:shared-contact',
    'model:record-item',
    'model:record-text',
    'model:record-call',
    'model:record-note',
    'model:future-message',
    'validator:collection',
    'validator:inclusion',
    'validator:presence',
    'validator:length',
    'validator:has-any',
    'validator:number'
  ]
});

test('dirty checking', function(assert) {
  run(() => {
    const constants = Ember.getOwner(this).lookup('service:constants'),
      obj = this.subject();

    assert.equal(obj.get('hasManualChanges'), false);

    obj.set('intervalSize', constants.FUTURE_MESSAGE.INTERVAL_SIZE.WEEK);

    assert.equal(
      obj.get('hasManualChanges'),
      false,
      'rely on `intervalSize` setting `_repeatIntervalInDays` for dirty checking'
    );

    obj.setProperties({ media: this.store().createRecord('media') });

    assert.equal(obj.get('hasManualChanges'), true);

    obj.set('media', null);

    assert.equal(obj.get('hasManualChanges'), false);
  });
});

test('setting intervals of different sizes', function(assert) {
  run(() => {
    const constants = Ember.getOwner(this).lookup('service:constants'),
      obj = this.subject();

    assert.equal(obj.get('intervalSize'), constants.FUTURE_MESSAGE.INTERVAL_SIZE.DAY);
    assert.equal(obj.get('repeatInterval'), null);
    assert.equal(obj.get('_repeatIntervalInDays'), null);

    obj.set('repeatInterval', 2);

    assert.equal(obj.get('intervalSize'), constants.FUTURE_MESSAGE.INTERVAL_SIZE.DAY);
    assert.equal(obj.get('repeatInterval'), 2);
    assert.equal(obj.get('_repeatIntervalInDays'), 2);

    obj.set('intervalSize', constants.FUTURE_MESSAGE.INTERVAL_SIZE.WEEK);

    assert.equal(obj.get('intervalSize'), constants.FUTURE_MESSAGE.INTERVAL_SIZE.WEEK);
    assert.equal(obj.get('repeatInterval'), 2);
    assert.equal(obj.get('_repeatIntervalInDays'), 14);

    obj.set('repeatInterval', 1);

    assert.equal(obj.get('intervalSize'), constants.FUTURE_MESSAGE.INTERVAL_SIZE.WEEK);
    assert.equal(obj.get('repeatInterval'), 1);
    assert.equal(obj.get('_repeatIntervalInDays'), 7);

    const originalRepeatIntervalInDays = obj.get('_repeatIntervalInDays');
    obj.set('repeatInterval', null);

    assert.equal(obj.get('intervalSize'), constants.FUTURE_MESSAGE.INTERVAL_SIZE.WEEK);
    assert.equal(obj.get('repeatInterval'), null);
    assert.equal(
      obj.get('_repeatIntervalInDays'),
      originalRepeatIntervalInDays,
      'do not change repeat intervals in days when null'
    );

    obj.setProperties({
      repeatInterval: 1,
      intervalSize: null
    });

    assert.equal(obj.get('intervalSize'), null);
    assert.equal(obj.get('repeatInterval'), 1);
    assert.equal(
      obj.get('_repeatIntervalInDays'),
      originalRepeatIntervalInDays,
      'do not change repeat intervals in days when null'
    );
  });
});

test('getting and setting owner', function(assert) {
  run(() => {
    const validContact = this.store().createRecord('contact'),
      validTag = this.store().createRecord('tag'),
      invalidOwner = 'not a model',
      obj = this.subject();

    assert.notOk(obj.get('owner.content'));
    assert.notOk(obj.get('contact.content'));
    assert.notOk(obj.get('tag.content'));

    obj.set('owner', invalidOwner);

    assert.notOk(obj.get('owner.content'));
    assert.notOk(obj.get('contact.content'));
    assert.notOk(obj.get('tag.content'));

    obj.set('owner', validContact);

    assert.deepEqual(obj.get('owner.content'), validContact);
    assert.ok(obj.get('contact.content'));
    assert.notOk(obj.get('tag.content'));

    obj.set('owner', validTag);

    assert.deepEqual(obj.get('owner.content'), validTag);
    assert.notOk(obj.get('contact.content'));
    assert.ok(obj.get('tag.content'));
  });
});

test('rolling back changes', function(assert) {
  run(() => {
    const obj = this.subject(),
      media = this.store().createRecord('media'),
      rollbackSpy = sinon.spy(media, 'rollbackAttributes');

    obj.set('media', media);

    assert.equal(obj.get('hasManualChanges'), true);

    obj.rollbackAttributes();

    assert.equal(obj.get('hasManualChanges'), false);
    assert.ok(rollbackSpy.calledOnce, 'rolling back future message also rolls back media');
  });
});

test('default values', function(assert) {
  const constants = Ember.getOwner(this).lookup('service:constants'),
    obj = this.subject();

  assert.equal(obj.get('isDone'), false);
  assert.equal(obj.get('notifySelf'), false);
  assert.equal(obj.get('isRepeating'), false);
  assert.equal(obj.get('timesTriggered'), 0);
  assert.equal(typeOf(obj.get('startDate')), 'date');
  assert.equal(obj.get('hasEndDate'), false);
  assert.equal(obj.get('type'), constants.FUTURE_MESSAGE.TYPE.TEXT);
  assert.equal(obj.get('intervalSize'), constants.FUTURE_MESSAGE.INTERVAL_SIZE.DAY);
});

test('repeat-related properties are only validated if message is repeating', function(assert) {
  const constants = Ember.getOwner(this).lookup('service:constants'),
    obj = this.subject(),
    done = assert.async();

  run(() => {
    obj.set('message', 'hello');

    obj
      .validate()
      .then(({ model, validations }) => {
        assert.equal(
          validations.get('isTruelyValid'),
          true,
          'once content is provided, defaults are valid'
        );

        model.setProperties({
          type: 'invalid type',
          intervalSize: 'not a number',
          repeatInterval: 'not a number',
          repeatCount: 'not a number'
        });

        return model.validate();
      })
      .then(({ model, validations }) => {
        assert.equal(validations.get('isTruelyValid'), false);
        assert.equal(
          validations.get('errors').length,
          1,
          'repeat-related properties not validated unless is repeating'
        );

        model.setProperties({ isRepeating: true });

        return model.validate();
      })
      .then(({ model, validations }) => {
        assert.equal(validations.get('isTruelyValid'), false);
        assert.equal(validations.get('errors').length, 4, 'now repeating properties are validated');
        assert.equal(
          model.get('validations.attrs.intervalSize.isValid'),
          false,
          'if present, interval size must be positive'
        );
        assert.equal(
          model.get('validations.attrs.repeatInterval.isValid'),
          false,
          'if present, repeat interval must be positive'
        );
        assert.equal(
          model.get('validations.attrs.repeatCount.isValid'),
          false,
          'if present, repeat count must be positive'
        );

        model.setProperties({
          type: constants.FUTURE_MESSAGE.TYPE.CALL,
          intervalSize: 1,
          repeatInterval: 1,
          repeatCount: 1
        });

        return model.validate();
      })
      .then(({ model, validations }) => {
        assert.equal(validations.get('isTruelyValid'), true);

        done();
      });
  });
});

test('validating repeating future message', function(assert) {
  run(() => {
    const constants = Ember.getOwner(this).lookup('service:constants'),
      obj = this.subject(),
      done = assert.async();

    obj.setProperties({
      message: 'hello',
      type: constants.FUTURE_MESSAGE.TYPE.CALL,
      isRepeating: true
    });

    obj
      .validate()
      .then(({ model, validations }) => {
        assert.equal(validations.get('isTruelyValid'), false);
        assert.equal(
          validations.get('errors').length,
          2,
          'now repeating properties are validated, only two because intervalSize defaults to 1'
        );

        obj.setProperties({ repeatInterval: 1, repeatCount: 2 });

        return model.validate();
      })
      .then(({ model, validations }) => {
        assert.equal(validations.get('isTruelyValid'), true);

        obj.setProperties({
          repeatCount: null,
          endDate: new Date(Date.now() + 1000)
        });

        return model.validate();
      })
      .then(({ model, validations }) => {
        assert.equal(validations.get('isTruelyValid'), true);

        done();
      });
  });
});

test('validating contents', function(assert) {
  const obj = this.subject(),
    done = assert.async();

  run(() => {
    const mediaObj = this.store().createRecord('media');

    obj
      .validate()
      .then(({ model, validations }) => {
        assert.equal(validations.get('isTruelyValid'), false, 'no message or media');

        model.setProperties({
          message: 'a message',
          media: null
        });
        return model.validate();
      })
      .then(({ model, validations }) => {
        assert.equal(validations.get('isTruelyValid'), true, 'has message');

        model.setProperties({
          message: null,
          media: mediaObj
        });

        return model.validate();
      })
      .then(({ model, validations }) => {
        assert.equal(
          validations.get('isTruelyValid'),
          false,
          'no message and has media but is empty'
        );

        mediaObj.addChange('valid mime type', 'valid data', 88, 99);
        assert.ok(mediaObj.get('hasElements'));

        return model.validate();
      })
      .then(({ model, validations }) => {
        assert.equal(validations.get('isTruelyValid'), true, 'media now has elements');

        done();
      });
  });
});
