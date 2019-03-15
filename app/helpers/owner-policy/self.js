import * as TypeUtils from 'textup-frontend/utils/type';
import Ember from 'ember';

export function ownerPolicySelf([phone, staff]) {
  return (
    TypeUtils.isPhone(phone) &&
    TypeUtils.isStaff(staff) &&
    phone.get('policies').findBy('staffId', staff.get('id'))
  );
}

export default Ember.Helper.helper(ownerPolicySelf);
