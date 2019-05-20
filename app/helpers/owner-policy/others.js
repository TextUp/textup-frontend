import { helper as buildHelper } from '@ember/component/helper';
import { get } from '@ember/object';
import ArrayUtils from 'textup-frontend/utils/array';
import TypeUtils from 'textup-frontend/utils/type';

export function ownerPolicyOthers([phone, staff]) {
  return TypeUtils.isPhone(phone) && TypeUtils.isStaff(staff)
    ? ArrayUtils.ensureArrayAndAllDefined(get(phone, 'policies')).filter(
        policy => get(policy, 'staffId') !== get(staff, 'id')
      )
    : [];
}

export default buildHelper(ownerPolicyOthers);
