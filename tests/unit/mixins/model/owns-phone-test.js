import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import HasUrlIdentifier from 'textup-frontend/mixins/model/has-url-identifier';
import ModelOwnsPhoneMixin, { OwnsPhoneValidations } from 'textup-frontend/mixins/model/owns-phone';
import sinon from 'sinon';
import { buildValidations } from 'ember-cp-validations';
import { moduleFor, test } from 'ember-qunit';

const { run } = Ember,
  TEST_CLASS_NAME = 'owns-phone-mixin-model';

moduleFor('mixin:model/owns-phone', 'Unit | Mixin | model/owns phone', {
  needs: ['model:phone', 'validator:belongs-to', 'validator:inclusion', 'validator:presence'],
  beforeEach() {
    const OwnsPhoneMixinModel = DS.Model.extend(
      buildValidations(OwnsPhoneValidations),
      ModelOwnsPhoneMixin
    );
    this.register(`model:${TEST_CLASS_NAME}`, OwnsPhoneMixinModel);
  },
  subject() {
    return run(() => {
      const store = Ember.getOwner(this).lookup('service:store');
      return store.createRecord(TEST_CLASS_NAME);
    });
  },
});

test('dirty checking', function(assert) {
  const obj = this.subject();

  assert.equal(obj.get('isDirty'), true);
  assert.equal(obj.get('hasManualChanges'), false);
  assert.equal(obj.get('ownsPhoneHasManualChanges'), false);

  obj.setProperties({
    'phone.content': { isDirty: true },
    phoneAction: Constants.ACTION.PHONE.DEACTIVATE,
  });
  assert.equal(obj.get('hasManualChanges'), true);
  assert.equal(obj.get('ownsPhoneHasManualChanges'), true);

  obj.set('phone.content.isDirty', false);
  assert.equal(obj.get('hasManualChanges'), true);
  assert.equal(obj.get('ownsPhoneHasManualChanges'), true);

  obj.set('phoneAction', null);
  assert.equal(obj.get('hasManualChanges'), false);
  assert.equal(obj.get('ownsPhoneHasManualChanges'), false);
});

test('rolling back attributes', function(assert) {
  const obj = this.subject(),
    rollbackSpy = sinon.spy();

  obj.setProperties({
    'phone.content': { rollbackAttributes: rollbackSpy },
    phoneAction: 'hi',
    phoneActionData: 'hi',
  });

  obj.rollbackAttributes();

  assert.ok(rollbackSpy.calledOnce);
  assert.notOk(obj.get('phoneAction'));
  assert.notOk(obj.get('phoneActionData'));
});

test('rolling back on update', function(assert) {
  const obj = this.subject(),
    rollbackStub = sinon.stub(obj, 'rollbackAttributes');

  obj.didUpdate();

  assert.ok(rollbackStub.calledOnce);

  rollbackStub.restore();
});

test('getting transfer id', function(assert) {
  assert.ok(HasUrlIdentifier.detect(this.subject()));
});

test('validating phone', function(assert) {
  run(() => {
    const done = assert.async(),
      obj = this.subject();

    obj.validate().then(({ model }) => {
      assert.equal(
        model.get('validations.attrs.phone.isValid'),
        true,
        'phone does not need to be specified'
      );

      done();
    });
  });
});

test('validating phone action', function(assert) {
  run(() => {
    const done = assert.async(),
      obj = this.subject();

    obj
      .validate()
      .then(({ model }) => {
        assert.equal(
          model.get('validations.attrs.phoneAction.isValid'),
          true,
          'phoneAction does not need to be specified'
        );

        model.setProperties({ phoneAction: 'blah' });
        return model.validate();
      })
      .then(({ model }) => {
        assert.equal(
          model.get('validations.attrs.phoneAction.isValid'),
          false,
          'phoneAction not in specified list'
        );

        model.setProperties({ phoneAction: Constants.ACTION.PHONE.DEACTIVATE });
        return model.validate();
      })
      .then(({ model }) => {
        assert.equal(
          model.get('validations.attrs.phoneAction.isValid'),
          true,
          'phoneAction is valid'
        );

        done();
      });
  });
});

test('validating transfer filter', function(assert) {
  run(() => {
    const done = assert.async(),
      obj = this.subject();

    obj
      .validate()
      .then(({ model }) => {
        assert.equal(
          model.get('validations.attrs.transferFilter.isValid'),
          false,
          'transferFilter does need to be specified'
        );

        model.setProperties({ transferFilter: 'any value here' });
        return model.validate();
      })
      .then(({ model }) => {
        assert.equal(
          model.get('validations.attrs.transferFilter.isValid'),
          true,
          'transferFilter is valid'
        );

        done();
      });
  });
});
