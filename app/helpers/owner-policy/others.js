import * as TypeUtils from 'textup-frontend/utils/type';
import Ember from 'ember';

export function ownerPolicyOthers([phone, staff]) {
  return TypeUtils.isPhone(phone) && TypeUtils.isStaff(staff)
    ? phone.get('policies').filter(policy => policy.get('staffId') !== staff.get('id'))
    : [];
}

export default Ember.Helper.helper(ownerPolicyOthers);
