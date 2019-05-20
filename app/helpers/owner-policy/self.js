import { helper as buildHelper } from '@ember/component/helper';
import ArrayUtils from 'textup-frontend/utils/array';
import TypeUtils from 'textup-frontend/utils/type';

export function ownerPolicySelf([phone, staff]) {
  return (
    TypeUtils.isPhone(phone) &&
    TypeUtils.isStaff(staff) &&
    ArrayUtils.ensureArrayAndAllDefined(phone.get('policies')).findBy('staffId', staff.get('id'))
  );
}

export default buildHelper(ownerPolicySelf);
