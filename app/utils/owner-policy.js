import { get } from '@ember/object';
import ArrayUtils from 'textup-frontend/utils/array';
import TypeUtils from 'textup-frontend/utils/type';

export function getSelf(phone, staff) {
  return (
    TypeUtils.isPhone(phone) &&
    TypeUtils.isStaff(staff) &&
    ArrayUtils.ensureArrayAndAllDefined(phone.get('policies')).findBy('staffId', staff.get('id'))
  );
}

export function getOthers(phone, staff) {
  return TypeUtils.isPhone(phone) && TypeUtils.isStaff(staff)
    ? ArrayUtils.ensureArrayAndAllDefined(get(phone, 'policies')).filter(
        policy => get(policy, 'staffId') !== get(staff, 'id')
      )
    : [];
}
