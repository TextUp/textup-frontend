import OwnerPolicyUtils from 'textup-frontend/utils/owner-policy';
import { helper as buildHelper } from '@ember/component/helper';

export function ownerPolicySelf([phone, staff]) {
  return OwnerPolicyUtils.getSelf(phone, staff);
}

export default buildHelper(ownerPolicySelf);
