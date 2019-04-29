import Constants from 'textup-frontend/constants';
import { mockModel } from 'textup-frontend/tests/helpers/utilities';
import { ownerPolicyOthers } from 'textup-frontend/helpers/owner-policy/others';
import { module, test } from 'qunit';

module('Unit | Helper | owner policy/others');

test('helper', function(assert) {
  const sId = Math.random(),
    staff1 = mockModel(sId, Constants.MODEL.STAFF),
    staff2 = mockModel(2, Constants.MODEL.STAFF),
    pol1 = { staffId: sId },
    phone1 = mockModel(1, Constants.MODEL.PHONE),
    phone2 = mockModel(1, Constants.MODEL.PHONE, { policies: [null, pol1] });

  assert.deepEqual(ownerPolicyOthers([]), []);
  assert.deepEqual(ownerPolicyOthers(['not phone', 'not staff']), []);

  assert.deepEqual(ownerPolicyOthers([phone1, staff1]), [], 'null policies array handled');

  assert.deepEqual(ownerPolicyOthers([phone2, staff1]), []);
  assert.deepEqual(ownerPolicyOthers([phone2, staff2]), [pol1]);
});
