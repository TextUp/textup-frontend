import OwnerPolicyUtils from 'textup-frontend/utils/owner-policy';
import { helper as buildHelper } from '@ember/component/helper';

export function ownerPolicyOthers([phone, staff]) {
  return OwnerPolicyUtils.getOthers(phone, staff);
}

export default buildHelper(ownerPolicyOthers);
