import Ember from 'ember';
import TypeUtils from 'textup-frontend/utils/type';
import Constants from 'textup-frontend/constants';
import { mockModel } from 'textup-frontend/tests/helpers/utilities';
import { module, test } from 'qunit';

module('Unit | Utility | type');

test('determining if transition', function(assert) {
  assert.equal(TypeUtils.isTransition(), false);
  assert.equal(TypeUtils.isTransition('hi'), false);
  assert.equal(
    TypeUtils.isTransition({ abort: () => null, targetName: 'hi' }),
    false,
    'must be an `EmberObject`'
  );
  assert.equal(
    TypeUtils.isTransition(Ember.Object.create({ abort: () => null, targetName: 'hi' })),
    true
  );
  assert.equal(
    TypeUtils.isTransition(Ember.Object.create({ abort: 'hi', targetName: 'hi' })),
    false
  );
  assert.equal(
    TypeUtils.isTransition(Ember.Object.create({ abort: () => null, targetName: 123 })),
    false
  );
});

test('determining if model at all', function(assert) {
  const modelObj = mockModel(1, 'modelName');

  assert.equal(TypeUtils.isAnyModel(), false);
  assert.equal(TypeUtils.isAnyModel(null), false);
  assert.equal(TypeUtils.isAnyModel(1), false);
  assert.equal(TypeUtils.isAnyModel('hi'), false);
  assert.equal(TypeUtils.isAnyModel([]), false);
  assert.equal(TypeUtils.isAnyModel({}), false);
  assert.equal(TypeUtils.isAnyModel(Ember.Object.create()), false);

  assert.equal(TypeUtils.isAnyModel(modelObj), true);
});

test('determining if a specific model', function(assert) {
  assert.equal(TypeUtils.isOrg(), false);
  assert.equal(TypeUtils.isOrg(mockModel(1, Constants.MODEL.ORG)), true);

  assert.equal(TypeUtils.isTeam(), false);
  assert.equal(TypeUtils.isTeam(mockModel(1, Constants.MODEL.TEAM)), true);

  assert.equal(TypeUtils.isStaff(), false);
  assert.equal(TypeUtils.isStaff(mockModel(1, Constants.MODEL.STAFF)), true);

  assert.equal(TypeUtils.isPhone(), false);
  assert.equal(TypeUtils.isPhone(mockModel(1, Constants.MODEL.PHONE)), true);

  assert.equal(TypeUtils.isTag(), false);
  assert.equal(TypeUtils.isTag(mockModel(1, Constants.MODEL.TAG)), true);

  assert.equal(TypeUtils.isContact(), false);
  assert.equal(TypeUtils.isContact(mockModel(1, Constants.MODEL.CONTACT)), true);

  assert.equal(TypeUtils.isText(), false);
  assert.equal(TypeUtils.isText(mockModel(1, Constants.MODEL.RECORD_TEXT)), true);

  assert.equal(TypeUtils.isCall(), false);
  assert.equal(TypeUtils.isCall(mockModel(1, Constants.MODEL.RECORD_CALL)), true);

  assert.equal(TypeUtils.isNote(), false);
  assert.equal(TypeUtils.isNote(mockModel(1, Constants.MODEL.RECORD_NOTE)), true);

  assert.equal(TypeUtils.isSchedule(), false);
  assert.equal(TypeUtils.isSchedule(mockModel(1, Constants.MODEL.SCHEDULE)), true);
});
