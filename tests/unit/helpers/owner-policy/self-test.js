import Constants from 'textup-frontend/constants';
import { mockModel } from 'textup-frontend/tests/helpers/utilities';
import { module, test } from 'qunit';
import { ownerPolicySelf } from 'textup-frontend/helpers/owner-policy/self';

module('Unit | Helper | owner policy/self');

test('helper', function(assert) {
  const sId = Math.random(),
    staff1 = mockModel(sId, Constants.MODEL.STAFF),
    staff2 = mockModel(2, Constants.MODEL.STAFF),
    pol1 = { staffId: sId },
    phone1 = mockModel(1, Constants.MODEL.PHONE),
    phone2 = mockModel(1, Constants.MODEL.PHONE, { policies: [null, pol1] });

  assert.notOk(ownerPolicySelf([]));
  assert.notOk(ownerPolicySelf(['not phone', 'not staff']));

  assert.notOk(ownerPolicySelf([phone1, staff1]), 'null policies array handled');

  assert.deepEqual(ownerPolicySelf([phone2, staff1]), pol1);
  assert.notOk(ownerPolicySelf([phone2, staff2]));
});
