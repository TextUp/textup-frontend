import * as ArrayUtils from 'textup-frontend/utils/array';
import * as TypeUtils from 'textup-frontend/utils/type';
import Ember from 'ember';

const { get } = Ember;

export function ownerPolicyOthers([phone, staff]) {
  return TypeUtils.isPhone(phone) && TypeUtils.isStaff(staff)
    ? ArrayUtils.ensureArrayAndAllDefined(get(phone, 'policies')).filter(
        policy => get(policy, 'staffId') !== get(staff, 'id')
      )
    : [];
}

export default Ember.Helper.helper(ownerPolicyOthers);
