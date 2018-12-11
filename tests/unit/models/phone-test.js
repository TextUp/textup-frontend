import Ember from 'ember';
import sinon from 'sinon';
import { moduleForModel, test } from 'ember-qunit';

const { run } = Ember;

moduleForModel('phone', 'Unit | Model | phone', {
  needs: [
    'service:constants',
    'model:tag',
    'model:media',
    'model:availability',
    'validator:length'
  ],
  beforeEach() {
    this.inject.service('constants');
  }
});

test('default values', function(assert) {
  const obj = this.subject();

  assert.equal(obj.get('language'), this.constants.DEFAULT.LANGUAGE);
  assert.equal(obj.get('awayMessage'), '');
  assert.equal(obj.get('awayMessageMaxLength'), 320);
});

test('dirty checking', function(assert) {
  const obj = this.subject();

  assert.equal(obj.get('isDirty'), true, 'will always be dirty because the model is new');
  assert.equal(obj.get('hasManualChanges'), false);

  obj.set('media.content', { isDirty: true });
  assert.equal(obj.get('hasManualChanges'), true);

  obj.set('availability.content', { isDirty: true });
  assert.equal(obj.get('hasManualChanges'), true);

  obj.setProperties({
    'media.content.isDirty': false,
    'availability.content.isDirty': false
  });
  assert.equal(obj.get('hasManualChanges'), false);
});

test('rolling back changes', function(assert) {
  const obj = this.subject(),
    rollbackSpy = sinon.spy();

  obj.setProperties({
    'media.content': { rollbackAttributes: rollbackSpy },
    'availability.content': { rollbackAttributes: rollbackSpy }
  });

  obj.rollbackAttributes();

  // need to store rollbackSpy separately because all of the association fields
  // are cleared on rollback
  assert.ok(rollbackSpy.calledTwice);
});

test('validation', function(assert) {
  run(() => {
    const done = assert.async(),
      obj = this.subject();

    obj
      .validate()
      .then(({ model, validations }) => {
        assert.equal(validations.get('isTruelyValid'), false, 'away message cannot be blank');

        model.set(
          'awayMessage',
          Array(model.get('awayMessageMaxLength') * 5)
            .fill()
            .map(() => 'hi')
            .join()
        );
        return model.validate();
      })
      .then(({ model, validations }) => {
        assert.equal(validations.get('isTruelyValid'), false, 'away message cannot be too long');

        model.set('awayMessage', 'hello! I am a reasonable length message.');
        return model.validate();
      })
      .then(({ model, validations }) => {
        assert.equal(validations.get('isTruelyValid'), true);

        done();
      });
  });
});
