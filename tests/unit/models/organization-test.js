import Constants from 'textup-frontend/constants';
import Ember from 'ember';
import sinon from 'sinon';
import { moduleForModel, test } from 'ember-qunit';

const { run } = Ember;

moduleForModel('organization', 'Unit | Model | organization', {
  needs: [
    'model:location',
    'model:team',
    'model:phone',
    'validator:presence',
    'validator:belongs-to',
    'validator:number',
    'validator:length',
    'validator:inclusion',
  ],
});

test('default values', function(assert) {
  const obj = this.subject();

  assert.equal(obj.get('awayMessageSuffix'), '');
  assert.ok(obj.get('awayMessageSuffixMaxLength') > 0);
  assert.ok(obj.get('timeoutMin') > 0);
  assert.ok(obj.get('timeoutMax') > 0);
});

test('dirty checking', function(assert) {
  const obj = this.subject();

  assert.equal(obj.get('isDirty'), true, 'will always be dirty because the model is new');
  assert.equal(obj.get('hasManualChanges'), false);

  obj.set('location.content', { isDirty: true });

  assert.equal(obj.get('hasManualChanges'), true);

  obj.set('location.content.isDirty', false);

  assert.equal(obj.get('hasManualChanges'), false);
});

test('getting status info', function(assert) {
  run(() => {
    const obj = this.subject();

    assert.notOk(obj.get('status'));
    assert.equal(obj.get('isRejected'), false);
    assert.equal(obj.get('isPending'), false);
    assert.equal(obj.get('isApproved'), false);

    obj.set('status', Constants.ORGANIZATION.STATUS.REJECTED);

    assert.equal(obj.get('isRejected'), true);
    assert.equal(obj.get('isPending'), false);
    assert.equal(obj.get('isApproved'), false);

    obj.set('status', Constants.ORGANIZATION.STATUS.PENDING);

    assert.equal(obj.get('isRejected'), false);
    assert.equal(obj.get('isPending'), true);
    assert.equal(obj.get('isApproved'), false);

    obj.set('status', Constants.ORGANIZATION.STATUS.APPROVED);

    assert.equal(obj.get('isRejected'), false);
    assert.equal(obj.get('isPending'), false);
    assert.equal(obj.get('isApproved'), true);
  });
});

test('getting existing teams', function(assert) {
  run(() => {
    const done = assert.async(),
      obj = this.subject(),
      newTeam = this.store().createRecord('team'),
      existingTeam = this.store().createRecord('team'),
      existingStub = sinon.stub(existingTeam, 'isNew').get(() => false);

    assert.equal(obj.get('teams.length'), 0);
    obj
      .get('existingTeams')
      .then(existingTeams => {
        assert.equal(existingTeams.length, 0);

        obj.get('teams').pushObject(newTeam);
        obj.get('teams').pushObject(existingTeam);

        assert.equal(obj.get('teams.length'), 2);
        return obj.get('existingTeams');
      })
      .then(existingTeams => {
        assert.equal(existingTeams.length, 1);

        existingStub.restore();
        done();
      });
  });
});

test('viewing and updating timeout', function(assert) {
  run(() => {
    const obj = this.subject();

    assert.notOk(obj.get('timeout'));
    assert.notOk(obj.get('timeoutInSeconds'));
    assert.equal(obj.get('isTimeout15'), false);
    assert.equal(obj.get('isTimeout30'), false);
    assert.equal(obj.get('isTimeout60'), false);
    assert.equal(obj.get('isTimeoutStandard'), false);

    obj.set('timeoutInSeconds', 8);

    assert.equal(obj.get('timeout'), 8000);
    assert.equal(obj.get('timeoutInSeconds'), 8);
    assert.equal(obj.get('isTimeout15'), false);
    assert.equal(obj.get('isTimeout30'), false);
    assert.equal(obj.get('isTimeout60'), false);
    assert.equal(obj.get('isTimeoutStandard'), false);

    obj.set('timeoutInSeconds', 15);

    assert.equal(obj.get('timeout'), 15000);
    assert.equal(obj.get('timeoutInSeconds'), 15);
    assert.equal(obj.get('isTimeout15'), true);
    assert.equal(obj.get('isTimeout30'), false);
    assert.equal(obj.get('isTimeout60'), false);
    assert.equal(obj.get('isTimeoutStandard'), true);
  });
});

test('validating name and location', function(assert) {
  run(() => {
    const done = assert.async(),
      obj = this.subject();

    obj
      .validate()
      .then(({ model }) => {
        assert.equal(model.get('validations.attrs.name.isValid'), false, 'name must be specified');
        assert.equal(
          model.get('validations.attrs.location.isValid'),
          false,
          'valid location must be specified'
        );

        model.setProperties({
          name: 'hello there!',
          location: this.store().createRecord('location', { address: 'hi', lat: 0, lng: 0 }),
        });
        return model.validate();
      })
      .then(({ model }) => {
        assert.equal(model.get('validations.attrs.name.isValid'), true, 'name isvalid');
        assert.equal(
          model.get('validations.attrs.location.isValid'),
          true,
          'valid location isvalid'
        );

        done();
      });
  });
});

test('validating timeout', function(assert) {
  run(() => {
    const done = assert.async(),
      obj = this.subject();

    obj
      .validate()
      .then(({ model }) => {
        assert.equal(
          model.get('validations.attrs.timeout.isValid'),
          true,
          'timeout can be null, such as when the organization is newly created'
        );

        model.setProperties({ timeout: model.get('timeoutMin') - 100 });
        return model.validate();
      })
      .then(({ model }) => {
        assert.equal(model.get('validations.attrs.timeout.isValid'), false, 'timeout is too small');

        model.setProperties({ timeout: model.get('timeoutMax') * 2 });
        return model.validate();
      })
      .then(({ model }) => {
        assert.equal(model.get('validations.attrs.timeout.isValid'), false, 'timeout is too large');

        model.setProperties({ timeout: model.get('timeoutMax') - 10 });
        return model.validate();
      })
      .then(({ model }) => {
        assert.equal(model.get('validations.attrs.timeout.isValid'), true, 'timeout is valid');

        done();
      });
  });
});

test('validating away message suffix', function(assert) {
  run(() => {
    const done = assert.async(),
      obj = this.subject();

    obj
      .validate()
      .then(({ model }) => {
        assert.equal(
          model.get('validations.attrs.awayMessageSuffix.isValid'),
          true,
          'awayMessageSuffix does not need to be specified'
        );

        model.setProperties({
          awayMessageSuffix: Array(model.get('awayMessageSuffixMaxLength') * 2)
            .fill()
            .map(() => 'hi')
            .join(),
        });
        return model.validate();
      })
      .then(({ model }) => {
        assert.equal(
          model.get('validations.attrs.awayMessageSuffix.isValid'),
          false,
          'awayMessageSuffix is too long'
        );

        model.setProperties({ awayMessageSuffix: 'i am a reasonable suffix addendum' });
        return model.validate();
      })
      .then(({ model }) => {
        assert.equal(
          model.get('validations.attrs.awayMessageSuffix.isValid'),
          true,
          'awayMessageSuffix is valid'
        );

        done();
      });
  });
});
